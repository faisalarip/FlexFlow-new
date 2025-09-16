import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  username: varchar("username").unique(),
  passwordHash: varchar("password_hash"), // For username/password auth
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  authProvider: varchar("auth_provider").default("local"), // 'local', 'google', 'replit'
  googleId: varchar("google_id").unique(), // Google OAuth ID
  isEmailVerified: boolean("is_email_verified").default(false),
  streak: integer("streak").notNull().default(0),
  subscriptionStatus: varchar("subscription_status").default("free_trial"), // free_trial, active, inactive, expired
  subscriptionStartDate: timestamp("subscription_start_date"),
  lastPaymentDate: timestamp("last_payment_date"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  personalPlanData: text("personal_plan_data"), // JSON string storing the user's personal plan and onboarding data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  difficultyLevel: integer("difficulty_level").default(3), // 1-5 scale (1=very easy, 5=very hard)
  perceivedExertion: integer("perceived_exertion"), // 1-10 RPE scale
  completionRate: integer("completion_rate").default(100), // percentage of workout completed
  aiDifficultyRecommendation: integer("ai_difficulty_recommendation"), // AI suggested difficulty for next workout
  performanceScore: integer("performance_score"), // AI calculated performance score
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
  targetSets: integer("target_sets"), // AI recommended sets
  targetReps: integer("target_reps"), // AI recommended reps  
  targetWeight: integer("target_weight"), // AI recommended weight
  targetDuration: integer("target_duration"), // AI recommended duration
  completed: boolean("completed").default(true), // whether exercise was completed
  difficultyAdjustment: integer("difficulty_adjustment").default(0), // -2 to +2 adjustment from base difficulty
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

// Payment history table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id").unique().notNull(),
  amount: integer("amount").notNull(), // in cents
  currency: varchar("currency").default("usd").notNull(),
  status: varchar("status").notNull(), // pending, succeeded, failed, canceled
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  subscriptionStatus: varchar("subscription_status").default("inactive"), // active, inactive, expired, grace_period
  lastPaymentDate: timestamp("last_payment_date"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
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
  status: text("status").notNull().default("pending"), // pending, confirmed, completed, cancelled, paid
  totalPrice: integer("total_price").notNull(), // in cents
  trainerEarnings: integer("trainer_earnings"), // in cents - what trainer gets after 15% commission
  platformCommission: integer("platform_commission"), // in cents - 15% commission for platform
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

// User activity logging for comprehensive tracking
export const userActivityLog = pgTable("user_activity_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  actionType: varchar("action_type").notNull(), // login, logout, workout_logged, goal_set, profile_updated, etc.
  actionDetails: text("action_details"), // JSON string with additional details
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  sessionId: varchar("session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UpsertUser = typeof users.$inferInsert;

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Authentication schemas
export const signUpSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  personalPlanData: z.any().optional(), // Optional personal plan data from onboarding
});

export const signInSchema = z.object({
  identifier: z.string().min(1), // can be username or email
  password: z.string().min(1),
});

export const googleAuthSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().url().optional(),
  googleId: z.string(),
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

export const insertUserActivityLogSchema = createInsertSchema(userActivityLog).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrainerSchema = createInsertSchema(trainers).omit({
  id: true,
  rating: true,
  totalReviews: true,
  subscriptionStatus: true,
  lastPaymentDate: true,
  subscriptionExpiresAt: true,
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

export type InsertUserActivityLog = z.infer<typeof insertUserActivityLogSchema>;
export type UserActivityLog = typeof userActivityLog.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

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
  user: Pick<User, "firstName" | "lastName" | "email">;
};

export type BookingWithDetails = Booking & {
  trainer: Pick<Trainer, "id" | "userId" | "bio" | "rating" | "totalReviews">;
  service: TrainerService;
  user: Pick<User, "firstName" | "lastName" | "email">;
};

export type TrainerReviewWithUser = TrainerReview & {
  user: Pick<User, "firstName" | "lastName" | "email">;
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
  firstName: string;
  lastName: string;
  email: string;
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

// Community Posts
export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  postType: text("post_type").notNull().default("message"), // message, workout_progress, goal_achievement
  workoutId: varchar("workout_id").references(() => workouts.id), // optional, for workout progress posts
  likes: integer("likes").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Community Posts insert schemas
export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  likes: true,
  createdAt: true,
});

// Community Posts types
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

// Extended types for API responses
export type CommunityPostWithUser = CommunityPost & {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    streak: number;
  };
  workout?: {
    id: string;
    name: string;
    category: string;
    duration: number;
    caloriesBurned: number;
  };
};

// Meal Plans
export const mealPlans = pgTable("meal_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  goal: text("goal").notNull(), // weight_loss, weight_gain, maintenance
  dailyCalories: integer("daily_calories").notNull(),
  dailyProtein: integer("daily_protein").notNull(), // grams
  dailyCarbs: integer("daily_carbs").notNull(), // grams
  dailyFat: integer("daily_fat").notNull(), // grams
  duration: integer("duration").notNull().default(7), // days
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mealPlanDays = pgTable("meal_plan_days", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mealPlanId: varchar("meal_plan_id").references(() => mealPlans.id).notNull(),
  dayNumber: integer("day_number").notNull(), // 1, 2, 3, etc.
  name: text("name").notNull(), // e.g., "Day 1", "Monday"
});

export const mealPlanMeals = pgTable("meal_plan_meals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mealPlanDayId: varchar("meal_plan_day_id").references(() => mealPlanDays.id).notNull(),
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner, snack
  name: text("name").notNull(),
  description: text("description"),
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(),
  carbs: integer("carbs").notNull(),
  fat: integer("fat").notNull(),
  ingredients: text("ingredients").array().notNull(),
  instructions: text("instructions").array(),
  prepTime: integer("prep_time"), // minutes
  servings: integer("servings").notNull().default(1),
});

