import type { Express } from "express";
import { createServer, type Server } from "http";
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
  insertUserMealPlanSchema
} from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService } from "./objectStorage";
import { analyzeFoodImage } from "./foodRecognition";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock current user - in real app this would come from auth
  const CURRENT_USER_ID = "mock-user-1";

  // Initialize mock user if doesn't exist
  const existingUser = await storage.getUserByUsername("demo");
  if (!existingUser) {
    await storage.createUser({
      username: "demo",
      password: "demo",
      name: "John Doe",
      streak: 7
    });
  }

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
  app.get("/api/workouts", async (req, res) => {
    try {
      const workouts = await storage.getWorkouts(CURRENT_USER_ID);
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
  app.post("/api/workouts", async (req, res) => {
    try {
      const data = insertWorkoutSchema.parse({
        ...req.body,
        userId: CURRENT_USER_ID,
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
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getUserStats(CURRENT_USER_ID);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get goals
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getGoals(CURRENT_USER_ID);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  // Create goal
  app.post("/api/goals", async (req, res) => {
    try {
      const data = insertGoalSchema.parse({
        ...req.body,
        userId: CURRENT_USER_ID
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
  app.get("/api/workouts/range/:start/:end", async (req, res) => {
    try {
      const startDate = new Date(req.params.start);
      const endDate = new Date(req.params.end);
      
      const workouts = await storage.getWorkoutsByDateRange(CURRENT_USER_ID, startDate, endDate);
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
  app.post("/api/trainers", async (req, res) => {
    try {
      const data = insertTrainerSchema.parse({
        ...req.body,
        userId: CURRENT_USER_ID
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
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings(CURRENT_USER_ID);
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
  app.post("/api/bookings", async (req, res) => {
    try {
      const data = insertBookingSchema.parse({
        ...req.body,
        userId: CURRENT_USER_ID,
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
  app.post("/api/reviews", async (req, res) => {
    try {
      const data = insertTrainerReviewSchema.parse({
        ...req.body,
        userId: CURRENT_USER_ID
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
  app.get("/api/food-entries", async (req, res) => {
    try {
      const { date } = req.query;
      const targetDate = date ? new Date(date as string) : undefined;
      
      const entries = await storage.getFoodEntries(CURRENT_USER_ID, targetDate);
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
      res.status(500).json({ message: error.message || "Failed to analyze food image" });
    }
  });

  // Create food entry
  app.post("/api/food-entries", async (req, res) => {
    try {
      const data = insertFoodEntrySchema.parse({
        ...req.body,
        userId: CURRENT_USER_ID
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
  app.get("/api/trainers/me", async (req, res) => {
    try {
      const trainer = await storage.getTrainerByUserId(CURRENT_USER_ID);
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
  app.post("/api/trainers", async (req, res) => {
    try {
      // Check if user is already a trainer
      const existingTrainer = await storage.getTrainerByUserId(CURRENT_USER_ID);
      if (existingTrainer) {
        return res.status(400).json({ message: "User is already a trainer" });
      }

      const data = insertTrainerSchema.parse({
        ...req.body,
        userId: CURRENT_USER_ID
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
  app.get("/api/mile-tracker/sessions", async (req, res) => {
    try {
      const sessions = await storage.getMileTrackerSessions(CURRENT_USER_ID);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching mile tracker sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  // Get active mile tracker session
  app.get("/api/mile-tracker/sessions/active", async (req, res) => {
    try {
      const activeSession = await storage.getActiveMileTrackerSession(CURRENT_USER_ID);
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
  app.post("/api/mile-tracker/sessions", async (req, res) => {
    try {
      // Check if there's already an active session
      const activeSession = await storage.getActiveMileTrackerSession(CURRENT_USER_ID);
      if (activeSession) {
        return res.status(400).json({ message: "There's already an active session" });
      }

      const data = insertMileTrackerSessionSchema.parse({
        ...req.body,
        userId: CURRENT_USER_ID,
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
  app.post("/api/mile-tracker/sessions/:sessionId/splits", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      
      // Verify session exists and belongs to user
      const session = await storage.getMileTrackerSession(sessionId);
      if (!session || session.userId !== CURRENT_USER_ID) {
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
  app.post("/api/community/posts", async (req, res) => {
    try {
      const data = insertCommunityPostSchema.parse({
        ...req.body,
        userId: CURRENT_USER_ID
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
  app.get("/api/user-meal-plan", async (req, res) => {
    try {
      const userMealPlan = await storage.getUserMealPlan(CURRENT_USER_ID);
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
  app.post("/api/user-meal-plan", async (req, res) => {
    try {
      const data = insertUserMealPlanSchema.parse({
        ...req.body,
        userId: CURRENT_USER_ID
      });
      const userMealPlan = await storage.assignMealPlan(data);
      res.status(201).json(userMealPlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assignment data", errors: error.errors });
      }
      console.error("Error assigning meal plan:", error);
      res.status(500).json({ message: "Failed to assign meal plan" });
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
        commissionRate: 35, // 35% commission rate
      });
    } catch (error) {
      console.error("Error fetching commission data:", error);
      res.status(500).json({ message: "Failed to fetch commission data" });
    }
  });

  // Trainer subscription management routes

  // Get current trainer subscription status
  app.get("/api/trainer/subscription", async (req, res) => {
    try {
      const subscriptionStatus = await storage.getTrainerSubscriptionStatus(CURRENT_USER_ID);
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
  app.post("/api/trainer/subscription/activate", async (req, res) => {
    try {
      const updatedTrainer = await storage.activateTrainerSubscription(CURRENT_USER_ID);
      if (!updatedTrainer) {
        return res.status(404).json({ message: "Trainer not found" });
      }
      
      const subscriptionStatus = await storage.getTrainerSubscriptionStatus(CURRENT_USER_ID);
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
  app.post("/api/trainer/subscription/cancel", async (req, res) => {
    try {
      const updatedTrainer = await storage.cancelTrainerSubscription(CURRENT_USER_ID);
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
  app.get("/api/user/subscription", async (req, res) => {
    try {
      const user = await storage.getUser(CURRENT_USER_ID);
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
  app.post("/api/user/subscription/activate", async (req, res) => {
    try {
      const user = await storage.getUser(CURRENT_USER_ID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const now = new Date();
      const nextExpiry = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now

      const updatedUser = await storage.updateUser(CURRENT_USER_ID, {
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
  app.post("/api/user/subscription/cancel", async (req, res) => {
    try {
      const updatedUser = await storage.updateUser(CURRENT_USER_ID, {
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

  const httpServer = createServer(app);
  return httpServer;
}
