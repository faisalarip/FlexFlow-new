import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import { storage } from "./storage";
import { 
  insertWorkoutSchema, 
  insertWorkoutExerciseSchema, 
  insertGoalSchema,
  insertTrainerSchema,
  insertTrainerServiceSchema,
  insertBookingSchema,
  insertTrainerReviewSchema,
  insertFoodEntrySchema,
  insertMileTrackerSessionSchema,
  insertMileTrackerSplitSchema,
  insertCommunityPostSchema,
  insertMealPlanSchema,
  insertUserMealPlanSchema,
  insertPaymentSchema,
  insertUserMealPreferencesSchema,
  insertFoodItemSchema,
  insertUserFoodPreferenceSchema
} from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService } from "./objectStorage";
import { analyzeFoodImage } from "./foodRecognition";
import { generatePersonalizedMealPlan, generateWeeklyMealPlan } from "./mealPlanGenerator";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { autoDifficultyAdjuster } from "./auto-difficulty-adjuster";
import { authService } from "./auth-service";
import { authenticateToken, optionalAuth, getCurrentUserId as getAuthUserId } from "./auth-middleware";
import { signUpSchema, signInSchema } from "@shared/schema";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleData = {
          googleId: profile.id,
          email: profile.emails?.[0]?.value || "",
          firstName: profile.name?.givenName || "",
          lastName: profile.name?.familyName || "",
          profileImageUrl: profile.photos?.[0]?.value || "",
        };

        const result = await authService.signInWithGoogle(googleData);
        return done(null, result);
      } catch (error) {
        return done(error, null);
      }
    }));

    passport.serializeUser((user, done) => {
      done(null, user);
    });

    passport.deserializeUser((user, done) => {
      done(null, user as any);
    });

    app.use(passport.initialize());
  }

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // New Authentication Routes (Username/Password & Google)
  
  // Sign up with username/password
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const userData = signUpSchema.parse(req.body);
      const result = await authService.signUp(userData);
      
      res.status(201).json({
        message: "Account created successfully",
        user: result.user,
        token: result.token
      });
    } catch (error: any) {
      console.error("Sign up error:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          message: "Invalid input data",
          errors: error.errors
        });
      }
      
      res.status(400).json({
        message: error.message || "Failed to create account"
      });
    }
  });

  // Sign in with username/password
  app.post('/api/auth/signin', async (req, res) => {
    try {
      const credentials = signInSchema.parse(req.body);
      const result = await authService.signIn(credentials);
      
      res.json({
        message: "Signed in successfully",
        user: result.user,
        token: result.token
      });
    } catch (error: any) {
      console.error("Sign in error:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          message: "Invalid input data",
          errors: error.errors
        });
      }
      
      res.status(401).json({
        message: error.message || "Invalid credentials"
      });
    }
  });

  // Get current user (for JWT auth)
  app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });

  // Refresh token
  app.post('/api/auth/refresh', async (req, res) => {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ message: "Token required" });
      }
      
      const newToken = await authService.refreshToken(token);
      
      res.json({
        message: "Token refreshed successfully",
        token: newToken
      });
    } catch (error: any) {
      console.error("Token refresh error:", error);
      res.status(401).json({
        message: error.message || "Invalid token"
      });
    }
  });

  // Change password
  app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          message: "Current password and new password are required" 
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ 
          message: "New password must be at least 8 characters long" 
        });
      }
      
      await authService.changePassword(req.user!.id, currentPassword, newPassword);
      
      res.json({
        message: "Password changed successfully"
      });
    } catch (error: any) {
      console.error("Change password error:", error);
      res.status(400).json({
        message: error.message || "Failed to change password"
      });
    }
  });

  // Google OAuth Routes
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // Initiate Google OAuth
    app.get('/api/auth/google',
      passport.authenticate('google', { scope: ['profile', 'email'] })
    );

    // Google OAuth callback
    app.get('/api/auth/google/callback',
      passport.authenticate('google', { session: false }),
      (req: any, res) => {
        try {
          const authResult = req.user;
          
          // Send token back to frontend
          const frontendURL = process.env.NODE_ENV === 'production' 
            ? 'https://your-production-domain.com' 
            : 'http://localhost:5000';
          
          // Redirect to frontend with token as URL parameter
          res.redirect(`${frontendURL}?token=${authResult.token}&user=${encodeURIComponent(JSON.stringify(authResult.user))}`);
        } catch (error) {
          console.error("Google OAuth callback error:", error);
          res.redirect('/login?error=google_auth_failed');
        }
      }
    );
  }

  // Helper function to get current user ID from request (supports both auth methods)
  const getCurrentUserId = (req: any): string | null => {
    // Check JWT auth first
    if (req.user?.id) {
      return req.user.id;
    }
    // Fallback to Replit auth
    return req.user?.claims?.sub || null;
  };

  // Get exercises
  app.get("/api/exercises", async (req, res) => {
    try {
      const { category, search } = req.query;
      
      let exercises;
      if (search) {
        exercises = await storage.searchExercises(search as string);
      } else if (category) {
        exercises = await storage.getExercisesByCategory(category as string);
      } else {
        exercises = await storage.getExercises();
      }
      
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  // Get workouts
  app.get("/api/workouts", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const workouts = await storage.getWorkouts(userId);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  // Get workout by ID
  app.get("/api/workouts/:id", async (req, res) => {
    try {
      const workout = await storage.getWorkout(req.params.id);
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }
      res.json(workout);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout" });
    }
  });

  // Create workout
  app.post("/api/workouts", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const data = insertWorkoutSchema.parse({
        ...req.body,
        userId: userId,
        date: new Date(req.body.date || Date.now())
      });
      
      const workout = await storage.createWorkout(data);
      res.status(201).json(workout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workout data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workout" });
    }
  });

  // Add exercise to workout
  app.post("/api/workouts/:workoutId/exercises", async (req, res) => {
    try {
      const data = insertWorkoutExerciseSchema.parse({
        ...req.body,
        workoutId: req.params.workoutId
      });
      
      const workoutExercise = await storage.createWorkoutExercise(data);
      res.status(201).json(workoutExercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid exercise data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add exercise to workout" });
    }
  });

  // Get user stats
  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get advanced progress metrics
  app.get("/api/progress/metrics", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const metrics = await storage.getAdvancedProgressMetrics(userId);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress metrics" });
    }
  });

  // Get weight progress data for charts
  app.get("/api/progress/weight", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const weightProgress = await storage.getWeightProgressData(userId);
      res.json(weightProgress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weight progress" });
    }
  });

  // Get AI performance analytics data
  app.get("/api/performance-analytics/:timeframe", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { timeframe } = req.params;
      
      // Calculate date range based on timeframe
      const now = new Date();
      const startDate = new Date();
      switch (timeframe) {
        case "7d":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(now.getDate() - 30);
          break;
        case "90d":
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate.setDate(now.getDate() - 7);
      }

      // Get workouts in the specified timeframe
      const workouts = await storage.getWorkoutsByDateRange(userId, startDate, now);
      
      // Calculate performance trends and analytics
      const workoutsWithPerformance = workouts.map(workout => ({
        id: workout.id,
        name: workout.name,
        date: workout.date.toISOString(),
        difficultyLevel: workout.difficultyLevel || 3,
        perceivedExertion: workout.perceivedExertion || 5,
        completionRate: workout.completionRate || 100,
        performanceScore: workout.performanceScore || null,
        category: workout.category
      }));

      // Calculate trends
      const totalWorkouts = workoutsWithPerformance.length;
      const averageDifficulty = totalWorkouts > 0 
        ? workoutsWithPerformance.reduce((sum, w) => sum + w.difficultyLevel, 0) / totalWorkouts 
        : 0;
      const averageExertion = totalWorkouts > 0 
        ? workoutsWithPerformance.reduce((sum, w) => sum + w.perceivedExertion, 0) / totalWorkouts 
        : 0;
      const averageCompletion = totalWorkouts > 0 
        ? workoutsWithPerformance.reduce((sum, w) => sum + w.completionRate, 0) / totalWorkouts 
        : 0;

      // Determine difficulty trend
      let difficultyTrend: "improving" | "declining" | "stable" = "stable";
      if (totalWorkouts >= 3) {
        const firstHalf = workoutsWithPerformance.slice(0, Math.floor(totalWorkouts / 2));
        const secondHalf = workoutsWithPerformance.slice(Math.floor(totalWorkouts / 2));
        
        const firstHalfAvg = firstHalf.reduce((sum, w) => sum + w.difficultyLevel, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, w) => sum + w.difficultyLevel, 0) / secondHalf.length;
        
        if (secondHalfAvg > firstHalfAvg + 0.3) {
          difficultyTrend = "improving";
        } else if (secondHalfAvg < firstHalfAvg - 0.3) {
          difficultyTrend = "declining";
        }
      }

      // Calculate consistency score (based on workout frequency)
      const expectedWorkoutsPerWeek = 3; // Assume user should workout 3x per week
      const weeksInTimeframe = timeframe === "7d" ? 1 : timeframe === "30d" ? 4 : 12;
      const expectedWorkouts = expectedWorkoutsPerWeek * weeksInTimeframe;
      const consistencyScore = Math.min(100, Math.round((totalWorkouts / expectedWorkouts) * 100));

      const analyticsData = {
        workouts: workoutsWithPerformance.slice(0, 10), // Limit to recent 10 workouts
        trends: {
          difficultyTrend,
          consistencyScore,
          averageDifficulty: Math.round(averageDifficulty * 10) / 10,
          averageExertion: Math.round(averageExertion * 10) / 10,
          completionRate: Math.round(averageCompletion)
        }
      };

      res.json(analyticsData);
    } catch (error) {
      console.error("Failed to fetch performance analytics:", error);
      res.status(500).json({ message: "Failed to fetch performance analytics" });
    }
  });

  // Get AI difficulty recommendations for user
  app.get("/api/ai-recommendations", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const recommendations = await autoDifficultyAdjuster.getIntelligentRecommendations(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Failed to fetch AI recommendations:", error);
      res.status(500).json({ message: "Failed to fetch AI recommendations" });
    }
  });

  // Apply AI difficulty adjustments
  app.post("/api/ai-adjustments/apply", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { exerciseIds } = req.body;
      if (!Array.isArray(exerciseIds)) {
        return res.status(400).json({ message: "exerciseIds must be an array" });
      }

      const results = await autoDifficultyAdjuster.applyAutomaticAdjustments(userId, exerciseIds);
      const appliedCount = results.filter(r => r).length;

      res.json({ 
        message: `Applied ${appliedCount} difficulty adjustments`,
        appliedCount,
        totalRequested: exerciseIds.length,
        results
      });
    } catch (error) {
      console.error("Failed to apply AI adjustments:", error);
      res.status(500).json({ message: "Failed to apply AI adjustments" });
    }
  });

  // Get pending AI difficulty adjustments for user
  app.get("/api/ai-adjustments/pending", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const pendingAdjustments = await storage.getPendingAiAdjustments(userId);
      res.json(pendingAdjustments);
    } catch (error) {
      console.error("Failed to fetch pending adjustments:", error);
      res.status(500).json({ message: "Failed to fetch pending adjustments" });
    }
  });

  // Set up multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    },
  });

  // Update user profile with image upload
  app.post("/api/user/profile/upload", isAuthenticated, upload.single('profileImage'), async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const { firstName, lastName } = req.body;
      let profileImageUrl = null;
      
      // Handle file upload if present
      if (req.file) {
        const fileExtension = path.extname(req.file.originalname);
        const fileName = `profile-${userId}-${Date.now()}${fileExtension}`;
        
        // Store in uploads directory
        const uploadsDir = path.join(process.cwd(), 'uploads', 'profiles');
        const uploadPath = path.join(uploadsDir, fileName);
        
        try {
          // Ensure directory exists
          await fs.mkdir(uploadsDir, { recursive: true });
          // Write file
          await fs.writeFile(uploadPath, req.file.buffer);
          profileImageUrl = `/api/user/profile/image/${fileName}`;
        } catch (error) {
          console.error('File upload error:', error);
          return res.status(500).json({ message: "Failed to upload image" });
        }
      }
      
      const updates: any = {
        updatedAt: new Date()
      };
      
      if (firstName?.trim()) updates.firstName = firstName.trim();
      if (lastName?.trim()) updates.lastName = lastName.trim();
      if (profileImageUrl) updates.profileImageUrl = profileImageUrl;
      
      const updatedUser = await storage.updateUser(userId, updates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Serve profile images
  app.get("/api/user/profile/image/:filename", isAuthenticated, async (req, res) => {
    try {
      const { filename } = req.params;
      const uploadsDir = path.join(process.cwd(), 'uploads', 'profiles');
      const imagePath = path.join(uploadsDir, filename);
      
      try {
        await fs.access(imagePath);
        res.sendFile(path.resolve(imagePath));
      } catch (error) {
        res.status(404).json({ message: "Image not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to serve image" });
    }
  });

  // Update user profile (name only)
  app.patch("/api/user/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const { firstName, lastName } = req.body;
      if (!firstName?.trim() && !lastName?.trim()) {
        return res.status(400).json({ message: "First name or last name is required" });
      }
      
      const updatedUser = await storage.updateUser(userId, {
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        updatedAt: new Date()
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get goals
  app.get("/api/goals", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const goals = await storage.getGoals(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  // Create goal
  app.post("/api/goals", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const data = insertGoalSchema.parse({
        ...req.body,
        userId: userId
      });
      
      const goal = await storage.createGoal(data);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create goal" });
    }
  });
  
  // Update goal
  app.patch("/api/goals/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const { id } = req.params;
      const updates = req.body;
      
      const goal = await storage.updateGoal(id, updates);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  // Delete goal
  app.delete("/api/goals/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const { id } = req.params;
      
      const deleted = await storage.deleteGoal(id);
      if (!deleted) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      res.status(200).json({ message: "Goal deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          userId: userId
        }
      });
      
      // Store payment record
      await storage.createPayment({
        userId: userId,
        stripePaymentIntentId: paymentIntent.id,
        amount: Math.round(amount * 100),
        currency: "usd",
        status: "pending",
        description: "FlexFlow Premium Payment"
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Create subscription
  app.post('/api/get-or-create-subscription', isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      let user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // If user already has a subscription
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        const latestInvoice = await stripe.invoices.retrieve(subscription.latest_invoice as string, {
          expand: ['payment_intent'],
        });

        res.json({
          subscriptionId: subscription.id,
          clientSecret: latestInvoice.payment_intent && typeof latestInvoice.payment_intent === 'object' ? latestInvoice.payment_intent.client_secret : null,
        });
        return;
      }
      
      if (!user.email) {
        throw new Error('No user email on file');
      }

      // Create customer if not exists
      let customer;
      if (user.stripeCustomerId) {
        customer = await stripe.customers.retrieve(user.stripeCustomerId);
      } else {
        customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        });
        
        await storage.updateStripeCustomerId(userId, customer.id);
        user = await storage.getUser(userId); // Refresh user data
      }

      // Create subscription with 7-day trial
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price_data: {
            currency: 'usd',
            unit_amount: 1599, // $15.99 per month
            recurring: {
              interval: 'month'
            },
            product_data: {
              name: 'FlexFlow Premium',
            }
          }
        }],
        trial_period_days: 7, // 7-day free trial
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserStripeInfo(userId, customer.id, subscription.id);
  
      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      console.error('Subscription error:', error);
      return res.status(400).json({ error: { message: error.message } });
    }
  });

  // Create trial subscription for new users (no authentication required)
  app.post("/api/create-trial-subscription", async (req, res) => {
    try {
      // Create a customer for trial user
      const customer = await stripe.customers.create({
        email: `trial-${Date.now()}@flexflow.app`,
        metadata: {
          trial_user: 'true',
          signup_date: new Date().toISOString()
        }
      });

      // First create a product
      const product = await stripe.products.create({
        name: 'FlexFlow Premium',
        description: 'Complete fitness tracking and personal training platform'
      });

      // Then create a price for the product
      const price = await stripe.prices.create({
        unit_amount: 1599, // $15.99 per month
        currency: 'usd',
        recurring: {
          interval: 'month'
        },
        product: product.id
      });

      // Create a subscription with 10-day trial period
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: price.id
        }],
        trial_period_days: 10,
        // For trials, we don't need payment upfront
        collection_method: 'charge_automatically',
        expand: ['latest_invoice'],
      });

      res.json({
        subscriptionId: subscription.id,
        customerId: customer.id,
        trial: true,
        trialEnd: subscription.trial_end,
        // No client secret needed for trial subscriptions
        clientSecret: null,
      });
    } catch (error: any) {
      console.error('Trial subscription error:', error);
      res
        .status(500)
        .json({ message: "Error creating trial subscription: " + error.message });
    }
  });

  // Webhook for handling Stripe events
  app.post('/api/stripe-webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          await storage.updatePayment(
            paymentIntent.metadata.paymentId,
            { status: 'succeeded' }
          );
          break;
          
        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          await storage.updatePayment(
            failedPayment.metadata.paymentId,
            { status: 'failed' }
          );
          break;
          
        case 'invoice.payment_succeeded':
          const invoice = event.data.object as any;
          if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
            const customer = await stripe.customers.retrieve(subscription.customer as string);
            
            // Find user by Stripe customer ID and activate subscription
            const users = await storage.getUsers();
            const user = users.find(u => u.stripeCustomerId === customer.id);
            
            if (user) {
              const now = new Date();
              const nextExpiry = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days for paid subscription
              
              await storage.updateUser(user.id, {
                subscriptionStatus: "active",
                lastPaymentDate: now,
                subscriptionExpiresAt: nextExpiry
              });
              
              console.log(`Subscription activated for user ${user.id}`);
            }
          }
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ received: true });
  });

  // Update goal
  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const goal = await storage.updateGoal(req.params.id, req.body);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  // Get workouts by date range (for calendar)
  app.get("/api/workouts/range/:start/:end", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const startDate = new Date(req.params.start);
      const endDate = new Date(req.params.end);
      
      const workouts = await storage.getWorkoutsByDateRange(userId, startDate, endDate);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workouts for date range" });
    }
  });

  // Trainer Routes

  // Get all trainers with optional filtering
  app.get("/api/trainers", async (req, res) => {
    try {
      const { specialties, location, maxRate } = req.query;
      
      const filters: any = {};
      if (specialties) {
        filters.specialties = Array.isArray(specialties) ? specialties : [specialties];
      }
      if (location) filters.location = location as string;
      if (maxRate) filters.maxRate = parseInt(maxRate as string);
      
      const trainers = await storage.getTrainers(Object.keys(filters).length > 0 ? filters : undefined);
      res.json(trainers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trainers" });
    }
  });

  // Get trainer by ID
  app.get("/api/trainers/:id", async (req, res) => {
    try {
      const trainer = await storage.getTrainer(req.params.id);
      if (!trainer) {
        return res.status(404).json({ message: "Trainer not found" });
      }
      res.json(trainer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trainer" });
    }
  });

  // Create trainer profile
  app.post("/api/trainers", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const data = insertTrainerSchema.parse({
        ...req.body,
        userId: userId
      });
      
      const trainer = await storage.createTrainer(data);
      res.status(201).json(trainer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid trainer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create trainer profile" });
    }
  });

  // Update trainer profile
  app.patch("/api/trainers/:id", async (req, res) => {
    try {
      const trainer = await storage.updateTrainer(req.params.id, req.body);
      if (!trainer) {
        return res.status(404).json({ message: "Trainer not found" });
      }
      res.json(trainer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update trainer" });
    }
  });

  // Get trainer reviews
  app.get("/api/trainers/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getTrainerReviews(req.params.id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trainer reviews" });
    }
  });

  // Create trainer service
  app.post("/api/trainers/:trainerId/services", async (req, res) => {
    try {
      const data = insertTrainerServiceSchema.parse({
        ...req.body,
        trainerId: req.params.trainerId
      });
      
      const service = await storage.createTrainerService(data);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  // Booking Routes

  // Get user bookings
  app.get("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const bookings = await storage.getBookings(userId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Get booking by ID
  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  // Create booking
  app.post("/api/bookings", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const data = insertBookingSchema.parse({
        ...req.body,
        userId: userId,
        scheduledAt: new Date(req.body.scheduledAt)
      });
      
      const booking = await storage.createBooking(data);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Update booking status
  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.updateBooking(req.params.id, req.body);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // Create review for trainer
  app.post("/api/reviews", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const data = insertTrainerReviewSchema.parse({
        ...req.body,
        userId: userId
      });
      
      const review = await storage.createTrainerReview(data);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Food Routes

  // Get food entries for user
  app.get("/api/food-entries", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const { date } = req.query;
      const targetDate = date ? new Date(date as string) : undefined;
      
      const entries = await storage.getFoodEntries(userId, targetDate);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food entries" });
    }
  });

  // Get upload URL for food image
  app.post("/api/food/upload-url", async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  // Analyze food image
  app.post("/api/food/analyze", async (req, res) => {
    try {
      const { imageData } = req.body;
      
      if (!imageData) {
        return res.status(400).json({ message: "Image data is required" });
      }

      // Remove data URL prefix if present
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, "");
      
      const analysis = await analyzeFoodImage(base64Data);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing food:", error);
      res.status(500).json({ message: (error as Error).message || "Failed to analyze food image" });
    }
  });

  // Create food entry
  app.post("/api/food-entries", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const data = insertFoodEntrySchema.parse({
        ...req.body,
        userId: userId
      });
      
      const entry = await storage.createFoodEntry(data);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid food entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create food entry" });
    }
  });

  // Update food entry
  app.patch("/api/food-entries/:id", async (req, res) => {
    try {
      const entry = await storage.updateFoodEntry(req.params.id, req.body);
      if (!entry) {
        return res.status(404).json({ message: "Food entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to update food entry" });
    }
  });

  // Delete food entry
  app.delete("/api/food-entries/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteFoodEntry(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Food entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete food entry" });
    }
  });

  // Leaderboard Routes

  // Get leaderboard rankings
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Get current user's trainer profile
  app.get("/api/trainers/me", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const trainer = await storage.getTrainerByUserId(userId);
      if (!trainer) {
        return res.status(404).json({ message: "User is not a trainer" });
      }
      res.json(trainer);
    } catch (error) {
      console.error("Error fetching user trainer profile:", error);
      res.status(500).json({ message: "Failed to fetch trainer profile" });
    }
  });

  // Create trainer profile for current user
  app.post("/api/trainers", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      // Check if user is already a trainer
      const existingTrainer = await storage.getTrainerByUserId(userId);
      if (existingTrainer) {
        return res.status(400).json({ message: "User is already a trainer" });
      }

      const data = insertTrainerSchema.parse({
        ...req.body,
        userId: userId
      });
      
      const trainer = await storage.createTrainer(data);
      res.status(201).json(trainer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid trainer data", errors: error.errors });
      }
      console.error("Error creating trainer:", error);
      res.status(500).json({ message: "Failed to create trainer" });
    }
  });

  // Mile Tracker Routes

  // Get all mile tracker sessions for user
  app.get("/api/mile-tracker/sessions", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const sessions = await storage.getMileTrackerSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching mile tracker sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  // Get active mile tracker session
  app.get("/api/mile-tracker/sessions/active", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const activeSession = await storage.getActiveMileTrackerSession(userId);
      if (!activeSession) {
        return res.status(404).json({ message: "No active session found" });
      }
      res.json(activeSession);
    } catch (error) {
      console.error("Error fetching active mile tracker session:", error);
      res.status(500).json({ message: "Failed to fetch active session" });
    }
  });

  // Get specific mile tracker session
  app.get("/api/mile-tracker/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getMileTrackerSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error fetching mile tracker session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  // Start new mile tracker session
  app.post("/api/mile-tracker/sessions", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      // Check if there's already an active session
      const activeSession = await storage.getActiveMileTrackerSession(userId);
      if (activeSession) {
        return res.status(400).json({ message: "There's already an active session" });
      }

      const data = insertMileTrackerSessionSchema.parse({
        ...req.body,
        userId: userId,
        status: "active"
      });
      
      const session = await storage.createMileTrackerSession(data);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid session data", errors: error.errors });
      }
      console.error("Error creating mile tracker session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  // Update mile tracker session (for completing, pausing, etc.)
  app.patch("/api/mile-tracker/sessions/:id", async (req, res) => {
    try {
      const session = await storage.updateMileTrackerSession(req.params.id, req.body);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Error updating mile tracker session:", error);
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  // Add mile split to session
  app.post("/api/mile-tracker/sessions/:sessionId/splits", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const sessionId = req.params.sessionId;
      
      // Verify session exists and belongs to user
      const session = await storage.getMileTrackerSession(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ message: "Session not found" });
      }

      const data = insertMileTrackerSplitSchema.parse({
        ...req.body,
        sessionId
      });
      
      const split = await storage.createMileTrackerSplit(data);
      res.status(201).json(split);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid split data", errors: error.errors });
      }
      console.error("Error creating mile split:", error);
      res.status(500).json({ message: "Failed to create split" });
    }
  });

  // Community Routes

  // Get all community posts
  app.get("/api/community/posts", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const posts = await storage.getCommunityPosts(limit);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching community posts:", error);
      res.status(500).json({ message: "Failed to fetch community posts" });
    }
  });

  // Create new community post
  app.post("/api/community/posts", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const data = insertCommunityPostSchema.parse({
        ...req.body,
        userId: userId
      });
      
      const post = await storage.createCommunityPost(data);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid post data", errors: error.errors });
      }
      console.error("Error creating community post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  // Like a community post
  app.post("/api/community/posts/:id/like", async (req, res) => {
    try {
      const post = await storage.likeCommunityPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error liking community post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  // Meal Plan Routes

  // Get all meal plans (optionally filtered by goal)
  app.get("/api/meal-plans", async (req, res) => {
    try {
      const { goal } = req.query;
      const mealPlans = await storage.getMealPlans(goal as string);
      res.json(mealPlans);
    } catch (error) {
      console.error("Error fetching meal plans:", error);
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });

  // Get specific meal plan by ID
  app.get("/api/meal-plans/:id", async (req, res) => {
    try {
      const mealPlan = await storage.getMealPlan(req.params.id);
      if (!mealPlan) {
        return res.status(404).json({ message: "Meal plan not found" });
      }
      res.json(mealPlan);
    } catch (error) {
      console.error("Error fetching meal plan:", error);
      res.status(500).json({ message: "Failed to fetch meal plan" });
    }
  });

  // Create a new meal plan
  app.post("/api/meal-plans", async (req, res) => {
    try {
      const data = insertMealPlanSchema.parse(req.body);
      const mealPlan = await storage.createMealPlan(data);
      res.status(201).json(mealPlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid meal plan data", errors: error.errors });
      }
      console.error("Error creating meal plan:", error);
      res.status(500).json({ message: "Failed to create meal plan" });
    }
  });

  // Get current user's meal plan
  app.get("/api/user-meal-plan", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const userMealPlan = await storage.getUserMealPlan(userId);
      if (!userMealPlan) {
        return res.status(404).json({ message: "No active meal plan found" });
      }
      res.json(userMealPlan);
    } catch (error) {
      console.error("Error fetching user meal plan:", error);
      res.status(500).json({ message: "Failed to fetch user meal plan" });
    }
  });

  // Assign a meal plan to the current user
  app.post("/api/user-meal-plan", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      console.log("Assigning meal plan for user:", userId);
      console.log("Request body:", req.body);
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // Create a custom validation schema that handles date strings
      const mealPlanAssignmentSchema = insertUserMealPlanSchema.extend({
        startDate: z.union([z.date(), z.string().transform((str) => new Date(str))])
      });
      
      const data = mealPlanAssignmentSchema.parse({
        ...req.body,
        userId: userId
      });
      
      console.log("Parsed data:", data);
      
      const userMealPlan = await storage.assignMealPlan(data);
      console.log("Meal plan assigned successfully:", userMealPlan);
      
      res.status(201).json(userMealPlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ message: "Invalid assignment data", errors: error.errors });
      }
      console.error("Error assigning meal plan:", error);
      res.status(500).json({ message: "Failed to assign meal plan" });
    }
  });

  // Get user meal preferences
  app.get("/api/user-meal-preferences", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const preferences = await storage.getUserMealPreferences(userId);
      res.json(preferences || null);
    } catch (error) {
      console.error("Error fetching user meal preferences:", error);
      res.status(500).json({ message: "Failed to fetch meal preferences" });
    }
  });

  // Create or update user meal preferences
  app.post("/api/user-meal-preferences", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const data = insertUserMealPreferencesSchema.parse({
        ...req.body,
        userId: userId
      });

      // Check if preferences already exist
      const existing = await storage.getUserMealPreferences(userId);
      let preferences;
      
      if (existing) {
        preferences = await storage.updateUserMealPreferences(userId, data);
      } else {
        preferences = await storage.createUserMealPreferences(data);
      }
      
      res.json(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid preferences data", errors: error.errors });
      }
      console.error("Error saving meal preferences:", error);
      res.status(500).json({ message: "Failed to save meal preferences" });
    }
  });

  // Generate personalized meal plan using AI
  app.post("/api/generate-meal-plan", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { goal, dailyCalories, dietaryRestrictions, allergies, preferences, duration = 7 } = req.body;
      
      if (!goal || !dailyCalories) {
        return res.status(400).json({ message: "Goal and daily calories are required" });
      }

      // Generate the meal plan using AI
      const generatedPlan = await generatePersonalizedMealPlan({
        goal,
        dailyCalories,
        dietaryRestrictions: dietaryRestrictions || [],
        preferences: preferences || [],
        allergies: allergies || [],
        duration
      });

      // Save the generated meal plan to storage
      const mealPlan = await storage.createAIMealPlan(
        {
          name: generatedPlan.name,
          description: generatedPlan.description,
          goal: generatedPlan.goal,
          dailyCalories: generatedPlan.dailyCalories,
          dailyProtein: generatedPlan.dailyProtein,
          dailyCarbs: generatedPlan.dailyCarbs,
          dailyFat: generatedPlan.dailyFat,
          duration: generatedPlan.duration,
        },
        generatedPlan.days
      );

      // Update user preferences with last generation date
      await storage.updateUserMealPreferences(userId, {
        lastGeneratedAt: new Date(),
        goal,
        dailyCalories,
        dietaryRestrictions: dietaryRestrictions || [],
        allergies: allergies || [],
        preferences: preferences || []
      });

      // Automatically assign the new meal plan to the user
      await storage.assignMealPlan({
        userId,
        mealPlanId: mealPlan.id,
        startDate: new Date(),
        isActive: true
      });

      res.json({ mealPlan, message: "Meal plan generated and assigned successfully!" });
    } catch (error) {
      console.error("Error generating meal plan:", error);
      res.status(500).json({ message: "Failed to generate meal plan. Please try again." });
    }
  });

  // Generate weekly meal plans for users (background task)
  app.post("/api/generate-weekly-meal-plans", async (req, res) => {
    try {
      const usersForGeneration = await storage.getUsersForWeeklyMealPlanGeneration();
      const results = [];

      for (const { userId, preferences } of usersForGeneration) {
        try {
          const generatedPlan = await generateWeeklyMealPlan(userId, {
            goal: preferences.goal as "weight_loss" | "weight_gain" | "maintenance",
            dailyCalories: preferences.dailyCalories,
            dietaryRestrictions: preferences.dietaryRestrictions || [],
            preferences: preferences.preferences || [],
            allergies: preferences.allergies || []
          });

          // Save the generated meal plan
          const mealPlan = await storage.createAIMealPlan(
            {
              name: generatedPlan.name,
              description: generatedPlan.description,
              goal: generatedPlan.goal,
              dailyCalories: generatedPlan.dailyCalories,
              dailyProtein: generatedPlan.dailyProtein,
              dailyCarbs: generatedPlan.dailyCarbs,
              dailyFat: generatedPlan.dailyFat,
              duration: generatedPlan.duration,
            },
            generatedPlan.days
          );

          // Assign to user
          await storage.assignMealPlan({
            userId,
            mealPlanId: mealPlan.id,
            startDate: new Date(),
            isActive: true
          });

          // Update last generation date
          await storage.updateUserMealPreferences(userId, {
            lastGeneratedAt: new Date()
          });

          results.push({ userId, success: true, mealPlanId: mealPlan.id });
        } catch (error) {
          console.error(`Error generating meal plan for user ${userId}:`, error);
          results.push({ userId, success: false, error: (error as Error).message });
        }
      }

      res.json({ 
        message: `Generated meal plans for ${results.filter(r => r.success).length}/${results.length} users`,
        results 
      });
    } catch (error) {
      console.error("Error in weekly meal plan generation:", error);
      res.status(500).json({ message: "Failed to generate weekly meal plans" });
    }
  });

  // Commission tracking routes

  // Mark booking as paid and calculate commission
  app.post("/api/bookings/:id/mark-paid", async (req, res) => {
    try {
      const bookingId = req.params.id;
      const { totalPrice } = req.body;
      
      if (!totalPrice || typeof totalPrice !== "number" || totalPrice <= 0) {
        return res.status(400).json({ message: "Valid total price is required" });
      }
      
      const updatedBooking = await storage.markBookingAsPaid(bookingId, Math.round(totalPrice * 100)); // Convert to cents
      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json({
        ...updatedBooking,
        totalPrice: updatedBooking.totalPrice / 100, // Convert back to dollars for response
        trainerEarnings: (updatedBooking.trainerEarnings || 0) / 100,
        platformCommission: (updatedBooking.platformCommission || 0) / 100,
      });
    } catch (error) {
      console.error("Error marking booking as paid:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });

  // Get total platform commission earnings
  app.get("/api/admin/commissions", async (req, res) => {
    try {
      const commissionData = await storage.getTotalCommissions();
      res.json({
        totalCommissions: commissionData.totalCommissions / 100, // Convert to dollars
        totalBookings: commissionData.totalBookings,
        commissionRate: 15, // 15% commission rate
      });
    } catch (error) {
      console.error("Error fetching commission data:", error);
      res.status(500).json({ message: "Failed to fetch commission data" });
    }
  });

  // Trainer subscription management routes

  // Get current trainer subscription status
  app.get("/api/trainer/subscription", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const subscriptionStatus = await storage.getTrainerSubscriptionStatus(userId);
      if (!subscriptionStatus) {
        return res.status(404).json({ message: "Trainer not found" });
      }
      res.json(subscriptionStatus);
    } catch (error) {
      console.error("Error fetching trainer subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });

  // Activate trainer subscription (pay $25)
  app.post("/api/trainer/subscription/activate", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const updatedTrainer = await storage.activateTrainerSubscription(userId);
      if (!updatedTrainer) {
        return res.status(404).json({ message: "Trainer not found" });
      }
      
      const subscriptionStatus = await storage.getTrainerSubscriptionStatus(userId);
      res.json({
        message: "Subscription activated successfully",
        ...subscriptionStatus,
        monthlyFee: 25 // $25 per month
      });
    } catch (error) {
      console.error("Error activating subscription:", error);
      res.status(500).json({ message: "Failed to activate subscription" });
    }
  });

  // Cancel trainer subscription
  app.post("/api/trainer/subscription/cancel", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const updatedTrainer = await storage.cancelTrainerSubscription(userId);
      if (!updatedTrainer) {
        return res.status(404).json({ message: "Trainer not found" });
      }
      
      res.json({ message: "Subscription cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  // Get total subscription revenue (admin endpoint)
  app.get("/api/admin/subscription-revenue", async (req, res) => {
    try {
      const revenueData = await storage.getTotalSubscriptionRevenue();
      res.json({
        totalMonthlyRevenue: revenueData.totalRevenue / 100, // Convert to dollars
        activeTrainers: revenueData.activeTrainers,
        monthlyFeePerTrainer: 25, // $25 per trainer per month
      });
    } catch (error) {
      console.error("Error fetching subscription revenue:", error);
      res.status(500).json({ message: "Failed to fetch subscription revenue" });
    }
  });

  // User Subscription Routes

  // Get user subscription status
  app.get("/api/user/subscription", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const now = new Date();
      const isExpired = user.subscriptionExpiresAt && user.subscriptionExpiresAt < now;
      
      let effectiveStatus = user.subscriptionStatus;
      if (isExpired && user.subscriptionStatus !== "inactive") {
        effectiveStatus = "expired";
      }

      const subscriptionInfo = {
        subscriptionStatus: effectiveStatus,
        subscriptionStartDate: user.subscriptionStartDate,
        lastPaymentDate: user.lastPaymentDate,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        isActive: effectiveStatus === "free_trial" || effectiveStatus === "active",
        isFreeTrialActive: effectiveStatus === "free_trial" && !isExpired,
        daysRemaining: user.subscriptionExpiresAt 
          ? Math.max(0, Math.ceil((user.subscriptionExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : 0,
        monthlyFee: 15 // $15 per month for users
      };

      res.json(subscriptionInfo);
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription status" });
    }
  });

  // Activate paid subscription (after free trial or to reactivate)
  app.post("/api/user/subscription/activate", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const now = new Date();
      const nextExpiry = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now for paid subscription

      const updatedUser = await storage.updateUser(userId, {
        subscriptionStatus: "active",
        lastPaymentDate: now,
        subscriptionExpiresAt: nextExpiry
      });

      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update subscription" });
      }

      res.json({
        message: "Subscription activated successfully",
        subscriptionStatus: "active",
        lastPaymentDate: now,
        subscriptionExpiresAt: nextExpiry,
        monthlyFee: 15
      });
    } catch (error) {
      console.error("Error activating user subscription:", error);
      res.status(500).json({ message: "Failed to activate subscription" });
    }
  });

  // Cancel user subscription
  app.post("/api/user/subscription/cancel", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const updatedUser = await storage.updateUser(userId, {
        subscriptionStatus: "inactive"
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Subscription cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling user subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  // Get user subscription revenue (admin endpoint)
  app.get("/api/admin/user-subscription-revenue", async (req, res) => {
    try {
      const users = await storage.getUsers();
      const activeUsers = users.filter(user => 
        user.subscriptionStatus === "active" && 
        user.subscriptionExpiresAt && 
        user.subscriptionExpiresAt > new Date()
      );
      
      const totalMonthlyRevenue = activeUsers.length * 15; // $15 per user

      res.json({
        totalMonthlyRevenue: totalMonthlyRevenue,
        activeUsers: activeUsers.length,
        monthlyFeePerUser: 15, // $15 per user per month
        usersInFreeTrial: users.filter(user => user.subscriptionStatus === "free_trial").length
      });
    } catch (error) {
      console.error("Error fetching user subscription revenue:", error);
      res.status(500).json({ message: "Failed to fetch user subscription revenue" });
    }
  });

  // Food Items and Preferences API Routes
  
  // Get all food items with optional category filter
  app.get("/api/food-items", isAuthenticated, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const foodItems = await storage.getFoodItems(category);
      res.json(foodItems);
    } catch (error) {
      console.error("Error fetching food items:", error);
      res.status(500).json({ message: "Failed to fetch food items" });
    }
  });

  // Get food items with user preferences
  app.get("/api/food-items-with-preferences", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const category = req.query.category as string | undefined;
      const foodItems = await storage.getFoodItemsWithUserPreferences(userId, category);
      res.json(foodItems);
    } catch (error) {
      console.error("Error fetching food items with preferences:", error);
      res.status(500).json({ message: "Failed to fetch food items" });
    }
  });

  // Get user food preferences
  app.get("/api/user-food-preferences", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const preferences = await storage.getUserFoodPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching user food preferences:", error);
      res.status(500).json({ message: "Failed to fetch food preferences" });
    }
  });

  // Set user food preference
  app.post("/api/user-food-preference", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const data = insertUserFoodPreferenceSchema.parse({
        ...req.body,
        userId: userId
      });
      
      const preference = await storage.setUserFoodPreference(data);
      res.status(201).json(preference);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid preference data", errors: error.errors });
      }
      console.error("Error setting food preference:", error);
      res.status(500).json({ message: "Failed to set food preference" });
    }
  });

  // Generate AI meal plan based on food preferences
  app.post("/api/generate-personalized-meal-plan", isAuthenticated, async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const { goal, dailyCalories, duration = 7 } = req.body;
      
      if (!goal || !dailyCalories) {
        return res.status(400).json({ message: "Goal and daily calories are required" });
      }

      // Get user food preferences
      const userPreferences = await storage.getUserFoodPreferences(userId);
      const likedFoods = userPreferences
        .filter(pref => pref.preference === "like" || pref.preference === "love")
        .map(pref => pref.foodItemId);
      
      const dislikedFoods = userPreferences
        .filter(pref => pref.preference === "dislike" || pref.preference === "never")
        .map(pref => pref.foodItemId);

      // Get the actual food items
      const allFoodItems = await storage.getFoodItems();
      const likedFoodItems = allFoodItems.filter(item => likedFoods.includes(item.id));
      const dislikedFoodItems = allFoodItems.filter(item => dislikedFoods.includes(item.id));

      // Generate personalized meal plan using OpenAI
      const generatedPlan = await generatePersonalizedMealPlan({
        goal,
        dailyCalories: parseInt(dailyCalories),
        duration,
        likedFoods: likedFoodItems.map(item => item.name),
        dislikedFoods: dislikedFoodItems.map(item => item.name),
        userId
      });

      // Create the meal plan in storage
      const mealPlan = await storage.createAIMealPlan(
        {
          name: generatedPlan.name,
          description: generatedPlan.description,
          goal: generatedPlan.goal,
          dailyCalories: generatedPlan.dailyCalories,
          dailyProtein: generatedPlan.dailyProtein,
          dailyCarbs: generatedPlan.dailyCarbs,
          dailyFat: generatedPlan.dailyFat,
          duration: generatedPlan.duration,
          isActive: true,
        },
        generatedPlan.days
      );

      // Assign to user
      await storage.assignMealPlan({
        userId,
        mealPlanId: mealPlan.id,
        startDate: new Date(),
        isActive: true,
      });

      res.status(201).json({ 
        message: "Personalized meal plan generated successfully!", 
        mealPlan 
      });
    } catch (error: any) {
      console.error("Error generating personalized meal plan:", error);
      res.status(500).json({ 
        message: "Failed to generate personalized meal plan",
        details: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