export const userMealPlans = pgTable("user_meal_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  mealPlanId: varchar("meal_plan_id").references(() => mealPlans.id).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Food Items Database
export const foodItems = pgTable("food_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // fruits, vegetables, proteins, grains, dairy, etc.
  caloriesPer100g: integer("calories_per_100g").notNull(),
  proteinPer100g: integer("protein_per_100g").default(0), // grams
  carbsPer100g: integer("carbs_per_100g").default(0), // grams
  fatPer100g: integer("fat_per_100g").default(0), // grams
  fiberPer100g: integer("fiber_per_100g").default(0), // grams
  commonServingSize: text("common_serving_size"), // e.g., "1 medium apple (182g)"
  isCommon: boolean("is_common").default(true), // popular foods shown first
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Food Preferences
export const userFoodPreferences = pgTable("user_food_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  foodItemId: varchar("food_item_id").references(() => foodItems.id).notNull(),
  preference: text("preference").notNull(), // "like", "love", "dislike", "never"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Meal Plan insert schemas
export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({
  id: true,
  createdAt: true,
});

export const insertMealPlanDaySchema = createInsertSchema(mealPlanDays).omit({
  id: true,
});

export const insertMealPlanMealSchema = createInsertSchema(mealPlanMeals).omit({
  id: true,
});

export const insertUserMealPlanSchema = createInsertSchema(userMealPlans).omit({
  id: true,
  createdAt: true,
});

export const insertFoodItemSchema = createInsertSchema(foodItems).omit({
  id: true,
  createdAt: true,
});

export const insertUserFoodPreferenceSchema = createInsertSchema(userFoodPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Meal Plan types
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type MealPlan = typeof mealPlans.$inferSelect;

export type InsertMealPlanDay = z.infer<typeof insertMealPlanDaySchema>;
export type MealPlanDay = typeof mealPlanDays.$inferSelect;

export type InsertMealPlanMeal = z.infer<typeof insertMealPlanMealSchema>;
export type MealPlanMeal = typeof mealPlanMeals.$inferSelect;

export type InsertUserMealPlan = z.infer<typeof insertUserMealPlanSchema>;
export type UserMealPlan = typeof userMealPlans.$inferSelect;

export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;
export type FoodItem = typeof foodItems.$inferSelect;

export type InsertUserFoodPreference = z.infer<typeof insertUserFoodPreferenceSchema>;
export type UserFoodPreference = typeof userFoodPreferences.$inferSelect;

// Extended types for API responses
export type MealPlanWithDetails = MealPlan & {
  days: (MealPlanDay & {
    meals: MealPlanMeal[];
  })[];
};

export type UserMealPlanWithDetails = UserMealPlan & {
  mealPlan: MealPlanWithDetails;
};

export type FoodItemWithPreference = FoodItem & {
  userPreference?: UserFoodPreference;
};

// Calendar Notes
export const calendarNotes = pgTable("calendar_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: timestamp("date").notNull(), // The date this note is for
  note: text("note").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Calendar Notes insert schemas
export const insertCalendarNoteSchema = createInsertSchema(calendarNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Calendar Notes types
export type InsertCalendarNote = z.infer<typeof insertCalendarNoteSchema>;
export type CalendarNote = typeof calendarNotes.$inferSelect;

// User Meal Preferences for AI generation
export const userMealPreferences = pgTable("user_meal_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  goal: text("goal").notNull(), // weight_loss, weight_gain, maintenance
  dailyCalories: integer("daily_calories").notNull(),
  dietaryRestrictions: text("dietary_restrictions").array().default([]),
  allergies: text("allergies").array().default([]),
  preferences: text("preferences").array().default([]),
  lastGeneratedAt: timestamp("last_generated_at"),
  autoGenerate: boolean("auto_generate").default(true), // weekly auto-generation
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User Meal Preferences insert schemas
export const insertUserMealPreferencesSchema = createInsertSchema(userMealPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// User Meal Preferences types
export type InsertUserMealPreferences = z.infer<typeof insertUserMealPreferencesSchema>;
export type UserMealPreferences = typeof userMealPreferences.$inferSelect;

// AI Difficulty Adjustments for tracking performance and suggestions
export const aiDifficultyAdjustments = pgTable("ai_difficulty_adjustments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  exerciseId: varchar("exercise_id").references(() => exercises.id).notNull(),
  currentDifficulty: integer("current_difficulty").notNull().default(3), // 1-5 scale
  suggestedDifficulty: integer("suggested_difficulty").notNull(), // AI suggested difficulty
  confidenceScore: integer("confidence_score").notNull(), // 1-100 AI confidence in suggestion
  reasoningFactors: jsonb("reasoning_factors"), // JSON with factors: performance_trend, completion_rate, etc.
  performanceTrend: text("performance_trend"), // improving, declining, stable
  applied: boolean("applied").default(false), // whether user accepted the suggestion
  appliedAt: timestamp("applied_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI Difficulty Adjustments insert schemas
export const insertAiDifficultyAdjustmentSchema = createInsertSchema(aiDifficultyAdjustments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// AI Difficulty Adjustments types
export type InsertAiDifficultyAdjustment = z.infer<typeof insertAiDifficultyAdjustmentSchema>;
export type AiDifficultyAdjustment = typeof aiDifficultyAdjustments.$inferSelect;

// Authentication types
export type SignUpData = z.infer<typeof signUpSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type GoogleAuthData = z.infer<typeof googleAuthSchema>;
