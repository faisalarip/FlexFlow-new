import { 
  type User, 
  type InsertUser,
  type UpsertUser,
  type SignUpData,
  type SignInData,
  type Exercise,
  type InsertExercise,
  type Workout,
  type InsertWorkout,
  type WorkoutExercise,
  type InsertWorkoutExercise,
  type Goal,
  type InsertGoal,
  type Trainer,
  type InsertTrainer,
  type TrainerService,
  type InsertTrainerService,
  type Booking,
  type InsertBooking,
  type TrainerReview,
  type InsertTrainerReview,
  type WorkoutWithExercises,
  type TrainerWithServices,
  type BookingWithDetails,
  type TrainerReviewWithUser,
  type UserStats,
  type FoodEntry,
  type InsertFoodEntry,
  type LeaderboardEntry,
  type MileTrackerSession,
  type MileTrackerSplit,
  type MileTrackerSessionWithSplits,
  type InsertMileTrackerSession,
  type InsertMileTrackerSplit,
  type CommunityPost,
  type CommunityPostWithUser,
  type InsertCommunityPost,
  type MealPlan,
  type MealPlanWithDetails,
  type InsertMealPlan,
  type MealPlanDay,
  type InsertMealPlanDay,
  type MealPlanMeal,
  type InsertMealPlanMeal,
  type UserMealPlan,
  type UserMealPlanWithDetails,
  type FoodItem,
  type InsertFoodItem,
  type FoodItemWithPreference,
  type UserFoodPreference,
  type InsertUserFoodPreference,
  type InsertUserMealPlan,
  type Payment,
  type InsertPayment,
  type CalendarNote,
  type InsertCalendarNote,
  type UserMealPreferences,
  type InsertUserMealPreferences,
  type AiDifficultyAdjustment,
  type InsertAiDifficultyAdjustment,
  type UserActivityLog,
  type InsertUserActivityLog,
  type WorkoutPreferences,
  type InsertWorkoutPreferences,
  type WorkoutPlan,
  type InsertWorkoutPlan,
  type PlannedWorkout,
  type InsertPlannedWorkout,
  type MealEntry,
  type InsertMealEntry
} from "@shared/schema";
import { randomUUID } from "crypto";
import * as bcrypt from "bcrypt";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq, or } from "drizzle-orm";

export interface IStorage {
  // Users (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStreak(id: string, streak: number): Promise<User | undefined>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Authentication methods
  createUserWithPassword(userData: SignUpData): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsernameOrEmail(identifier: string): Promise<User | undefined>;
  verifyUserEmail(userId: string): Promise<User | undefined>;

  // Activity logging methods
  createUserActivity(activityData: InsertUserActivityLog): Promise<UserActivityLog>;
  getUserActivities(userId: string, limit?: number): Promise<UserActivityLog[]>;

  // Meal Tracking methods
  getMealEntries(userId: string, date?: string): Promise<MealEntry[]>;
  createMealEntry(entry: InsertMealEntry): Promise<MealEntry>;
  getMealEntry(id: string): Promise<MealEntry | undefined>;
  deleteMealEntry(id: string): Promise<boolean>;
  
  
  // Exercises
  getExercises(): Promise<Exercise[]>;
  getExercisesByCategory(category: string): Promise<Exercise[]>;
  searchExercises(query: string): Promise<Exercise[]>;
  getExercise(id: string): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  
  // Workouts
  getWorkouts(userId: string): Promise<Workout[]>;
  getWorkout(id: string): Promise<WorkoutWithExercises | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  getWorkoutsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Workout[]>;
  
