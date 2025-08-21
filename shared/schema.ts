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

export const trainers = pgTable("trainers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  bio: text("bio").notNull(),
  specialties: text("specialties").array().notNull(),
  certifications: text("certifications").array(),
  experience: integer("experience").notNull(), // years of experience
  hourlyRate: integer("hourly_rate").notNull(), // in cents
  location: text("location"),
  isActive: boolean("is_active").notNull().default(true),
  rating: integer("rating").default(0), // average rating * 100 (for precision)
  totalReviews: integer("total_reviews").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trainerServices = pgTable("trainer_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trainerId: varchar("trainer_id").references(() => trainers.id).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(), // in minutes
  price: integer("price").notNull(), // in cents
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  trainerId: varchar("trainer_id").references(() => trainers.id).notNull(),
  serviceId: varchar("service_id").references(() => trainerServices.id).notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, completed, cancelled
  totalPrice: integer("total_price").notNull(), // in cents
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trainerReviews = pgTable("trainer_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  trainerId: varchar("trainer_id").references(() => trainers.id).notNull(),
  bookingId: varchar("booking_id").references(() => bookings.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
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

export const insertTrainerSchema = createInsertSchema(trainers).omit({
  id: true,
  rating: true,
  totalReviews: true,
  createdAt: true,
});

export const insertTrainerServiceSchema = createInsertSchema(trainerServices).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertTrainerReviewSchema = createInsertSchema(trainerReviews).omit({
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

export type InsertTrainer = z.infer<typeof insertTrainerSchema>;
export type Trainer = typeof trainers.$inferSelect;

export type InsertTrainerService = z.infer<typeof insertTrainerServiceSchema>;
export type TrainerService = typeof trainerServices.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertTrainerReview = z.infer<typeof insertTrainerReviewSchema>;
export type TrainerReview = typeof trainerReviews.$inferSelect;

// Extended types for API responses
export type WorkoutWithExercises = Workout & {
  exercises: (WorkoutExercise & { exercise: Exercise })[];
};

export type TrainerWithServices = Trainer & {
  services: TrainerService[];
  user: Pick<User, "name" | "username">;
};

export type BookingWithDetails = Booking & {
  trainer: Pick<Trainer, "id" | "userId" | "bio" | "rating" | "totalReviews">;
  service: TrainerService;
  user: Pick<User, "name" | "username">;
};

export type TrainerReviewWithUser = TrainerReview & {
  user: Pick<User, "name" | "username">;
};

// Food entries for nutrition tracking
export const foodEntries = pgTable("food_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: varchar("name").notNull(),
  description: varchar("description"),
  calories: integer("calories").notNull(),
  protein: integer("protein").default(0), // grams
  carbs: integer("carbs").default(0), // grams
  fat: integer("fat").default(0), // grams
  fiber: integer("fiber").default(0), // grams
  sugar: integer("sugar").default(0), // grams
  sodium: integer("sodium").default(0), // mg
  servingSize: varchar("serving_size"), // e.g., "1 cup", "100g"
  imageUrl: varchar("image_url"), // URL to uploaded food image
  confidence: integer("confidence"), // AI confidence score (0-100)
  loggedAt: timestamp("logged_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for food entries
export const insertFoodEntrySchema = createInsertSchema(foodEntries).omit({
  id: true,
  createdAt: true,
});

export type InsertFoodEntry = z.infer<typeof insertFoodEntrySchema>;
export type FoodEntry = typeof foodEntries.$inferSelect;

export type UserStats = {
  totalWorkouts: number;
  totalHours: number;
  caloriesBurned: number;
  personalRecords: number;
};

export type LeaderboardEntry = {
  userId: string;
  username: string;
  name: string;
  totalReps: number;
  rank: number;
};

// Mile Tracker tables
export const mileTrackerSessions = pgTable("mile_tracker_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  activityType: text("activity_type").notNull(), // run, walk, bike
  totalDistance: integer("total_distance").notNull(), // distance in miles * 1000 (for precision)
  totalTime: integer("total_time").notNull(), // total time in seconds
  averagePace: integer("average_pace"), // average seconds per mile
  status: text("status").notNull().default("active"), // active, completed, paused
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mileTrackerSplits = pgTable("mile_tracker_splits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => mileTrackerSessions.id).notNull(),
  mileNumber: integer("mile_number").notNull(), // 1, 2, 3, etc.
  splitTime: integer("split_time").notNull(), // time for this mile in seconds
  cumulativeTime: integer("cumulative_time").notNull(), // total time up to this mile
  pace: integer("pace").notNull(), // seconds per mile for this split
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Mile Tracker insert schemas
export const insertMileTrackerSessionSchema = createInsertSchema(mileTrackerSessions).omit({
  id: true,
  createdAt: true,
});

export const insertMileTrackerSplitSchema = createInsertSchema(mileTrackerSplits).omit({
  id: true,
});

// Mile Tracker types
export type InsertMileTrackerSession = z.infer<typeof insertMileTrackerSessionSchema>;
export type MileTrackerSession = typeof mileTrackerSessions.$inferSelect;

export type InsertMileTrackerSplit = z.infer<typeof insertMileTrackerSplitSchema>;
export type MileTrackerSplit = typeof mileTrackerSplits.$inferSelect;

// Extended types for API responses
export type MileTrackerSessionWithSplits = MileTrackerSession & {
  splits: MileTrackerSplit[];
};
