import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  streak: integer("streak").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // strength, cardio, yoga, swimming
  description: text("description"),
  muscleGroups: text("muscle_groups").array(),
  equipment: text("equipment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workouts = pgTable("workouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  duration: integer("duration").notNull(), // in minutes
  caloriesBurned: integer("calories_burned").notNull(),
  notes: text("notes"),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workoutExercises = pgTable("workout_exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workoutId: varchar("workout_id").references(() => workouts.id).notNull(),
  exerciseId: varchar("exercise_id").references(() => exercises.id).notNull(),
  sets: integer("sets"),
  reps: integer("reps"),
  weight: integer("weight"), // in lbs
  distance: integer("distance"), // in meters
  duration: integer("duration"), // in seconds
  notes: text("notes"),
});

export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // workouts, minutes, calories
  target: integer("target").notNull(),
  current: integer("current").notNull().default(0),
  period: text("period").notNull().default("weekly"), // weekly, monthly
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  createdAt: true,
});

export const insertWorkoutExerciseSchema = createInsertSchema(workoutExercises).omit({
  id: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;

export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Workout = typeof workouts.$inferSelect;

export type InsertWorkoutExercise = z.infer<typeof insertWorkoutExerciseSchema>;
export type WorkoutExercise = typeof workoutExercises.$inferSelect;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

// Extended types for API responses
export type WorkoutWithExercises = Workout & {
  exercises: (WorkoutExercise & { exercise: Exercise })[];
};

export type UserStats = {
  totalWorkouts: number;
  totalHours: number;
  caloriesBurned: number;
  personalRecords: number;
};
