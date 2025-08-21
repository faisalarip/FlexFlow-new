import { 
  type User, 
  type InsertUser,
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
  type UserStats
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStreak(id: string, streak: number): Promise<User | undefined>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private exercises: Map<string, Exercise> = new Map();
  private workouts: Map<string, Workout> = new Map();
  private workoutExercises: Map<string, WorkoutExercise> = new Map();
  private goals: Map<string, Goal> = new Map();
  private trainers: Map<string, Trainer> = new Map();
  private trainerServices: Map<string, TrainerService> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private trainerReviews: Map<string, TrainerReview> = new Map();

  constructor() {
    this.seedExercises();
    this.seedTrainers();
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
      const user: User = {
        id: trainerInfo.userId,
        username: `trainer_${trainerInfo.id.slice(0, 8)}`,
        password: "demo",
        name: trainerInfo.specialties[0] === "yoga" ? "Sarah Johnson" : "Mike Thompson",
        streak: 0,
        createdAt: new Date()
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

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      streak: insertUser.streak || 0,
      createdAt: new Date()
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
}

export const storage = new MemStorage();
