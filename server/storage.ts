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
  type WorkoutWithExercises,
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private exercises: Map<string, Exercise> = new Map();
  private workouts: Map<string, Workout> = new Map();
  private workoutExercises: Map<string, WorkoutExercise> = new Map();
  private goals: Map<string, Goal> = new Map();

  constructor() {
    this.seedExercises();
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
}

export const storage = new MemStorage();