  // Workout Exercises
  createWorkoutExercise(workoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise>;
  getWorkoutExercises(workoutId: string): Promise<(WorkoutExercise & { exercise: Exercise })[]>;
  
  // Goals
  getGoals(userId: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<boolean>;
  
  // Stats
  getUserStats(userId: string): Promise<UserStats>;
  getAdvancedProgressMetrics(userId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalWorkoutDays: number;
    consistencyPercentage30Days: number;
    consistencyPercentage7Days: number;
    workoutFrequency: { date: string; count: number }[];
    streakHistory: { start: string; end: string; length: number }[];
  }>;
  getWeightProgressData(userId: string): Promise<{
    exerciseNames: string[];
    maxWeights: number[];
    progressOverTime: { exerciseName: string; dates: string[]; weights: number[] }[];
  }>;
  
  // Leaderboard
  getLeaderboard(): Promise<LeaderboardEntry[]>;
  
  // Trainers
  getTrainers(filters?: { specialties?: string[], location?: string, maxRate?: number }): Promise<TrainerWithServices[]>;
  getTrainer(id: string): Promise<TrainerWithServices | undefined>;
  getTrainerByUserId(userId: string): Promise<Trainer | undefined>;
  createTrainer(trainer: InsertTrainer): Promise<Trainer>;
  updateTrainer(id: string, updates: Partial<Trainer>): Promise<Trainer | undefined>;
  
  // Trainer Services
  getTrainerServices(trainerId: string): Promise<TrainerService[]>;
  createTrainerService(service: InsertTrainerService): Promise<TrainerService>;
  updateTrainerService(id: string, updates: Partial<TrainerService>): Promise<TrainerService | undefined>;
  
  // Bookings
  getBookings(userId: string): Promise<BookingWithDetails[]>;
  getTrainerBookings(trainerId: string): Promise<BookingWithDetails[]>;
  getBooking(id: string): Promise<BookingWithDetails | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined>;
  
  // Reviews
  getTrainerReviews(trainerId: string): Promise<TrainerReviewWithUser[]>;
  createTrainerReview(review: InsertTrainerReview): Promise<TrainerReview>;
  updateTrainerRating(trainerId: string): Promise<void>;

  // Food entries
  getFoodEntries(userId: string, date?: Date): Promise<FoodEntry[]>;
  createFoodEntry(foodEntry: InsertFoodEntry): Promise<FoodEntry>;
  updateFoodEntry(id: string, updates: Partial<FoodEntry>): Promise<FoodEntry | undefined>;
  deleteFoodEntry(id: string): Promise<boolean>;

  // Mile Tracker
  getMileTrackerSessions(userId: string): Promise<MileTrackerSessionWithSplits[]>;
  getMileTrackerSession(id: string): Promise<MileTrackerSessionWithSplits | undefined>;
  getActiveMileTrackerSession(userId: string): Promise<MileTrackerSessionWithSplits | undefined>;
  createMileTrackerSession(session: InsertMileTrackerSession): Promise<MileTrackerSession>;
  updateMileTrackerSession(id: string, updates: Partial<MileTrackerSession>): Promise<MileTrackerSession | undefined>;
  createMileTrackerSplit(split: InsertMileTrackerSplit): Promise<MileTrackerSplit>;
  getMileTrackerSplits(sessionId: string): Promise<MileTrackerSplit[]>;
  
  // Community Posts
  getCommunityPosts(limit?: number): Promise<CommunityPostWithUser[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  likeCommunityPost(postId: string): Promise<CommunityPost | undefined>;

  // Meal Plans
  getMealPlans(goal?: string): Promise<MealPlanWithDetails[]>;
  getMealPlan(id: string): Promise<MealPlanWithDetails | undefined>;
  createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan>;
  getUserMealPlan(userId: string): Promise<UserMealPlanWithDetails | undefined>;
  assignMealPlan(userMealPlan: InsertUserMealPlan): Promise<UserMealPlan>;

  // Commission tracking
  getTotalCommissions(): Promise<{ totalCommissions: number; totalBookings: number }>;
  markBookingAsPaid(bookingId: string, totalPrice: number): Promise<Booking | undefined>;

  // Calendar Notes
  getCalendarNotes(userId: string, date?: Date): Promise<CalendarNote[]>;
  getCalendarNote(id: string): Promise<CalendarNote | undefined>;
  createCalendarNote(note: InsertCalendarNote): Promise<CalendarNote>;
  updateCalendarNote(id: string, updates: Partial<CalendarNote>): Promise<CalendarNote | undefined>;
  deleteCalendarNote(id: string): Promise<boolean>;

  // User Meal Preferences for AI generation
  getUserMealPreferences(userId: string): Promise<UserMealPreferences | undefined>;
  createUserMealPreferences(preferences: InsertUserMealPreferences): Promise<UserMealPreferences>;
  updateUserMealPreferences(userId: string, updates: Partial<UserMealPreferences>): Promise<UserMealPreferences | undefined>;
  getUsersForWeeklyMealPlanGeneration(): Promise<{ userId: string; preferences: UserMealPreferences }[]>;

  // AI Meal Plan Generation
  createAIMealPlan(mealPlan: InsertMealPlan, days: { dayNumber: number; name: string; meals: any[] }[]): Promise<MealPlan>;

  // Food Items and Preferences
  getFoodItems(category?: string): Promise<FoodItem[]>;
  createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem>;
  getFoodItemsWithUserPreferences(userId: string, category?: string): Promise<FoodItemWithPreference[]>;
  getUserFoodPreferences(userId: string): Promise<UserFoodPreference[]>;
  setUserFoodPreference(preference: InsertUserFoodPreference): Promise<UserFoodPreference>;
  updateUserFoodPreference(userId: string, foodItemId: string, preference: string): Promise<UserFoodPreference | undefined>;
  deleteUserFoodPreference(userId: string, foodItemId: string): Promise<boolean>;

  // AI Difficulty Adjustments
  getRecentWorkoutsForExercise(userId: string, exerciseId: string, limit: number): Promise<(Workout & { exercises: WorkoutExercise[] })[]>;
  createAiDifficultyAdjustment(adjustment: InsertAiDifficultyAdjustment): Promise<AiDifficultyAdjustment>;
  getPendingAiAdjustments(userId: string): Promise<AiDifficultyAdjustment[]>;
  applyAiDifficultyAdjustment(adjustmentId: string): Promise<boolean>;

  // Payment methods
  createPayment(insertPayment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined>;
  updateStripeCustomerId(userId: string, stripeCustomerId: string): Promise<User | undefined>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User | undefined>;

  // Trainer subscription methods
  getTrainerSubscriptionStatus(userId: string): Promise<{
    subscriptionStatus: string;
    lastPaymentDate?: Date;
    subscriptionExpiresAt?: Date;
    isActive: boolean;
  } | null>;
  activateTrainerSubscription(userId: string): Promise<Trainer | undefined>;
  cancelTrainerSubscription(userId: string): Promise<Trainer | undefined>;
  getTotalSubscriptionRevenue(): Promise<{ totalRevenue: number; activeTrainers: number }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private exercises: Map<string, Exercise> = new Map();
  private workouts: Map<string, Workout> = new Map();
  private workoutExercises: Map<string, WorkoutExercise> = new Map();
  private goals: Map<string, Goal> = new Map();
  private payments: Map<string, Payment> = new Map();
  private trainers: Map<string, Trainer> = new Map();
  private trainerServices: Map<string, TrainerService> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private trainerReviews: Map<string, TrainerReview> = new Map();
  private foodEntries: Map<string, FoodEntry> = new Map();
  private mileTrackerSessions: Map<string, MileTrackerSession> = new Map();
  private mileTrackerSplits: Map<string, MileTrackerSplit> = new Map();
  private communityPosts: Map<string, CommunityPost> = new Map();
  private mealPlans: Map<string, MealPlan> = new Map();
  private mealPlanDays: Map<string, MealPlanDay> = new Map();
  private mealPlanMeals: Map<string, MealPlanMeal> = new Map();
  private userMealPlans: Map<string, UserMealPlan> = new Map();
  private calendarNotes: Map<string, CalendarNote> = new Map();
  private userMealPreferences: Map<string, UserMealPreferences> = new Map();
  private foodItems: Map<string, FoodItem> = new Map();
  private userFoodPreferences: Map<string, UserFoodPreference> = new Map();
  private aiDifficultyAdjustments: Map<string, AiDifficultyAdjustment> = new Map();
  private mealEntries: Map<string, MealEntry> = new Map();

  constructor() {
    this.seedExercises();
    this.seedTrainers();
    this.seedMealPlans();
    this.seedFoodItems();
  }

  private seedExercises() {
    const defaultExercises: InsertExercise[] = [
      {
        name: "Push-ups",
        category: "strength",
        description: "Upper body bodyweight exercise",
        muscleGroups: ["chest", "triceps", "shoulders"],
        equipment: "bodyweight"
      },
      {
        name: "Squats",
        category: "strength", 
        description: "Lower body compound movement",
        muscleGroups: ["quadriceps", "glutes", "hamstrings"],
        equipment: "bodyweight"
      },
      {
        name: "Running",
        category: "cardio",
        description: "Cardiovascular endurance exercise",
        muscleGroups: ["legs", "cardiovascular"],
        equipment: "none"
      },
      {
        name: "Yoga Flow",
        category: "yoga",
        description: "Flexibility and mindfulness practice",
        muscleGroups: ["full body"],
        equipment: "yoga mat"
      },
      {
        name: "Deadlifts",
        category: "strength",
        description: "Full body compound lift",
        muscleGroups: ["hamstrings", "glutes", "back", "core"],
        equipment: "barbell"
      },
      {
        name: "Cycling",
        category: "cardio",
        description: "Low impact cardio exercise",
        muscleGroups: ["legs", "cardiovascular"],
        equipment: "bicycle"
      },
      {
        name: "Hip Thrusts",
        category: "strength",
        description: "PROPER FORM INSTRUCTIONS:\n\n1. SIT with your upper back against a bench, shoulder blades on the edge\n2. PLACE barbell or weight over your hips (use a pad for comfort)\n3. PLANT feet firmly on ground, shoulder-width apart, knees bent 90 degrees\n4. DRIVE through your heels to lift hips up, creating a straight line from knees to shoulders\n5. SQUEEZE glutes hard at the top position and hold for 1 second\n6. LOWER with control back to starting position\n\nKEY TIPS:\n• Focus on glute squeeze at the top\n• Keep your ribs down, don't overarch your back\n• Drive through your heels, not your toes\n• Keep your chin tucked, don't look up\n• Start with bodyweight before adding resistance",
        muscleGroups: ["glutes", "hamstrings", "core"],
        equipment: "bench"
      }
    ];

    defaultExercises.forEach(exercise => {
      const id = randomUUID();
      this.exercises.set(id, {
        ...exercise,
        id,
        description: exercise.description || null,
        muscleGroups: exercise.muscleGroups || null,
        equipment: exercise.equipment || null,
        createdAt: new Date()
      });
    });
  }

  private seedTrainers() {
    const defaultTrainers: (InsertTrainer & { id: string; services: Omit<InsertTrainerService, 'trainerId'>[] })[] = [
      {
        id: randomUUID(),
        userId: randomUUID(),
        bio: "Certified personal trainer with 8 years of experience specializing in strength training and weight loss.",
        specialties: ["strength", "weight-loss", "bodybuilding"],
        certifications: ["NASM-CPT", "Precision Nutrition Level 1"],
        experience: 8,
        hourlyRate: 8000, // $80/hour
        location: "Downtown Gym, City Center",
        isActive: true,
        services: [
          {
            name: "Personal Training Session",
            description: "One-on-one strength training and fitness coaching",
            duration: 60,
            price: 8000,
            isActive: true
          },
          {
            name: "Group Training Session",
            description: "Small group fitness training (2-4 people)",
            duration: 45,
            price: 5000,
            isActive: true
          }
        ]
      },
      {
        id: randomUUID(),
        userId: randomUUID(),
        bio: "Yoga instructor and wellness coach focused on flexibility, mindfulness, and stress relief.",
        specialties: ["yoga", "flexibility", "mindfulness"],
        certifications: ["RYT-500", "Mindfulness-Based Stress Reduction"],
        experience: 5,
        hourlyRate: 6000, // $60/hour
        location: "Zen Yoga Studio",
        isActive: true,
        services: [
          {
            name: "Yoga Session",
            description: "Personalized yoga practice focusing on flexibility and mindfulness",
            duration: 75,
            price: 7500,
            isActive: true
          },
          {
            name: "Meditation Coaching",
            description: "Guided meditation and mindfulness techniques",
            duration: 30,
            price: 3500,
            isActive: true
          }
        ]
      }
    ];

    defaultTrainers.forEach(trainerData => {
      const { services, ...trainerInfo } = trainerData;
      
      // Create user first
      const now = new Date();
      const isYogaTrainer = trainerInfo.specialties[0] === "yoga";
      const user: User = {
        id: trainerInfo.userId,
        email: isYogaTrainer ? "sarah@yogastudio.com" : "mike@fitnessclub.com",
        firstName: isYogaTrainer ? "Sarah" : "Mike",
        lastName: isYogaTrainer ? "Johnson" : "Thompson",
        profileImageUrl: null,
        streak: 0,
        subscriptionStatus: "free_trial",
        subscriptionStartDate: now,
        lastPaymentDate: null,
        subscriptionExpiresAt: new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)),
        createdAt: now,
        updatedAt: now,
      };
      this.users.set(user.id, user);

      // Create trainer
      const trainer: Trainer = {
        ...trainerInfo,
        certifications: trainerInfo.certifications || null,
        location: trainerInfo.location || null,
        isActive: trainerInfo.isActive !== undefined ? trainerInfo.isActive : true,
        rating: 450, // 4.5 stars * 100
        totalReviews: 12,
        createdAt: new Date()
      };
      this.trainers.set(trainer.id, trainer);

      // Create services
      services.forEach(serviceData => {
        const serviceId = randomUUID();
        const service: TrainerService = {
          ...serviceData,
          id: serviceId,
          trainerId: trainer.id,
          isActive: serviceData.isActive !== undefined ? serviceData.isActive : true,
          createdAt: new Date()
        };
        this.trainerServices.set(serviceId, service);
      });
    });
  }

  // Users (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    if (existingUser) {
      const updatedUser = {
        ...existingUser,
        ...userData,
        updatedAt: new Date(),
      };
      this.users.set(userData.id!, updatedUser);
      return updatedUser;
    } else {
      const now = new Date();
      const freeTrialExpiry = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days from now
      
      const user: User = {
        id: userData.id!,
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
        streak: userData.streak || 0,
        subscriptionStatus: userData.subscriptionStatus || "free_trial",
        subscriptionStartDate: userData.subscriptionStartDate || now,
        lastPaymentDate: userData.lastPaymentDate || null,
        subscriptionExpiresAt: userData.subscriptionExpiresAt || freeTrialExpiry,
        createdAt: userData.createdAt || now,
        updatedAt: now,
      };
      this.users.set(user.id, user);
      return user;
    }
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Since we don't have username anymore, search by email
    return Array.from(this.users.values()).find(user => user.email === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const freeTrialExpiry = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days from now
    
    const user: User = {
      ...insertUser,
      id,
      streak: insertUser.streak || 0,
      subscriptionStatus: insertUser.subscriptionStatus || "free_trial",
      subscriptionStartDate: insertUser.subscriptionStartDate || now,
      lastPaymentDate: insertUser.lastPaymentDate || null,
      subscriptionExpiresAt: insertUser.subscriptionExpiresAt || freeTrialExpiry,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStreak(id: string, streak: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, streak };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  async calculateUserStreak(userId: string): Promise<number> {
    const userWorkouts = await this.getWorkouts(userId);
    if (userWorkouts.length === 0) return 0;

    // Sort workouts by date (newest first)
    const sortedWorkouts = userWorkouts.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    // Get unique workout dates (only the date part, not time)
    const uniqueDates = [...new Set(sortedWorkouts.map(w => {
      const date = new Date(w.date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }))].sort().reverse(); // Sort dates in descending order

    if (uniqueDates.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Check if user worked out today or yesterday (to account for different time zones)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    let startDate = todayStr;
    if (uniqueDates[0] === todayStr) {
      // User worked out today, start counting from today
      startDate = todayStr;
    } else if (uniqueDates[0] === yesterdayStr) {
      // User's last workout was yesterday, start counting from yesterday  
      startDate = yesterdayStr;
    } else {
      // User hasn't worked out today or yesterday, streak is 0
      return 0;
    }

    // Count consecutive days starting from the most recent workout date
    let expectedDate = new Date(startDate);
    
    for (const workoutDate of uniqueDates) {
      const expectedDateStr = `${expectedDate.getFullYear()}-${String(expectedDate.getMonth() + 1).padStart(2, '0')}-${String(expectedDate.getDate()).padStart(2, '0')}`;
      
      if (workoutDate === expectedDateStr) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1); // Move to previous day
      } else {
        break; // Streak broken
      }
    }

    return streak;
  }

  async getAdvancedProgressMetrics(userId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
    totalWorkoutDays: number;
    consistencyPercentage30Days: number;
    consistencyPercentage7Days: number;
    workoutFrequency: { date: string; count: number }[];
    streakHistory: { start: string; end: string; length: number }[];
  }> {
    const userWorkouts = await this.getWorkouts(userId);
    const currentStreak = await this.calculateUserStreak(userId);
    
    if (userWorkouts.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalWorkoutDays: 0,
        consistencyPercentage30Days: 0,
        consistencyPercentage7Days: 0,
        workoutFrequency: [],
        streakHistory: []
      };
    }

    // Get unique workout dates
    const uniqueDates = [...new Set(userWorkouts.map(w => {
      const date = new Date(w.date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }))].sort();

    const totalWorkoutDays = uniqueDates.length;

    // Calculate longest streak and all streaks
    let longestStreak = 0;
    let streakHistory: { start: string; end: string; length: number }[] = [];
    
    if (uniqueDates.length > 0) {
      let currentStreakStart = uniqueDates[0];
      let currentStreakLength = 1;
      
      for (let i = 1; i < uniqueDates.length; i++) {
        const currentDate = new Date(uniqueDates[i]);
        const prevDate = new Date(uniqueDates[i - 1]);
        const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          // Consecutive day
          currentStreakLength++;
        } else {
          // Streak broken, record the streak
          if (currentStreakLength >= 1) {
            streakHistory.push({
              start: currentStreakStart,
              end: uniqueDates[i - 1],
              length: currentStreakLength
            });
            longestStreak = Math.max(longestStreak, currentStreakLength);
          }
          // Start new streak
          currentStreakStart = uniqueDates[i];
          currentStreakLength = 1;
        }
      }
      
      // Record the final streak
      if (currentStreakLength >= 1) {
        streakHistory.push({
          start: currentStreakStart,
          end: uniqueDates[uniqueDates.length - 1],
          length: currentStreakLength
        });
        longestStreak = Math.max(longestStreak, currentStreakLength);
      }
    }

    // Calculate consistency percentages
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const workoutDaysLast30 = uniqueDates.filter(dateStr => {
      const date = new Date(dateStr);
      return date >= thirtyDaysAgo && date <= today;
    }).length;
    
    const workoutDaysLast7 = uniqueDates.filter(dateStr => {
      const date = new Date(dateStr);
      return date >= sevenDaysAgo && date <= today;
    }).length;

    const consistencyPercentage30Days = Math.round((workoutDaysLast30 / 30) * 100);
    const consistencyPercentage7Days = Math.round((workoutDaysLast7 / 7) * 100);

    // Calculate workout frequency for last 30 days
    const workoutFrequency: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      const workoutCount = userWorkouts.filter(w => {
        const workoutDate = new Date(w.date);
        const workoutDateStr = `${workoutDate.getFullYear()}-${String(workoutDate.getMonth() + 1).padStart(2, '0')}-${String(workoutDate.getDate()).padStart(2, '0')}`;
        return workoutDateStr === dateStr;
      }).length;
      
      workoutFrequency.push({ date: dateStr, count: workoutCount });
    }

    return {
      currentStreak,
      longestStreak,
      totalWorkoutDays,
      consistencyPercentage30Days,
      consistencyPercentage7Days,
      workoutFrequency,
      streakHistory
    };
  }

  async getWeightProgressData(userId: string): Promise<{
    exerciseNames: string[];
    maxWeights: number[];
    progressOverTime: { exerciseName: string; dates: string[]; weights: number[] }[];
  }> {
    const userWorkouts = await this.getWorkouts(userId);
    
    if (userWorkouts.length === 0) {
      return {
        exerciseNames: [],
        maxWeights: [],
        progressOverTime: []
      };
    }

    // Get all workout exercises for this user
    const allWorkoutExercises: (WorkoutExercise & { exercise: Exercise; workoutDate: Date })[] = [];
    
    for (const workout of userWorkouts) {
      const workoutExercises = await this.getWorkoutExercises(workout.id);
      for (const we of workoutExercises) {
        if (we.weight && we.weight > 0) { // Only include exercises with weight data
          allWorkoutExercises.push({
            ...we,
            workoutDate: workout.date
          });
        }
      }
    }

    if (allWorkoutExercises.length === 0) {
      return {
        exerciseNames: [],
        maxWeights: [],
        progressOverTime: []
      };
    }

    // Group by exercise and find max weights
    const exerciseWeightMap = new Map<string, { maxWeight: number; records: { date: Date; weight: number }[] }>();
    
    for (const we of allWorkoutExercises) {
      const exerciseName = we.exercise.name;
      const weight = we.weight!;
      const date = we.workoutDate;
      
      if (!exerciseWeightMap.has(exerciseName)) {
        exerciseWeightMap.set(exerciseName, {
          maxWeight: weight,
          records: [{ date, weight }]
        });
      } else {
        const current = exerciseWeightMap.get(exerciseName)!;
        current.maxWeight = Math.max(current.maxWeight, weight);
        current.records.push({ date, weight });
      }
    }

    // Sort exercises by max weight (descending) and take top 8 for chart readability
    const sortedExercises = Array.from(exerciseWeightMap.entries())
      .sort(([, a], [, b]) => b.maxWeight - a.maxWeight)
      .slice(0, 8);

    const exerciseNames = sortedExercises.map(([name]) => name);
    const maxWeights = sortedExercises.map(([, data]) => data.maxWeight);

    // Create progress over time data for trending
    const progressOverTime = sortedExercises.map(([exerciseName, data]) => {
      // Sort records by date and get progression
      const sortedRecords = data.records.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      // Group by week to reduce noise and show clear progression
      const weeklyMaxes = new Map<string, number>();
      
      for (const record of sortedRecords) {
        // Get the start of the week for this date
        const weekStart = new Date(record.date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];
        
        const currentMax = weeklyMaxes.get(weekKey) || 0;
        weeklyMaxes.set(weekKey, Math.max(currentMax, record.weight));
      }
      
      // Convert to arrays for chart
      const sortedWeeks = Array.from(weeklyMaxes.entries()).sort((a, b) => a[0].localeCompare(b[0]));
      const dates = sortedWeeks.map(([date]) => date);
      const weights = sortedWeeks.map(([, weight]) => weight);
      
      return {
        exerciseName,
        dates,
        weights
      };
    });

    return {
      exerciseNames,
      maxWeights,
      progressOverTime
    };
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, ...updates };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  // Activity logging methods
  private userActivities = new Map<string, UserActivityLog[]>();

  async createUserActivity(activityData: InsertUserActivityLog): Promise<UserActivityLog> {
    const activity: UserActivityLog = {
      id: randomUUID(),
      ...activityData,
      createdAt: new Date(),
    };

    if (!this.userActivities.has(activityData.userId)) {
      this.userActivities.set(activityData.userId, []);
    }
    
    const userActivityList = this.userActivities.get(activityData.userId)!;
    userActivityList.unshift(activity); // Add to front for chronological order
    
    // Keep only the most recent 1000 activities per user to prevent memory issues
    if (userActivityList.length > 1000) {
      userActivityList.splice(1000);
    }

    return activity;
  }

  async getUserActivities(userId: string, limit: number = 100): Promise<UserActivityLog[]> {
    const userActivityList = this.userActivities.get(userId) || [];
    return userActivityList.slice(0, limit);
  }

  // Authentication methods
  async createUserWithPassword(userData: SignUpData): Promise<User> {
    try {
      
      // Check if username or email already exists
      const existingUser = await this.getUserByUsernameOrEmail(userData.username) || 
                          await this.getUserByUsernameOrEmail(userData.email);
      
      if (existingUser) {
        console.log("User already exists:", existingUser.username || existingUser.email);
        throw new Error("Username or email already exists");
      }

      const id = randomUUID();
      const now = new Date();
      const freeTrialExpiry = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days from now
      
      
      // Hash the password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      const user: User = {
        id,
        email: userData.email,
        username: userData.username,
        passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: null,
        authProvider: "local",
        isEmailVerified: false,
        streak: 0,
        subscriptionStatus: "free_trial",
        subscriptionStartDate: now,
        lastPaymentDate: null,
        subscriptionExpiresAt: freeTrialExpiry,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        personalPlanData: userData.personalPlanData ? JSON.stringify(userData.personalPlanData) : null,
        createdAt: now,
        updatedAt: now,
      };

      this.users.set(id, user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsernameOrEmail(identifier: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => 
      user.username === identifier || user.email === identifier
    );
  }


  async verifyUserEmail(userId: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = { ...user, isEmailVerified: true, updatedAt: new Date() };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  // Exercises
  async getExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }

  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).filter(ex => ex.category === category);
  }

