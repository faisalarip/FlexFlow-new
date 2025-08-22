import { 
  type User, 
  type InsertUser,
  type UpsertUser,
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
  type InsertUserMealPlan,
  type Payment,
  type InsertPayment
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStreak(id: string, streak: number): Promise<User | undefined>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
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

  constructor() {
    this.seedExercises();
    this.seedTrainers();
    this.seedMealPlans();
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
      const freeTrialExpiry = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
      
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
    const freeTrialExpiry = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
    
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

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, ...updates };
      this.users.set(id, updatedUser);
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
        user: { name: user!.name, username: user!.username }
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
      user: { name: user!.name, username: user!.username }
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
        user: { name: user.name, username: user.username }
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
        user: { name: user.name, username: user.username }
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
      user: { name: user.name, username: user.username }
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
        user: { name: user.name, username: user.username }
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
          username: user.username,
          name: user.name,
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
            name: user.name,
            username: user.username,
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

    // Add days and meals for Weight Loss Plan
    this.seedWeightLossMealPlan(weightLossPlan.id);
    
    // Add days and meals for Weight Gain Plan
    this.seedWeightGainMealPlan(weightGainPlan.id);
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
}

export const storage = new MemStorage();
