import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWorkoutSchema, insertWorkoutExerciseSchema, insertGoalSchema } from "@shared/schema";
import { z } from "zod";

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

  const httpServer = createServer(app);
  return httpServer;
}
