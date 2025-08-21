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
  insertFoodEntrySchema 
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

  const httpServer = createServer(app);
  return httpServer;
}