  async searchExercises(query: string): Promise<Exercise[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.exercises.values()).filter(ex => 
      ex.name.toLowerCase().includes(lowerQuery) ||
      ex.category.toLowerCase().includes(lowerQuery) ||
      ex.description?.toLowerCase().includes(lowerQuery)
    );
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = randomUUID();
    const exercise: Exercise = {
      ...insertExercise,
      id,
      description: insertExercise.description || null,
      muscleGroups: insertExercise.muscleGroups || null,
      equipment: insertExercise.equipment || null,
      createdAt: new Date()
    };
    this.exercises.set(id, exercise);
    return exercise;
  }

  // Workouts
  async getWorkouts(userId: string): Promise<Workout[]> {
    return Array.from(this.workouts.values())
      .filter(workout => workout.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getWorkout(id: string): Promise<WorkoutWithExercises | undefined> {
    const workout = this.workouts.get(id);
    if (!workout) return undefined;

    const exercises = await this.getWorkoutExercises(id);
    return {
      ...workout,
      exercises
    };
  }

  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const id = randomUUID();
    const workout: Workout = {
      ...insertWorkout,
      id,
      notes: insertWorkout.notes || null,
      createdAt: new Date()
    };
    this.workouts.set(id, workout);
    
    // Recalculate and update user streak after adding workout
    const newStreak = await this.calculateUserStreak(insertWorkout.userId);
    await this.updateUserStreak(insertWorkout.userId, newStreak);
    
    return workout;
  }

  async getWorkoutsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Workout[]> {
    return Array.from(this.workouts.values()).filter(workout =>
      workout.userId === userId &&
      workout.date >= startDate &&
      workout.date <= endDate
    );
  }

  // Workout Exercises
  async createWorkoutExercise(insertWorkoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise> {
    const id = randomUUID();
    const workoutExercise: WorkoutExercise = {
      ...insertWorkoutExercise,
      id,
      sets: insertWorkoutExercise.sets || null,
      reps: insertWorkoutExercise.reps || null,
      weight: insertWorkoutExercise.weight || null,
      distance: insertWorkoutExercise.distance || null,
      duration: insertWorkoutExercise.duration || null,
      notes: insertWorkoutExercise.notes || null
    };
    this.workoutExercises.set(id, workoutExercise);
    return workoutExercise;
  }

  async getWorkoutExercises(workoutId: string): Promise<(WorkoutExercise & { exercise: Exercise })[]> {
    const workoutExercises = Array.from(this.workoutExercises.values())
      .filter(we => we.workoutId === workoutId);
    
    return workoutExercises.map(we => {
      const exercise = this.exercises.get(we.exerciseId);
      return {
        ...we,
        exercise: exercise!
      };
    });
  }

  // Goals
  async getGoals(userId: string): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(goal => goal.userId === userId);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const goal: Goal = {
      ...insertGoal,
      id,
      current: insertGoal.current || 0,
      period: insertGoal.period || "weekly",
      isActive: insertGoal.isActive !== undefined ? insertGoal.isActive : true,
      createdAt: new Date()
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (goal) {
      const updatedGoal = { ...goal, ...updates };
      this.goals.set(id, updatedGoal);
      return updatedGoal;
    }
    return undefined;
  }

  async deleteGoal(id: string): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Payment management
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = {
      ...insertPayment,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.payments.set(id, payment);
    return payment;
  }

  async getPayment(id: string): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentByStripeId(stripePaymentIntentId: string): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(p => p.stripePaymentIntentId === stripePaymentIntentId);
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (payment) {
      const updatedPayment = { ...payment, ...updates, updatedAt: new Date() };
      this.payments.set(id, updatedPayment);
      return updatedPayment;
    }
    return undefined;
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(p => p.userId === userId);
  }

  async updateStripeCustomerId(userId: string, stripeCustomerId: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = { ...user, stripeCustomerId };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (user) {
      const updatedUser = { ...user, stripeCustomerId, stripeSubscriptionId };
      this.users.set(userId, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  // Stats
  async getUserStats(userId: string): Promise<UserStats> {
    const userWorkouts = await this.getWorkouts(userId);
    
    const totalWorkouts = userWorkouts.length;
    const totalHours = Math.round(userWorkouts.reduce((sum, w) => sum + w.duration, 0) / 60);
    const caloriesBurned = userWorkouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
    
    // Count personal records (simplified - could be more sophisticated)
    const personalRecords = userWorkouts.filter(w => w.notes?.includes('PR')).length;

    return {
      totalWorkouts,
      totalHours,
      caloriesBurned,
      personalRecords
    };
  }

  // Trainers
  async getTrainers(filters?: { specialties?: string[], location?: string, maxRate?: number }): Promise<TrainerWithServices[]> {
    let trainers = Array.from(this.trainers.values()).filter(t => t.isActive);
    
    if (filters?.specialties?.length) {
      trainers = trainers.filter(t => 
        filters.specialties!.some(specialty => t.specialties.includes(specialty))
      );
    }
    
    if (filters?.location) {
      trainers = trainers.filter(t => 
        t.location?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    
    if (filters?.maxRate) {
      trainers = trainers.filter(t => t.hourlyRate <= filters.maxRate!);
    }

    return Promise.all(trainers.map(async trainer => {
      const services = await this.getTrainerServices(trainer.id);
      const user = await this.getUser(trainer.userId);
      return {
        ...trainer,
        services,
        user: { 
          email: user!.email || "", 
          firstName: user!.firstName || "", 
          lastName: user!.lastName || ""
        }
      };
    }));
  }

  async getTrainer(id: string): Promise<TrainerWithServices | undefined> {
    const trainer = this.trainers.get(id);
    if (!trainer) return undefined;

    const services = await this.getTrainerServices(id);
    const user = await this.getUser(trainer.userId);
    return {
      ...trainer,
      services,
      user: { 
        email: user!.email || "", 
        firstName: user!.firstName || "", 
        lastName: user!.lastName || ""
      }
    };
  }

  async getTrainerByUserId(userId: string): Promise<Trainer | undefined> {
    return Array.from(this.trainers.values()).find(t => t.userId === userId);
  }

  async createTrainer(insertTrainer: InsertTrainer): Promise<Trainer> {
    const id = randomUUID();
    const trainer: Trainer = {
      ...insertTrainer,
      id,
      certifications: insertTrainer.certifications || null,
      location: insertTrainer.location || null,
      isActive: insertTrainer.isActive !== undefined ? insertTrainer.isActive : true,
      rating: null,
      totalReviews: null,
      subscriptionStatus: "inactive",
      lastPaymentDate: null,
      subscriptionExpiresAt: null,
      createdAt: new Date()
    };
    this.trainers.set(id, trainer);
    return trainer;
  }

  async updateTrainer(id: string, updates: Partial<Trainer>): Promise<Trainer | undefined> {
    const trainer = this.trainers.get(id);
    if (trainer) {
      const updatedTrainer = { ...trainer, ...updates };
      this.trainers.set(id, updatedTrainer);
      return updatedTrainer;
    }
    return undefined;
  }

  // Trainer Services
  async getTrainerServices(trainerId: string): Promise<TrainerService[]> {
    return Array.from(this.trainerServices.values())
      .filter(s => s.trainerId === trainerId && s.isActive);
  }

  async createTrainerService(insertService: InsertTrainerService): Promise<TrainerService> {
    const id = randomUUID();
    const service: TrainerService = {
      ...insertService,
      id,
      isActive: insertService.isActive !== undefined ? insertService.isActive : true,
      createdAt: new Date()
    };
    this.trainerServices.set(id, service);
    return service;
  }

  async updateTrainerService(id: string, updates: Partial<TrainerService>): Promise<TrainerService | undefined> {
    const service = this.trainerServices.get(id);
    if (service) {
      const updatedService = { ...service, ...updates };
      this.trainerServices.set(id, updatedService);
      return updatedService;
    }
    return undefined;
  }

  // Bookings
  async getBookings(userId: string): Promise<BookingWithDetails[]> {
    const bookings = Array.from(this.bookings.values())
      .filter(b => b.userId === userId)
      .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());

    return Promise.all(bookings.map(async booking => {
      const trainer = this.trainers.get(booking.trainerId)!;
      const service = this.trainerServices.get(booking.serviceId)!;
      const user = this.users.get(booking.userId)!;
      
      return {
        ...booking,
        trainer: {
          id: trainer.id,
          userId: trainer.userId,
          bio: trainer.bio,
          rating: trainer.rating,
          totalReviews: trainer.totalReviews
        },
        service,
        user: { 
          email: user.email || "", 
          firstName: user.firstName || "", 
          lastName: user.lastName || ""
        }
      };
    }));
  }

  async getTrainerBookings(trainerId: string): Promise<BookingWithDetails[]> {
    const bookings = Array.from(this.bookings.values())
      .filter(b => b.trainerId === trainerId)
      .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());

    return Promise.all(bookings.map(async booking => {
      const trainer = this.trainers.get(booking.trainerId)!;
      const service = this.trainerServices.get(booking.serviceId)!;
      const user = this.users.get(booking.userId)!;
      
      return {
        ...booking,
        trainer: {
          id: trainer.id,
          userId: trainer.userId,
          bio: trainer.bio,
          rating: trainer.rating,
          totalReviews: trainer.totalReviews
        },
        service,
        user: { 
          email: user.email || "", 
          firstName: user.firstName || "", 
          lastName: user.lastName || ""
        }
      };
    }));
  }

  async getBooking(id: string): Promise<BookingWithDetails | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;

    const trainer = this.trainers.get(booking.trainerId)!;
    const service = this.trainerServices.get(booking.serviceId)!;
    const user = this.users.get(booking.userId)!;
    
    return {
      ...booking,
      trainer: {
        id: trainer.id,
        userId: trainer.userId,
        bio: trainer.bio,
        rating: trainer.rating,
        totalReviews: trainer.totalReviews
      },
      service,
      user: { 
        email: user.email || "", 
        firstName: user.firstName || "", 
        lastName: user.lastName || ""
      }
    };
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = {
      ...insertBooking,
      id,
      status: insertBooking.status || "pending",
      stripePaymentIntentId: insertBooking.stripePaymentIntentId || null,
      notes: insertBooking.notes || null,
      createdAt: new Date()
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (booking) {
      const updatedBooking = { ...booking, ...updates };
      this.bookings.set(id, updatedBooking);
      return updatedBooking;
    }
    return undefined;
  }

  // Reviews
  async getTrainerReviews(trainerId: string): Promise<TrainerReviewWithUser[]> {
    const reviews = Array.from(this.trainerReviews.values())
      .filter(r => r.trainerId === trainerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return reviews.map(review => {
      const user = this.users.get(review.userId)!;
      return {
        ...review,
        user: { 
          email: user.email || "", 
          firstName: user.firstName || "", 
          lastName: user.lastName || ""
        }
      };
    });
  }

  async createTrainerReview(insertReview: InsertTrainerReview): Promise<TrainerReview> {
    const id = randomUUID();
    const review: TrainerReview = {
      ...insertReview,
      id,
      comment: insertReview.comment || null,
      createdAt: new Date()
    };
    this.trainerReviews.set(id, review);
    
    // Update trainer rating
    await this.updateTrainerRating(insertReview.trainerId);
    
    return review;
  }

  async updateTrainerRating(trainerId: string): Promise<void> {
    const reviews = Array.from(this.trainerReviews.values()).filter(r => r.trainerId === trainerId);
    const trainer = this.trainers.get(trainerId);
    
    if (trainer && reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      const updatedTrainer = {
        ...trainer,
        rating: Math.round(avgRating * 100), // Store as integer (rating * 100)
        totalReviews: reviews.length
      };
      this.trainers.set(trainerId, updatedTrainer);
    }
  }

  // Food entries
  async getFoodEntries(userId: string, date?: Date): Promise<FoodEntry[]> {
    const entries = Array.from(this.foodEntries.values())
      .filter(entry => {
        if (entry.userId !== userId) return false;
        
        if (date) {
          const entryDate = entry.loggedAt ? new Date(entry.loggedAt) : new Date();
          const targetDate = new Date(date);
          return (
            entryDate.getFullYear() === targetDate.getFullYear() &&
            entryDate.getMonth() === targetDate.getMonth() &&
            entryDate.getDate() === targetDate.getDate()
          );
        }
        
        return true;
      })
      .sort((a, b) => (b.loggedAt ? new Date(b.loggedAt) : new Date()).getTime() - (a.loggedAt ? new Date(a.loggedAt) : new Date()).getTime());

    return entries;
  }

  async createFoodEntry(insertEntry: InsertFoodEntry): Promise<FoodEntry> {
    const id = randomUUID();
    const entry: FoodEntry = {
      id,
      userId: insertEntry.userId,
      name: insertEntry.name,
      description: insertEntry.description || null,
      calories: insertEntry.calories,
      protein: insertEntry.protein || null,
      carbs: insertEntry.carbs || null,
      fat: insertEntry.fat || null,
      fiber: insertEntry.fiber || null,
      sugar: insertEntry.sugar || null,
      sodium: insertEntry.sodium || null,
      servingSize: insertEntry.servingSize || null,
      imageUrl: insertEntry.imageUrl || null,
      confidence: insertEntry.confidence || null,
      loggedAt: insertEntry.loggedAt || new Date(),
      createdAt: new Date()
    };
    this.foodEntries.set(id, entry);
    return entry;
  }

  async updateFoodEntry(id: string, updates: Partial<FoodEntry>): Promise<FoodEntry | undefined> {
    const entry = this.foodEntries.get(id);
    if (entry) {
      const updatedEntry = { ...entry, ...updates };
      this.foodEntries.set(id, updatedEntry);
      return updatedEntry;
    }
    return undefined;
  }

  async deleteFoodEntry(id: string): Promise<boolean> {
    return this.foodEntries.delete(id);
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    // Calculate total reps for each user
    const userReps = new Map<string, number>();
    
    // Iterate through all workout exercises to sum up reps per user
    for (const workoutExercise of Array.from(this.workoutExercises.values())) {
      const workout = this.workouts.get(workoutExercise.workoutId);
      if (workout && workoutExercise.reps) {
        const currentReps = userReps.get(workout.userId) || 0;
        userReps.set(workout.userId, currentReps + workoutExercise.reps);
      }
    }

    // Convert to leaderboard entries with user details
    const leaderboardEntries: LeaderboardEntry[] = [];
    
    for (const [userId, totalReps] of Array.from(userReps.entries())) {
      const user = this.users.get(userId);
      if (user) {
        leaderboardEntries.push({
          userId: user.id,
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email?.split('@')[0] || 'Anonymous',
          totalReps,
          rank: 0 // Will be set after sorting
        });
      }
    }

    // Sort by total reps (descending) and assign ranks
    leaderboardEntries.sort((a, b) => b.totalReps - a.totalReps);
    leaderboardEntries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboardEntries;
  }

  // Mile Tracker Sessions
  async getMileTrackerSessions(userId: string): Promise<MileTrackerSessionWithSplits[]> {
    const sessions = Array.from(this.mileTrackerSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const sessionsWithSplits: MileTrackerSessionWithSplits[] = [];
    for (const session of sessions) {
      const splits = await this.getMileTrackerSplits(session.id);
      sessionsWithSplits.push({ ...session, splits });
    }

    return sessionsWithSplits;
  }

  async getMileTrackerSession(id: string): Promise<MileTrackerSessionWithSplits | undefined> {
    const session = this.mileTrackerSessions.get(id);
    if (!session) return undefined;

    const splits = await this.getMileTrackerSplits(session.id);
    return { ...session, splits };
  }

  async getActiveMileTrackerSession(userId: string): Promise<MileTrackerSessionWithSplits | undefined> {
    const activeSession = Array.from(this.mileTrackerSessions.values())
      .find(session => session.userId === userId && session.status === "active");
    
    if (!activeSession) return undefined;

    const splits = await this.getMileTrackerSplits(activeSession.id);
    return { ...activeSession, splits };
  }

  async createMileTrackerSession(session: InsertMileTrackerSession): Promise<MileTrackerSession> {
    const newSession: MileTrackerSession = {
      id: randomUUID(),
      ...session,
      createdAt: new Date(),
      startedAt: session.startedAt || new Date(),
    };
    
    this.mileTrackerSessions.set(newSession.id, newSession);
    return newSession;
  }

  async updateMileTrackerSession(id: string, updates: Partial<MileTrackerSession>): Promise<MileTrackerSession | undefined> {
    const session = this.mileTrackerSessions.get(id);
    if (!session) return undefined;

    const updatedSession = { ...session, ...updates };
    this.mileTrackerSessions.set(id, updatedSession);
    return updatedSession;
  }

  async createMileTrackerSplit(split: InsertMileTrackerSplit): Promise<MileTrackerSplit> {
    const newSplit: MileTrackerSplit = {
      id: randomUUID(),
      ...split,
      completedAt: split.completedAt || new Date(),
    };
    
    this.mileTrackerSplits.set(newSplit.id, newSplit);
    return newSplit;
  }

  async getMileTrackerSplits(sessionId: string): Promise<MileTrackerSplit[]> {
    return Array.from(this.mileTrackerSplits.values())
      .filter(split => split.sessionId === sessionId)
      .sort((a, b) => a.mileNumber - b.mileNumber);
  }

  // Community Posts
  async getCommunityPosts(limit: number = 50): Promise<CommunityPostWithUser[]> {
    const posts = Array.from(this.communityPosts.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    const postsWithUsers: CommunityPostWithUser[] = [];
    for (const post of posts) {
      const user = this.users.get(post.userId);
      if (user) {
        const postWithUser: CommunityPostWithUser = {
          ...post,
          user: {
            id: user.id,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || "",
            streak: user.streak,
          }
        };

        // Add workout info if it's a workout progress post
        if (post.workoutId) {
          const workout = this.workouts.get(post.workoutId);
          if (workout) {
            postWithUser.workout = {
              id: workout.id,
              name: workout.name,
              category: workout.category,
              duration: workout.duration,
              caloriesBurned: workout.caloriesBurned,
            };
          }
        }

        postsWithUsers.push(postWithUser);
      }
    }

    return postsWithUsers;
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const newPost: CommunityPost = {
      id: randomUUID(),
      ...post,
      likes: 0,
      createdAt: new Date(),
    };
    
    this.communityPosts.set(newPost.id, newPost);
    return newPost;
  }

  async likeCommunityPost(postId: string): Promise<CommunityPost | undefined> {
    const post = this.communityPosts.get(postId);
    if (!post) return undefined;

    const updatedPost = { ...post, likes: post.likes + 1 };
    this.communityPosts.set(postId, updatedPost);
    return updatedPost;
  }

  // Meal Plans
  async getMealPlans(goal?: string): Promise<MealPlanWithDetails[]> {
    const plans = Array.from(this.mealPlans.values())
      .filter(plan => plan.isActive && (!goal || plan.goal === goal));
    
    const plansWithDetails: MealPlanWithDetails[] = [];
    for (const plan of plans) {
      const days = Array.from(this.mealPlanDays.values())
        .filter(day => day.mealPlanId === plan.id)
        .sort((a, b) => a.dayNumber - b.dayNumber);
      
      const daysWithMeals = [];
      for (const day of days) {
        const meals = Array.from(this.mealPlanMeals.values())
          .filter(meal => meal.mealPlanDayId === day.id);
        daysWithMeals.push({ ...day, meals });
      }
      
      plansWithDetails.push({ ...plan, days: daysWithMeals });
    }
    
    return plansWithDetails;
  }

  async getMealPlan(id: string): Promise<MealPlanWithDetails | undefined> {
    const plan = this.mealPlans.get(id);
    if (!plan) return undefined;
    
    const days = Array.from(this.mealPlanDays.values())
      .filter(day => day.mealPlanId === plan.id)
      .sort((a, b) => a.dayNumber - b.dayNumber);
    
    const daysWithMeals = [];
    for (const day of days) {
      const meals = Array.from(this.mealPlanMeals.values())
        .filter(meal => meal.mealPlanDayId === day.id);
      daysWithMeals.push({ ...day, meals });
    }
    
    return { ...plan, days: daysWithMeals };
  }

  async createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan> {
    const newPlan: MealPlan = {
      id: randomUUID(),
      ...mealPlan,
      createdAt: new Date(),
    };
    
    this.mealPlans.set(newPlan.id, newPlan);
    return newPlan;
  }

  async getUserMealPlan(userId: string): Promise<UserMealPlanWithDetails | undefined> {
    const userPlan = Array.from(this.userMealPlans.values())
      .find(up => up.userId === userId && up.isActive);
    
    if (!userPlan) return undefined;
    
    const mealPlan = await this.getMealPlan(userPlan.mealPlanId);
    if (!mealPlan) return undefined;
    
    return { ...userPlan, mealPlan };
  }

  async assignMealPlan(userMealPlan: InsertUserMealPlan): Promise<UserMealPlan> {
    // Deactivate any existing active meal plan for this user
    for (const [id, plan] of this.userMealPlans.entries()) {
      if (plan.userId === userMealPlan.userId && plan.isActive) {
        this.userMealPlans.set(id, { ...plan, isActive: false });
      }
    }
    
    const newUserPlan: UserMealPlan = {
      id: randomUUID(),
      ...userMealPlan,
      createdAt: new Date(),
    };
    
    this.userMealPlans.set(newUserPlan.id, newUserPlan);
    return newUserPlan;
  }

  private seedMealPlans() {
    // Weight Loss Meal Plan
    const weightLossPlan = this.createMealPlanSync({
      name: "7-Day Weight Loss Plan",
      description: "A balanced meal plan designed to create a caloric deficit while maintaining proper nutrition.",
      goal: "weight_loss",
      dailyCalories: 1500,
      dailyProtein: 120,
      dailyCarbs: 150,
      dailyFat: 50,
      duration: 7,
      isActive: true,
    });

    // Weight Gain Meal Plan  
    const weightGainPlan = this.createMealPlanSync({
      name: "7-Day Weight Gain Plan",
      description: "A nutrient-dense meal plan to support healthy weight gain and muscle building.",
      goal: "weight_gain",
      dailyCalories: 2800,
      dailyProtein: 150,
      dailyCarbs: 350,
      dailyFat: 100,
      duration: 7,
      isActive: true,
    });

    // Moderate Weight Loss Plan
    const moderateWeightLossPlan = this.createMealPlanSync({
      name: "14-Day Moderate Weight Loss Plan",
      description: "A gentle approach to weight loss with sustainable eating habits and 1800 calories per day.",
      goal: "weight_loss",
      dailyCalories: 1800,
      dailyProtein: 135,
      dailyCarbs: 180,
      dailyFat: 70,
      duration: 14,
      isActive: true,
    });

    // Maintenance Plan
    const maintenancePlan = this.createMealPlanSync({
      name: "7-Day Balanced Maintenance Plan",
      description: "Perfect for maintaining current weight while eating nutritious, satisfying meals.",
      goal: "maintenance",
      dailyCalories: 2200,
      dailyProtein: 110,
      dailyCarbs: 275,
      dailyFat: 85,
      duration: 7,
      isActive: true,
    });

    // High Protein Muscle Building Plan
    const muscleBuildingPlan = this.createMealPlanSync({
      name: "7-Day Muscle Building Plan",
      description: "High-protein meal plan designed for muscle growth and strength training support.",
      goal: "weight_gain",
      dailyCalories: 3200,
      dailyProtein: 180,
      dailyCarbs: 400,
      dailyFat: 115,
      duration: 7,
      isActive: true,
    });

    // Quick Weight Loss Plan
    const quickWeightLossPlan = this.createMealPlanSync({
      name: "5-Day Quick Start Plan",
      description: "A short-term plan to kickstart your weight loss journey with clean eating.",
      goal: "weight_loss",
      dailyCalories: 1400,
      dailyProtein: 105,
      dailyCarbs: 140,
      dailyFat: 45,
      duration: 5,
      isActive: true,
    });

    // Flexible Maintenance Plan
    const flexibleMaintenancePlan = this.createMealPlanSync({
      name: "21-Day Flexible Living Plan",
      description: "A longer-term maintenance plan with variety to fit your lifestyle.",
      goal: "maintenance",
      dailyCalories: 2400,
      dailyProtein: 120,
      dailyCarbs: 300,
      dailyFat: 95,
      duration: 21,
      isActive: true,
    });

    // Add days and meals for all plans
    this.seedWeightLossMealPlan(weightLossPlan.id);
    this.seedWeightGainMealPlan(weightGainPlan.id);
    this.seedGeneralMealPlan(moderateWeightLossPlan.id, "weight_loss", moderateWeightLossPlan.dailyCalories, 14);
    this.seedGeneralMealPlan(maintenancePlan.id, "maintenance", maintenancePlan.dailyCalories, 7);
    this.seedGeneralMealPlan(muscleBuildingPlan.id, "weight_gain", muscleBuildingPlan.dailyCalories, 10);
    this.seedGeneralMealPlan(quickWeightLossPlan.id, "weight_loss", quickWeightLossPlan.dailyCalories, 5);
    this.seedGeneralMealPlan(flexibleMaintenancePlan.id, "maintenance", flexibleMaintenancePlan.dailyCalories, 21);
  }

  private createMealPlanSync(mealPlan: InsertMealPlan): MealPlan {
    const newPlan: MealPlan = {
      id: randomUUID(),
      ...mealPlan,
      createdAt: new Date(),
    };
    
    this.mealPlans.set(newPlan.id, newPlan);
    return newPlan;
  }

  private seedWeightLossMealPlan(planId: string) {
    for (let day = 1; day <= 7; day++) {
      const dayId = randomUUID();
      const mealPlanDay: MealPlanDay = {
        id: dayId,
        mealPlanId: planId,
        dayNumber: day,
        name: `Day ${day}`,
      };
      this.mealPlanDays.set(dayId, mealPlanDay);

      // Sample meals for weight loss
      const meals = [
        {
          mealType: "breakfast",
          name: "Greek Yogurt Bowl",
          description: "Low-fat Greek yogurt with berries and almonds",
          calories: 300,
          protein: 20,
          carbs: 30,
          fat: 8,
          ingredients: ["Greek yogurt (1 cup)", "Mixed berries (1/2 cup)", "Sliced almonds (1 tbsp)", "Honey (1 tsp)"],
          instructions: ["Mix yogurt with honey", "Top with berries and almonds"],
          prepTime: 5,
          servings: 1,
        },
        {
          mealType: "lunch",
          name: "Grilled Chicken Salad",
          description: "Mixed greens with grilled chicken and light dressing",
          calories: 400,
          protein: 35,
          carbs: 15,
          fat: 20,
          ingredients: ["Grilled chicken breast (4oz)", "Mixed greens (2 cups)", "Cherry tomatoes (1/2 cup)", "Cucumber (1/2 cup)", "Olive oil dressing (2 tbsp)"],
          instructions: ["Grill chicken breast", "Mix greens and vegetables", "Top with chicken and dressing"],
          prepTime: 15,
          servings: 1,
        },
        {
          mealType: "dinner",
          name: "Baked Salmon with Vegetables",
          description: "Herb-crusted salmon with roasted vegetables",
          calories: 450,
          protein: 40,
          carbs: 25,
          fat: 18,
          ingredients: ["Salmon fillet (5oz)", "Broccoli (1 cup)", "Sweet potato (1/2 medium)", "Olive oil (1 tbsp)", "Herbs and spices"],
          instructions: ["Season salmon with herbs", "Roast vegetables at 400°F", "Bake salmon for 15 minutes"],
          prepTime: 25,
          servings: 1,
        },
        {
          mealType: "snack",
          name: "Apple with Almond Butter",
          description: "Fresh apple slices with natural almond butter",
          calories: 200,
          protein: 6,
          carbs: 25,
          fat: 8,
          ingredients: ["Apple (1 medium)", "Almond butter (1 tbsp)"],
          instructions: ["Slice apple", "Serve with almond butter for dipping"],
          prepTime: 2,
          servings: 1,
        },
      ];

      meals.forEach(meal => {
        const mealId = randomUUID();
        const mealPlanMeal: MealPlanMeal = {
          id: mealId,
          mealPlanDayId: dayId,
          ...meal,
        };
        this.mealPlanMeals.set(mealId, mealPlanMeal);
      });
    }
  }

  private seedWeightGainMealPlan(planId: string) {
    for (let day = 1; day <= 7; day++) {
      const dayId = randomUUID();
      const mealPlanDay: MealPlanDay = {
        id: dayId,
        mealPlanId: planId,
        dayNumber: day,
        name: `Day ${day}`,
      };
      this.mealPlanDays.set(dayId, mealPlanDay);

      // Sample meals for weight gain
      const meals = [
        {
          mealType: "breakfast",
          name: "Protein Pancakes",
          description: "High-protein pancakes with peanut butter and banana",
          calories: 550,
          protein: 30,
          carbs: 45,
          fat: 20,
          ingredients: ["Oat flour (1/2 cup)", "Protein powder (1 scoop)", "Banana (1 large)", "Eggs (2 whole)", "Peanut butter (2 tbsp)", "Milk (1/4 cup)"],
          instructions: ["Mix dry ingredients", "Blend wet ingredients", "Cook pancakes on medium heat", "Top with peanut butter"],
          prepTime: 15,
          servings: 1,
        },
        {
          mealType: "lunch",
          name: "Quinoa Power Bowl",
          description: "Quinoa with grilled chicken, avocado, and nuts",
          calories: 650,
          protein: 35,
          carbs: 50,
          fat: 28,
          ingredients: ["Quinoa (1 cup cooked)", "Grilled chicken (4oz)", "Avocado (1/2 medium)", "Mixed nuts (1/4 cup)", "Olive oil (1 tbsp)", "Vegetables (1 cup)"],
          instructions: ["Cook quinoa according to package", "Grill chicken breast", "Assemble bowl with all ingredients"],
          prepTime: 20,
          servings: 1,
        },
        {
          mealType: "dinner",
          name: "Steak with Sweet Potato",
          description: "Lean beef with roasted sweet potato and vegetables",
          calories: 700,
          protein: 45,
          carbs: 40,
          fat: 30,
          ingredients: ["Lean beef steak (6oz)", "Sweet potato (1 large)", "Green beans (1 cup)", "Butter (1 tbsp)", "Olive oil (1 tbsp)"],
          instructions: ["Season and grill steak", "Roast sweet potato at 425°F", "Sauté green beans", "Serve together"],
          prepTime: 30,
          servings: 1,
        },
        {
          mealType: "snack",
          name: "Protein Smoothie",
          description: "High-calorie smoothie with protein powder and fruits",
          calories: 400,
          protein: 25,
          carbs: 35,
          fat: 15,
          ingredients: ["Protein powder (1 scoop)", "Banana (1 large)", "Peanut butter (2 tbsp)", "Oats (1/4 cup)", "Milk (1 cup)", "Honey (1 tbsp)"],
          instructions: ["Add all ingredients to blender", "Blend until smooth", "Serve immediately"],
          prepTime: 5,
          servings: 1,
        },
      ];

      meals.forEach(meal => {
        const mealId = randomUUID();
        const mealPlanMeal: MealPlanMeal = {
          id: mealId,
          mealPlanDayId: dayId,
          ...meal,
        };
        this.mealPlanMeals.set(mealId, mealPlanMeal);
      });
    }
  }

  // Commission tracking methods
  async getTotalCommissions(): Promise<{ totalCommissions: number; totalBookings: number }> {
    const paidBookings = Array.from(this.bookings.values())
      .filter(booking => booking.status === "paid" && booking.platformCommission);
    
    const totalCommissions = paidBookings.reduce((total, booking) => 
      total + (booking.platformCommission || 0), 0);
    
    return {
      totalCommissions,
      totalBookings: paidBookings.length
    };
  }

  async markBookingAsPaid(bookingId: string, totalPrice: number): Promise<Booking | undefined> {
    const booking = this.bookings.get(bookingId);
    if (!booking) return undefined;

    // Calculate 15% commission for platform
    const platformCommission = Math.round(totalPrice * 0.15);
    const trainerEarnings = totalPrice - platformCommission;

    const updatedBooking: Booking = {
      ...booking,
      status: "paid",
      totalPrice,
      platformCommission,
      trainerEarnings,
    };

    this.bookings.set(bookingId, updatedBooking);
    return updatedBooking;
  }

  // Trainer subscription methods
  async getTrainerSubscriptionStatus(userId: string): Promise<{
    subscriptionStatus: string;
    lastPaymentDate?: Date;
    subscriptionExpiresAt?: Date;
    isActive: boolean;
  } | null> {
    const trainer = Array.from(this.trainers.values())
      .find(t => t.userId === userId);
    
    if (!trainer) return null;

    const now = new Date();
    const isExpired = trainer.subscriptionExpiresAt && now > trainer.subscriptionExpiresAt;

    return {
      subscriptionStatus: trainer.subscriptionStatus || "inactive",
      lastPaymentDate: trainer.lastPaymentDate,
      subscriptionExpiresAt: trainer.subscriptionExpiresAt,
      isActive: trainer.subscriptionStatus === "active" && !isExpired
    };
  }

  async activateTrainerSubscription(userId: string): Promise<Trainer | undefined> {
    const trainer = Array.from(this.trainers.values())
      .find(t => t.userId === userId);
    
    if (!trainer) return undefined;

    const now = new Date();
    const subscriptionExpiresAt = new Date(now);
    subscriptionExpiresAt.setMonth(subscriptionExpiresAt.getMonth() + 1); // Add 1 month

    const updatedTrainer: Trainer = {
      ...trainer,
      subscriptionStatus: "active",
      lastPaymentDate: now,
      subscriptionExpiresAt,
    };

    this.trainers.set(trainer.id, updatedTrainer);
    return updatedTrainer;
  }

  async cancelTrainerSubscription(userId: string): Promise<Trainer | undefined> {
    const trainer = Array.from(this.trainers.values())
      .find(t => t.userId === userId);
    
    if (!trainer) return undefined;

    const updatedTrainer: Trainer = {
      ...trainer,
      subscriptionStatus: "inactive",
    };

    this.trainers.set(trainer.id, updatedTrainer);
    return updatedTrainer;
  }

  async getTotalSubscriptionRevenue(): Promise<{ totalRevenue: number; activeTrainers: number }> {
    const activeTrainers = Array.from(this.trainers.values())
      .filter(trainer => trainer.subscriptionStatus === "active");
    
    // Each active trainer pays $25/month, calculate estimated monthly revenue
    const totalRevenue = activeTrainers.length * 25; // $25 per trainer per month

    return {
      totalRevenue: totalRevenue * 100, // Convert to cents for consistency
      activeTrainers: activeTrainers.length
    };
  }

  // Calendar Notes
  async getCalendarNotes(userId: string, date?: Date): Promise<CalendarNote[]> {
    const notes = Array.from(this.calendarNotes.values()).filter(note => {
      if (note.userId !== userId) return false;
      if (date) {
        const noteDate = new Date(note.date);
        const targetDate = new Date(date);
        return noteDate.toDateString() === targetDate.toDateString();
      }
      return true;
    });
    return notes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getCalendarNote(id: string): Promise<CalendarNote | undefined> {
    return this.calendarNotes.get(id);
  }

  async createCalendarNote(noteData: InsertCalendarNote): Promise<CalendarNote> {
    const id = randomUUID();
    const now = new Date();
    const note: CalendarNote = {
      ...noteData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.calendarNotes.set(id, note);
    return note;
  }

  async updateCalendarNote(id: string, updates: Partial<CalendarNote>): Promise<CalendarNote | undefined> {
    const note = this.calendarNotes.get(id);
    if (!note) return undefined;

    const updatedNote: CalendarNote = {
      ...note,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date(),
    };
    this.calendarNotes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteCalendarNote(id: string): Promise<boolean> {
    return this.calendarNotes.delete(id);
  }

  // User Meal Preferences for AI generation
  async getUserMealPreferences(userId: string): Promise<UserMealPreferences | undefined> {
    return Array.from(this.userMealPreferences.values())
      .find(prefs => prefs.userId === userId);
  }

  async createUserMealPreferences(preferences: InsertUserMealPreferences): Promise<UserMealPreferences> {
    const id = randomUUID();
    const now = new Date();
    const userPreferences: UserMealPreferences = {
      ...preferences,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.userMealPreferences.set(id, userPreferences);
    return userPreferences;
  }

  async updateUserMealPreferences(userId: string, updates: Partial<UserMealPreferences>): Promise<UserMealPreferences | undefined> {
    const existing = Array.from(this.userMealPreferences.values())
      .find(prefs => prefs.userId === userId);
    
    if (!existing) return undefined;

    const updatedPreferences: UserMealPreferences = {
      ...existing,
      ...updates,
      id: existing.id, // Ensure ID doesn't change
      updatedAt: new Date(),
    };
    this.userMealPreferences.set(existing.id, updatedPreferences);
    return updatedPreferences;
  }

  async getUsersForWeeklyMealPlanGeneration(): Promise<{ userId: string; preferences: UserMealPreferences }[]> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return Array.from(this.userMealPreferences.values())
      .filter(prefs => 
        prefs.autoGenerate && 
        (!prefs.lastGeneratedAt || new Date(prefs.lastGeneratedAt) <= oneWeekAgo)
      )
      .map(prefs => ({ userId: prefs.userId, preferences: prefs }));
  }

  // AI Meal Plan Generation
  async createAIMealPlan(mealPlan: InsertMealPlan, days: { dayNumber: number; name: string; meals: any[] }[]): Promise<MealPlan> {
    // Create the meal plan
    const planId = randomUUID();
    const newPlan: MealPlan = {
      id: planId,
      ...mealPlan,
      createdAt: new Date(),
    };
    this.mealPlans.set(planId, newPlan);

    // Create the days and meals
    for (const dayData of days) {
      const dayId = randomUUID();
      const day: MealPlanDay = {
        id: dayId,
        mealPlanId: planId,
        dayNumber: dayData.dayNumber,
        name: dayData.name,
      };
      this.mealPlanDays.set(dayId, day);

      // Create meals for this day
      for (const mealData of dayData.meals) {
        const mealId = randomUUID();
        const meal: MealPlanMeal = {
          id: mealId,
          mealPlanDayId: dayId,
          mealType: mealData.mealType,
          name: mealData.name,
          description: mealData.description,
          calories: mealData.calories,
          protein: mealData.protein,
          carbs: mealData.carbs,
          fat: mealData.fat,
          ingredients: mealData.ingredients,
          instructions: mealData.instructions || [],
          prepTime: mealData.prepTime,
          servings: mealData.servings,
        };
        this.mealPlanMeals.set(mealId, meal);
      }
    }

    return newPlan;
  }

  // Food Items and Preferences Implementation
  async getFoodItems(category?: string): Promise<FoodItem[]> {
    const items = Array.from(this.foodItems.values());
    if (category) {
      return items.filter(item => item.category === category);
    }
    return items.sort((a, b) => (b.isCommon ? 1 : 0) - (a.isCommon ? 1 : 0));
  }

  async createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem> {
    const newItem: FoodItem = {
      id: randomUUID(),
      ...foodItem,
      createdAt: new Date(),
    };
    this.foodItems.set(newItem.id, newItem);
    return newItem;
  }

  async getFoodItemsWithUserPreferences(userId: string, category?: string): Promise<FoodItemWithPreference[]> {
    const items = await this.getFoodItems(category);
    const userPrefs = await this.getUserFoodPreferences(userId);
    
    return items.map(item => {
      const userPreference = userPrefs.find(pref => pref.foodItemId === item.id);
      return { ...item, userPreference };
    });
  }

  async getUserFoodPreferences(userId: string): Promise<UserFoodPreference[]> {
    return Array.from(this.userFoodPreferences.values())
      .filter(pref => pref.userId === userId);
  }

  async setUserFoodPreference(preference: InsertUserFoodPreference): Promise<UserFoodPreference> {
    // Check if preference already exists
    const existing = Array.from(this.userFoodPreferences.values())
      .find(pref => pref.userId === preference.userId && pref.foodItemId === preference.foodItemId);

    if (existing) {
      // Update existing preference
      const updated: UserFoodPreference = {
        ...existing,
        preference: preference.preference,
        updatedAt: new Date(),
      };
      this.userFoodPreferences.set(existing.id, updated);
      return updated;
    }

    // Create new preference
    const newPreference: UserFoodPreference = {
      id: randomUUID(),
      ...preference,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.userFoodPreferences.set(newPreference.id, newPreference);
    return newPreference;
  }

  async updateUserFoodPreference(userId: string, foodItemId: string, preference: string): Promise<UserFoodPreference | undefined> {
    const existing = Array.from(this.userFoodPreferences.values())
      .find(pref => pref.userId === userId && pref.foodItemId === foodItemId);

    if (!existing) return undefined;

    const updated: UserFoodPreference = {
      ...existing,
      preference,
      updatedAt: new Date(),
    };
    this.userFoodPreferences.set(existing.id, updated);
    return updated;
  }

  async deleteUserFoodPreference(userId: string, foodItemId: string): Promise<boolean> {
    const existing = Array.from(this.userFoodPreferences.values())
      .find(pref => pref.userId === userId && pref.foodItemId === foodItemId);

    if (!existing) return false;

    this.userFoodPreferences.delete(existing.id);
    return true;
  }

  private seedFoodItems() {
    const foodItems: InsertFoodItem[] = [
      // Proteins
      { name: "Chicken Breast", category: "proteins", caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 4, fiberPer100g: 0, commonServingSize: "1 piece (100g)", isCommon: true },
      { name: "Salmon", category: "proteins", caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, fiberPer100g: 0, commonServingSize: "1 fillet (150g)", isCommon: true },
      { name: "Ground Turkey", category: "proteins", caloriesPer100g: 149, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 7, fiberPer100g: 0, commonServingSize: "100g", isCommon: true },
      { name: "Eggs", category: "proteins", caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1, fatPer100g: 11, fiberPer100g: 0, commonServingSize: "2 large eggs (100g)", isCommon: true },
      { name: "Greek Yogurt", category: "dairy", caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 4, fatPer100g: 0, fiberPer100g: 0, commonServingSize: "1 cup (245g)", isCommon: true },
      { name: "Tofu", category: "proteins", caloriesPer100g: 76, proteinPer100g: 8, carbsPer100g: 2, fatPer100g: 5, fiberPer100g: 1, commonServingSize: "100g", isCommon: true },
      { name: "Lean Beef", category: "proteins", caloriesPer100g: 250, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 15, fiberPer100g: 0, commonServingSize: "3 oz (85g)", isCommon: true },
      { name: "Cod Fish", category: "proteins", caloriesPer100g: 82, proteinPer100g: 18, carbsPer100g: 0, fatPer100g: 1, fiberPer100g: 0, commonServingSize: "1 fillet (150g)", isCommon: true },
      { name: "Shrimp", category: "proteins", caloriesPer100g: 99, proteinPer100g: 18, carbsPer100g: 0, fatPer100g: 1, fiberPer100g: 0, commonServingSize: "3 oz (85g)", isCommon: true },
      { name: "Protein Powder", category: "proteins", caloriesPer100g: 411, proteinPer100g: 82, carbsPer100g: 6, fatPer100g: 8, fiberPer100g: 0, commonServingSize: "1 scoop (30g)", isCommon: true },
      { name: "Chicken Thighs", category: "proteins", caloriesPer100g: 209, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 11, fiberPer100g: 0, commonServingSize: "1 thigh (85g)", isCommon: true },
      { name: "Turkey Breast", category: "proteins", caloriesPer100g: 135, proteinPer100g: 30, carbsPer100g: 0, fatPer100g: 1, fiberPer100g: 0, commonServingSize: "3 oz (85g)", isCommon: true },
      { name: "Pork Tenderloin", category: "proteins", caloriesPer100g: 143, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 4, fiberPer100g: 0, commonServingSize: "3 oz (85g)", isCommon: true },
      { name: "Egg Whites", category: "proteins", caloriesPer100g: 52, proteinPer100g: 11, carbsPer100g: 1, fatPer100g: 0, fiberPer100g: 0, commonServingSize: "3 egg whites (100g)", isCommon: true },
      { name: "Seitan", category: "proteins", caloriesPer100g: 370, proteinPer100g: 75, carbsPer100g: 14, fatPer100g: 2, fiberPer100g: 6, commonServingSize: "3 oz (85g)", isCommon: true },
      { name: "Tempeh", category: "proteins", caloriesPer100g: 190, proteinPer100g: 19, carbsPer100g: 9, fatPer100g: 11, fiberPer100g: 9, commonServingSize: "3 oz (85g)", isCommon: true },

      // Carbohydrates
      { name: "Brown Rice", category: "grains", caloriesPer100g: 111, proteinPer100g: 3, carbsPer100g: 23, fatPer100g: 1, fiberPer100g: 2, commonServingSize: "1 cup cooked (195g)", isCommon: true },
      { name: "Quinoa", category: "grains", caloriesPer100g: 120, proteinPer100g: 4, carbsPer100g: 22, fatPer100g: 2, fiberPer100g: 3, commonServingSize: "1 cup cooked (185g)", isCommon: true },
      { name: "Sweet Potato", category: "vegetables", caloriesPer100g: 86, proteinPer100g: 2, carbsPer100g: 20, fatPer100g: 0, fiberPer100g: 3, commonServingSize: "1 medium (128g)", isCommon: true },
      { name: "Oats", category: "grains", caloriesPer100g: 389, proteinPer100g: 17, carbsPer100g: 66, fatPer100g: 7, fiberPer100g: 11, commonServingSize: "1/2 cup dry (40g)", isCommon: true },
      { name: "Whole Wheat Bread", category: "grains", caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 4, fiberPer100g: 7, commonServingSize: "2 slices (56g)", isCommon: true },

      // Vegetables
      { name: "Broccoli", category: "vegetables", caloriesPer100g: 34, proteinPer100g: 3, carbsPer100g: 7, fatPer100g: 0, fiberPer100g: 3, commonServingSize: "1 cup chopped (91g)", isCommon: true },
      { name: "Spinach", category: "vegetables", caloriesPer100g: 23, proteinPer100g: 3, carbsPer100g: 4, fatPer100g: 0, fiberPer100g: 2, commonServingSize: "1 cup raw (30g)", isCommon: true },
      { name: "Bell Peppers", category: "vegetables", caloriesPer100g: 31, proteinPer100g: 1, carbsPer100g: 7, fatPer100g: 0, fiberPer100g: 3, commonServingSize: "1 medium (119g)", isCommon: true },
      { name: "Carrots", category: "vegetables", caloriesPer100g: 41, proteinPer100g: 1, carbsPer100g: 10, fatPer100g: 0, fiberPer100g: 3, commonServingSize: "1 medium (61g)", isCommon: true },
      { name: "Tomatoes", category: "vegetables", caloriesPer100g: 18, proteinPer100g: 1, carbsPer100g: 4, fatPer100g: 0, fiberPer100g: 1, commonServingSize: "1 medium (123g)", isCommon: true },

      // Fruits
      { name: "Banana", category: "fruits", caloriesPer100g: 89, proteinPer100g: 1, carbsPer100g: 23, fatPer100g: 0, fiberPer100g: 3, commonServingSize: "1 medium (118g)", isCommon: true },
      { name: "Apple", category: "fruits", caloriesPer100g: 52, proteinPer100g: 0, carbsPer100g: 14, fatPer100g: 0, fiberPer100g: 2, commonServingSize: "1 medium (182g)", isCommon: true },
      { name: "Berries (Mixed)", category: "fruits", caloriesPer100g: 57, proteinPer100g: 1, carbsPer100g: 14, fatPer100g: 0, fiberPer100g: 6, commonServingSize: "1 cup (148g)", isCommon: true },
      { name: "Orange", category: "fruits", caloriesPer100g: 47, proteinPer100g: 1, carbsPer100g: 12, fatPer100g: 0, fiberPer100g: 2, commonServingSize: "1 medium (154g)", isCommon: true },

      // Healthy Fats
      { name: "Avocado", category: "fats", caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 15, fiberPer100g: 7, commonServingSize: "1 medium (150g)", isCommon: true },
      { name: "Almonds", category: "nuts", caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50, fiberPer100g: 12, commonServingSize: "1 oz (28g)", isCommon: true },
      { name: "Olive Oil", category: "fats", caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0, commonServingSize: "1 tbsp (14g)", isCommon: true },
      { name: "Walnuts", category: "nuts", caloriesPer100g: 654, proteinPer100g: 15, carbsPer100g: 14, fatPer100g: 65, fiberPer100g: 7, commonServingSize: "1 oz (28g)", isCommon: true },

      // Dairy
      { name: "Milk (2%)", category: "dairy", caloriesPer100g: 50, proteinPer100g: 3, carbsPer100g: 5, fatPer100g: 2, fiberPer100g: 0, commonServingSize: "1 cup (244g)", isCommon: true },
      { name: "Cheese (Cheddar)", category: "dairy", caloriesPer100g: 403, proteinPer100g: 25, carbsPer100g: 1, fatPer100g: 33, fiberPer100g: 0, commonServingSize: "1 oz (28g)", isCommon: true },

      // Additional options
      { name: "Black Beans", category: "legumes", caloriesPer100g: 132, proteinPer100g: 9, carbsPer100g: 23, fatPer100g: 1, fiberPer100g: 9, commonServingSize: "1/2 cup (86g)", isCommon: true },
      { name: "Lentils", category: "legumes", caloriesPer100g: 116, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 0, fiberPer100g: 8, commonServingSize: "1/2 cup (99g)", isCommon: true },
      { name: "Tuna", category: "proteins", caloriesPer100g: 144, proteinPer100g: 30, carbsPer100g: 0, fatPer100g: 1, fiberPer100g: 0, commonServingSize: "1 can (142g)", isCommon: true },
      { name: "Cottage Cheese", category: "dairy", caloriesPer100g: 98, proteinPer100g: 11, carbsPer100g: 4, fatPer100g: 4, fiberPer100g: 0, commonServingSize: "1/2 cup (113g)", isCommon: true },
    ];

    foodItems.forEach((item, index) => {
      const id = `food-${index + 1}`;
      const foodItem: FoodItem = {
        id,
        ...item,
        createdAt: new Date(),
      };
      this.foodItems.set(id, foodItem);
    });
  }

  private seedGeneralMealPlan(planId: string, goal: string, dailyCalories: number, duration: number) {
    // Create days for the meal plan with variety
    for (let day = 1; day <= duration; day++) {
      const dayId = randomUUID();
      const mealPlanDay: MealPlanDay = {
        id: dayId,
        mealPlanId: planId,
        dayNumber: day,
        name: `Day ${day}`,
      };
      this.mealPlanDays.set(dayId, mealPlanDay);

      // Create varied meals for each day
      const breakfastVariations = [
        {
          name: `Protein-Rich Breakfast Bowl`,
          description: `Balanced morning meal with ${Math.round(dailyCalories * 0.25)} calories`,
          calories: Math.round(dailyCalories * 0.25),
          ingredients: goal === "weight_gain" ? 
            ["Oats", "Greek yogurt", "Banana", "Nuts", "Honey", "Berries"] :
            ["Egg whites", "Vegetables", "Avocado", "Whole grain toast"],
        },
        {
          name: `Morning Energy Bowl`,
          description: `Energizing breakfast with varied ingredients`,
          calories: Math.round(dailyCalories * 0.25),
          ingredients: goal === "weight_gain" ? 
            ["Quinoa", "Almond milk", "Mixed fruits", "Chia seeds", "Maple syrup"] :
            ["Greek yogurt", "Berries", "Almonds", "Cinnamon"],
        }
      ];

      const lunchVariations = [
        {
          name: `Power Lunch Bowl`,
          description: `Satisfying midday meal with ${Math.round(dailyCalories * 0.30)} calories`,
          calories: Math.round(dailyCalories * 0.30),
          ingredients: goal === "weight_gain" ? 
            ["Brown rice", "Chicken", "Vegetables", "Avocado", "Olive oil"] :
            ["Quinoa", "Grilled chicken", "Mixed greens", "Light dressing"],
        },
        {
          name: `Mediterranean Feast`,
          description: `Mediterranean-inspired lunch`,
          calories: Math.round(dailyCalories * 0.30),
          ingredients: goal === "weight_gain" ? 
            ["Salmon", "Quinoa", "Vegetables", "Feta cheese", "Olive oil"] :
            ["Tuna", "Mixed salad", "Chickpeas", "Lemon dressing"],
        }
      ];

      const dinnerVariations = [
        {
          name: `Evening Nourishment`,
          description: `Satisfying dinner with ${Math.round(dailyCalories * 0.35)} calories`,
          calories: Math.round(dailyCalories * 0.35),
          ingredients: goal === "weight_gain" ? 
            ["Beef", "Sweet potato", "Broccoli", "Butter", "Herbs"] :
            ["Grilled fish", "Vegetables", "Brown rice", "Herbs"],
        },
        {
          name: `Comfort Dinner`,
          description: `Hearty evening meal`,
          calories: Math.round(dailyCalories * 0.35),
          ingredients: goal === "weight_gain" ? 
            ["Turkey", "Pasta", "Vegetables", "Cheese", "Olive oil"] :
            ["Chicken", "Roasted vegetables", "Quinoa", "Light sauce"],
        }
      ];

      // Select variations based on day to ensure variety
      const breakfastMeal = breakfastVariations[day % 2];
      const lunchMeal = lunchVariations[day % 2];
      const dinnerMeal = dinnerVariations[day % 2];

      const meals = [
        {
          mealType: "breakfast",
          name: breakfastMeal.name,
          description: breakfastMeal.description,
          calories: breakfastMeal.calories,
          protein: goal === "weight_gain" ? Math.round(breakfastMeal.calories * 0.20 / 4) : Math.round(breakfastMeal.calories * 0.25 / 4),
          carbs: goal === "weight_gain" ? Math.round(breakfastMeal.calories * 0.50 / 4) : Math.round(breakfastMeal.calories * 0.40 / 4),
          fat: goal === "weight_gain" ? Math.round(breakfastMeal.calories * 0.30 / 9) : Math.round(breakfastMeal.calories * 0.35 / 9),
          ingredients: breakfastMeal.ingredients,
          instructions: ["Prepare base ingredients", "Combine and mix", "Add toppings", "Serve fresh"],
          prepTime: 15,
          servings: 1,
        },
        {
          mealType: "lunch",
          name: lunchMeal.name,
          description: lunchMeal.description,
          calories: lunchMeal.calories,
          protein: goal === "weight_gain" ? Math.round(lunchMeal.calories * 0.25 / 4) : Math.round(lunchMeal.calories * 0.30 / 4),
          carbs: goal === "weight_gain" ? Math.round(lunchMeal.calories * 0.45 / 4) : Math.round(lunchMeal.calories * 0.35 / 4),
          fat: goal === "weight_gain" ? Math.round(lunchMeal.calories * 0.30 / 9) : Math.round(lunchMeal.calories * 0.35 / 9),
          ingredients: lunchMeal.ingredients,
          instructions: ["Cook protein", "Prepare grain/base", "Add vegetables", "Combine with dressing"],
          prepTime: 25,
          servings: 1,
        },
        {
          mealType: "dinner",
          name: dinnerMeal.name,
          description: dinnerMeal.description,
          calories: dinnerMeal.calories,
          protein: goal === "weight_gain" ? Math.round(dinnerMeal.calories * 0.25 / 4) : Math.round(dinnerMeal.calories * 0.30 / 4),
          carbs: goal === "weight_gain" ? Math.round(dinnerMeal.calories * 0.45 / 4) : Math.round(dinnerMeal.calories * 0.30 / 4),
          fat: goal === "weight_gain" ? Math.round(dinnerMeal.calories * 0.30 / 9) : Math.round(dinnerMeal.calories * 0.40 / 9),
          ingredients: dinnerMeal.ingredients,
          instructions: ["Season protein", "Cook thoroughly", "Prepare sides", "Plate and serve"],
          prepTime: 35,
          servings: 1,
        },
        {
          mealType: "snack",
          name: "Healthy Snack",
          description: `Nutritious snack with ${Math.round(dailyCalories * 0.10)} calories`,
          calories: Math.round(dailyCalories * 0.10),
          protein: Math.round(dailyCalories * 0.10 * 0.20 / 4),
          carbs: Math.round(dailyCalories * 0.10 * 0.40 / 4),
          fat: Math.round(dailyCalories * 0.10 * 0.40 / 9),
          ingredients: goal === "weight_gain" ? 
            ["Mixed nuts", "Dried fruit", "Yogurt"] :
            ["Apple", "Almond butter", "Greek yogurt"],
          instructions: ["Prepare snack", "Enjoy between meals"],
          prepTime: 5,
          servings: 1,
        }
      ];

      meals.forEach((meal, index) => {
        const mealId = randomUUID();
        const mealPlanMeal: MealPlanMeal = {
          id: mealId,
          mealPlanDayId: dayId,
          mealType: meal.mealType as "breakfast" | "lunch" | "dinner" | "snack",
          name: meal.name,
          description: meal.description,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          ingredients: meal.ingredients,
          instructions: meal.instructions,
          prepTime: meal.prepTime,
          servings: meal.servings,
        };
        this.mealPlanMeals.set(mealId, mealPlanMeal);
      });
    }
  }

  // AI Difficulty Adjustments implementation
  async getRecentWorkoutsForExercise(userId: string, exerciseId: string, limit: number): Promise<(Workout & { exercises: WorkoutExercise[] })[]> {
    const allWorkouts = Array.from(this.workouts.values())
      .filter(workout => workout.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const workoutsWithExercises: (Workout & { exercises: WorkoutExercise[] })[] = [];
    
    for (const workout of allWorkouts) {
      const workoutExercises = Array.from(this.workoutExercises.values())
        .filter(we => we.workoutId === workout.id && we.exerciseId === exerciseId);
      
      if (workoutExercises.length > 0) {
        workoutsWithExercises.push({
          ...workout,
          exercises: workoutExercises
        });
        
        if (workoutsWithExercises.length >= limit) {
          break;
        }
      }
    }
    
    return workoutsWithExercises;
  }

  async createAiDifficultyAdjustment(adjustment: InsertAiDifficultyAdjustment): Promise<AiDifficultyAdjustment> {
    const id = randomUUID();
    const now = new Date();
    const newAdjustment: AiDifficultyAdjustment = {
      id,
      ...adjustment,
      createdAt: now,
      updatedAt: now,
    };
    this.aiDifficultyAdjustments.set(id, newAdjustment);
    return newAdjustment;
  }

  async getPendingAiAdjustments(userId: string): Promise<AiDifficultyAdjustment[]> {
    return Array.from(this.aiDifficultyAdjustments.values())
      .filter(adjustment => adjustment.userId === userId && !adjustment.applied)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async applyAiDifficultyAdjustment(adjustmentId: string): Promise<boolean> {
    const adjustment = this.aiDifficultyAdjustments.get(adjustmentId);
    if (!adjustment) {
      return false;
    }

    const updatedAdjustment = {
      ...adjustment,
      applied: true,
      appliedAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.aiDifficultyAdjustments.set(adjustmentId, updatedAdjustment);
    return true;
  }

  // Meal Tracking methods implementation
  async getMealEntries(userId: string, date?: string): Promise<MealEntry[]> {
    const entries = Array.from(this.mealEntries.values()).filter(entry => entry.userId === userId);
    
    if (date) {
      const targetDate = new Date(date);
      return entries.filter(entry => {
        const entryDate = new Date(entry.loggedAt);
        return entryDate.toDateString() === targetDate.toDateString();
      });
    }
    
    return entries.sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
  }

  async createMealEntry(entry: InsertMealEntry): Promise<MealEntry> {
    const id = randomUUID();
    const newEntry: MealEntry = {
      ...entry,
      id,
      loggedAt: entry.loggedAt || new Date(),
    };
    
    this.mealEntries.set(id, newEntry);
    return newEntry;
  }

  async getMealEntry(id: string): Promise<MealEntry | undefined> {
    return this.mealEntries.get(id);
  }

  async deleteMealEntry(id: string): Promise<boolean> {
    return this.mealEntries.delete(id);
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // Authentication methods
  async createUserWithPassword(userData: SignUpData): Promise<User> {
    try {
      // Check if username or email already exists
      const existingUser = await this.getUserByUsernameOrEmail(userData.username) || 
                          await this.getUserByUsernameOrEmail(userData.email);
      
      if (existingUser) {
        throw new Error("Username or email already exists");
      }
      
      // Hash the password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);
      
      // Create user in database
      const [user] = await db
        .insert(users)
        .values({
          email: userData.email,
          username: userData.username,
          passwordHash,
          firstName: userData.firstName,
          lastName: userData.lastName,
          authProvider: "local",
          isEmailVerified: false,
          subscriptionStatus: "free_trial",
          subscriptionExpiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // 7 days from now
        })
        .returning();
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserByUsernameOrEmail(identifier: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.username, identifier), eq(users.email, identifier)));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }


  async verifyUserEmail(userId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isEmailVerified: true, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Fallback to MemStorage for other methods not yet implemented
  private memStorage = new MemStorage();

  // Delegate all other methods to MemStorage for now
  async getUsers(): Promise<User[]> { return this.memStorage.getUsers(); }
  async getUserByUsername(username: string): Promise<User | undefined> { return this.memStorage.getUserByUsername(username); }
  async createUser(user: InsertUser): Promise<User> { return this.memStorage.createUser(user); }
  async updateUserStreak(id: string, streak: number): Promise<User | undefined> { return this.memStorage.updateUserStreak(id, streak); }
  
  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    try {
      const [user] = await db
        .update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return user;
    } catch (error) {
      console.error('Database updateUser error:', error);
      return undefined;
    }
  }
  
  // Exercise methods
  async getExercises(): Promise<Exercise[]> { return this.memStorage.getExercises(); }
  async getExercisesByCategory(category: string): Promise<Exercise[]> { return this.memStorage.getExercisesByCategory(category); }
  async searchExercises(query: string): Promise<Exercise[]> { return this.memStorage.searchExercises(query); }
  async getExercise(id: string): Promise<Exercise | undefined> { return this.memStorage.getExercise(id); }
  async createExercise(exercise: InsertExercise): Promise<Exercise> { return this.memStorage.createExercise(exercise); }
  
  // Workout methods
  async getWorkouts(userId: string): Promise<Workout[]> { return this.memStorage.getWorkouts(userId); }
  async getWorkout(id: string): Promise<WorkoutWithExercises | undefined> { return this.memStorage.getWorkout(id); }
  async createWorkout(workout: InsertWorkout): Promise<Workout> { return this.memStorage.createWorkout(workout); }
  async getWorkoutsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Workout[]> { return this.memStorage.getWorkoutsByDateRange(userId, startDate, endDate); }
  
  // Workout Exercise methods
  async createWorkoutExercise(workoutExercise: InsertWorkoutExercise): Promise<WorkoutExercise> { return this.memStorage.createWorkoutExercise(workoutExercise); }
  async getWorkoutExercises(workoutId: string): Promise<(WorkoutExercise & { exercise: Exercise })[]> { return this.memStorage.getWorkoutExercises(workoutId); }
  
  // Goal methods
  async getGoals(userId: string): Promise<Goal[]> { return this.memStorage.getGoals(userId); }
  async createGoal(goal: InsertGoal): Promise<Goal> { return this.memStorage.createGoal(goal); }
  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | undefined> { return this.memStorage.updateGoal(id, updates); }
  async deleteGoal(id: string): Promise<boolean> { return this.memStorage.deleteGoal(id); }

  // Workout Planner methods
  async getWorkoutPreferences(userId: string): Promise<WorkoutPreferences | undefined> { return this.memStorage.getWorkoutPreferences(userId); }
  async saveWorkoutPreferences(preferences: InsertWorkoutPreferences): Promise<WorkoutPreferences> { return this.memStorage.saveWorkoutPreferences(preferences); }
  async getWorkoutPlan(userId: string): Promise<(WorkoutPlan & { plannedWorkouts: PlannedWorkout[] }) | undefined> { return this.memStorage.getWorkoutPlan(userId); }
  async createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan> { return this.memStorage.createWorkoutPlan(plan); }
  async createPlannedWorkouts(plannedWorkouts: InsertPlannedWorkout[]): Promise<PlannedWorkout[]> { return this.memStorage.createPlannedWorkouts(plannedWorkouts); }

  // Meal Tracking methods
  async getMealEntries(userId: string, date?: string): Promise<MealEntry[]> { return this.memStorage.getMealEntries(userId, date); }
  async createMealEntry(entry: InsertMealEntry): Promise<MealEntry> { return this.memStorage.createMealEntry(entry); }
  async getMealEntry(id: string): Promise<MealEntry | undefined> { return this.memStorage.getMealEntry(id); }
  async deleteMealEntry(id: string): Promise<boolean> { return this.memStorage.deleteMealEntry(id); }
  
  // Stats methods
  async getUserStats(userId: string): Promise<UserStats> { return this.memStorage.getUserStats(userId); }
  async getAdvancedProgressMetrics(userId: string): Promise<any> { return this.memStorage.getAdvancedProgressMetrics(userId); }
  async getWeightProgressData(userId: string): Promise<any> { return this.memStorage.getWeightProgressData(userId); }
  
  // Leaderboard methods
  async getLeaderboard(): Promise<LeaderboardEntry[]> { return this.memStorage.getLeaderboard(); }
  
  // All other methods delegate to MemStorage for now
  async getTrainers(filters?: any): Promise<TrainerWithServices[]> { return this.memStorage.getTrainers(filters); }
  async getTrainer(id: string): Promise<TrainerWithServices | undefined> { return this.memStorage.getTrainer(id); }
  async getTrainerByUserId(userId: string): Promise<Trainer | undefined> { return this.memStorage.getTrainerByUserId(userId); }
  async createTrainer(trainer: InsertTrainer): Promise<Trainer> { return this.memStorage.createTrainer(trainer); }
  async updateTrainer(id: string, updates: Partial<Trainer>): Promise<Trainer | undefined> { return this.memStorage.updateTrainer(id, updates); }
  async getTrainerServices(trainerId: string): Promise<TrainerService[]> { return this.memStorage.getTrainerServices(trainerId); }
  async createTrainerService(service: InsertTrainerService): Promise<TrainerService> { return this.memStorage.createTrainerService(service); }
  async updateTrainerService(id: string, updates: Partial<TrainerService>): Promise<TrainerService | undefined> { return this.memStorage.updateTrainerService(id, updates); }
  async getBookings(userId: string): Promise<BookingWithDetails[]> { return this.memStorage.getBookings(userId); }
  async getTrainerBookings(trainerId: string): Promise<BookingWithDetails[]> { return this.memStorage.getTrainerBookings(trainerId); }
  async getBooking(id: string): Promise<BookingWithDetails | undefined> { return this.memStorage.getBooking(id); }
  async createBooking(booking: InsertBooking): Promise<Booking> { return this.memStorage.createBooking(booking); }
  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined> { return this.memStorage.updateBooking(id, updates); }
  async getTrainerReviews(trainerId: string): Promise<TrainerReviewWithUser[]> { return this.memStorage.getTrainerReviews(trainerId); }
  async createTrainerReview(review: InsertTrainerReview): Promise<TrainerReview> { return this.memStorage.createTrainerReview(review); }
  async updateTrainerRating(trainerId: string): Promise<void> { return this.memStorage.updateTrainerRating(trainerId); }
  async getFoodEntries(userId: string, date?: Date): Promise<FoodEntry[]> { return this.memStorage.getFoodEntries(userId, date); }
  async createFoodEntry(foodEntry: InsertFoodEntry): Promise<FoodEntry> { return this.memStorage.createFoodEntry(foodEntry); }
  async updateFoodEntry(id: string, updates: Partial<FoodEntry>): Promise<FoodEntry | undefined> { return this.memStorage.updateFoodEntry(id, updates); }
  async deleteFoodEntry(id: string): Promise<boolean> { return this.memStorage.deleteFoodEntry(id); }
  async getMileTrackerSessions(userId: string): Promise<MileTrackerSessionWithSplits[]> { return this.memStorage.getMileTrackerSessions(userId); }
  async getMileTrackerSession(id: string): Promise<MileTrackerSessionWithSplits | undefined> { return this.memStorage.getMileTrackerSession(id); }
  async getActiveMileTrackerSession(userId: string): Promise<MileTrackerSessionWithSplits | undefined> { return this.memStorage.getActiveMileTrackerSession(userId); }
  async createMileTrackerSession(session: InsertMileTrackerSession): Promise<MileTrackerSession> { return this.memStorage.createMileTrackerSession(session); }
  async updateMileTrackerSession(id: string, updates: Partial<MileTrackerSession>): Promise<MileTrackerSession | undefined> { return this.memStorage.updateMileTrackerSession(id, updates); }
  async createMileTrackerSplit(split: InsertMileTrackerSplit): Promise<MileTrackerSplit> { return this.memStorage.createMileTrackerSplit(split); }
  async getMileTrackerSplits(sessionId: string): Promise<MileTrackerSplit[]> { return this.memStorage.getMileTrackerSplits(sessionId); }
  async getCommunityPosts(limit?: number): Promise<CommunityPostWithUser[]> { return this.memStorage.getCommunityPosts(limit); }
  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> { return this.memStorage.createCommunityPost(post); }
  async likeCommunityPost(postId: string): Promise<CommunityPost | undefined> { return this.memStorage.likeCommunityPost(postId); }
  async getMealPlans(goal?: string): Promise<MealPlanWithDetails[]> { return this.memStorage.getMealPlans(goal); }
  async getMealPlan(id: string): Promise<MealPlanWithDetails | undefined> { return this.memStorage.getMealPlan(id); }
  async createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan> { return this.memStorage.createMealPlan(mealPlan); }
  async getUserMealPlan(userId: string): Promise<UserMealPlanWithDetails | undefined> { return this.memStorage.getUserMealPlan(userId); }
  async assignMealPlan(userMealPlan: InsertUserMealPlan): Promise<UserMealPlan> { return this.memStorage.assignMealPlan(userMealPlan); }
  async getTotalCommissions(): Promise<{ totalCommissions: number; totalBookings: number }> { return this.memStorage.getTotalCommissions(); }
  async markBookingAsPaid(bookingId: string, totalPrice: number): Promise<Booking | undefined> { return this.memStorage.markBookingAsPaid(bookingId, totalPrice); }
  async getCalendarNotes(userId: string, date?: Date): Promise<CalendarNote[]> { return this.memStorage.getCalendarNotes(userId, date); }
  async getCalendarNote(id: string): Promise<CalendarNote | undefined> { return this.memStorage.getCalendarNote(id); }
  async createCalendarNote(note: InsertCalendarNote): Promise<CalendarNote> { return this.memStorage.createCalendarNote(note); }
  async updateCalendarNote(id: string, updates: Partial<CalendarNote>): Promise<CalendarNote | undefined> { return this.memStorage.updateCalendarNote(id, updates); }
  async deleteCalendarNote(id: string): Promise<boolean> { return this.memStorage.deleteCalendarNote(id); }
  async getUserMealPreferences(userId: string): Promise<UserMealPreferences | undefined> { return this.memStorage.getUserMealPreferences(userId); }
  async createUserMealPreferences(preferences: InsertUserMealPreferences): Promise<UserMealPreferences> { return this.memStorage.createUserMealPreferences(preferences); }
  async updateUserMealPreferences(userId: string, updates: Partial<UserMealPreferences>): Promise<UserMealPreferences | undefined> { return this.memStorage.updateUserMealPreferences(userId, updates); }
  async getUsersForWeeklyMealPlanGeneration(): Promise<{ userId: string; preferences: UserMealPreferences }[]> { return this.memStorage.getUsersForWeeklyMealPlanGeneration(); }
  async createAIMealPlan(mealPlan: InsertMealPlan, days: { dayNumber: number; name: string; meals: any[] }[]): Promise<MealPlan> { return this.memStorage.createAIMealPlan(mealPlan, days); }
  async getFoodItems(category?: string): Promise<FoodItem[]> { return this.memStorage.getFoodItems(category); }
  async createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem> { return this.memStorage.createFoodItem(foodItem); }
  async getFoodItemsWithUserPreferences(userId: string, category?: string): Promise<FoodItemWithPreference[]> { return this.memStorage.getFoodItemsWithUserPreferences(userId, category); }
  async getUserFoodPreferences(userId: string): Promise<UserFoodPreference[]> { return this.memStorage.getUserFoodPreferences(userId); }
  async setUserFoodPreference(preference: InsertUserFoodPreference): Promise<UserFoodPreference> { return this.memStorage.setUserFoodPreference(preference); }
  async updateUserFoodPreference(userId: string, foodItemId: string, preference: string): Promise<UserFoodPreference | undefined> { return this.memStorage.updateUserFoodPreference(userId, foodItemId, preference); }
  async deleteUserFoodPreference(userId: string, foodItemId: string): Promise<boolean> { return this.memStorage.deleteUserFoodPreference(userId, foodItemId); }
  async getRecentWorkoutsForExercise(userId: string, exerciseId: string, limit: number): Promise<(Workout & { exercises: WorkoutExercise[] })[]> { return this.memStorage.getRecentWorkoutsForExercise(userId, exerciseId, limit); }
  async createAiDifficultyAdjustment(adjustment: InsertAiDifficultyAdjustment): Promise<AiDifficultyAdjustment> { return this.memStorage.createAiDifficultyAdjustment(adjustment); }
  async getPendingAiAdjustments(userId: string): Promise<AiDifficultyAdjustment[]> { return this.memStorage.getPendingAiAdjustments(userId); }
  async applyAiDifficultyAdjustment(adjustmentId: string): Promise<boolean> { return this.memStorage.applyAiDifficultyAdjustment(adjustmentId); }
}

export const storage = new DatabaseStorage();
