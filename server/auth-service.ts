import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { signUpSchema, signInSchema, type SignUpData, type SignInData, type GoogleAuthData } from "@shared/schema";

// JWT secret - in production, this should be a long, random secret
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRES_IN = "7d"; // Token expires in 7 days

export interface AuthResult {
  user: {
    id: string;
    email: string | null;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
    authProvider: string | null;
    isEmailVerified: boolean | null;
  };
  token: string;
}

export class AuthService {
  /**
   * Register a new user with username and password
   */
  async signUp(userData: SignUpData): Promise<AuthResult> {
    // Validate input data
    const validatedData = signUpSchema.parse(userData);
    
    try {
      
      // Create user in storage
      const user = await storage.createUserWithPassword(validatedData);
      
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          username: user.username,
          authProvider: user.authProvider 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );


      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          authProvider: user.authProvider,
          isEmailVerified: user.isEmailVerified,
        },
        token
      };
    } catch (error: any) {
      
      if (error.message === "Username or email already exists") {
        throw new Error("An account with this username or email already exists");
      }
      throw new Error("Failed to create account. Please try again.");
    }
  }

  /**
   * Sign in user with username/email and password
   */
  async signIn(credentials: SignInData): Promise<AuthResult> {
    // Validate input data
    const validatedCredentials = signInSchema.parse(credentials);
    
    // Find user by username or email
    const user = await storage.getUserByUsernameOrEmail(validatedCredentials.identifier);
    
    if (!user) {
      throw new Error("Invalid username/email or password");
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.passwordHash) {
      throw new Error("This account was created with Google. Please sign in with Google.");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(validatedCredentials.password, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new Error("Invalid username/email or password");
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        username: user.username,
        authProvider: user.authProvider 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        authProvider: user.authProvider,
        isEmailVerified: user.isEmailVerified,
      },
      token
    };
  }

  /**
   * Handle Google OAuth sign in/up
   */
  async signInWithGoogle(googleData: GoogleAuthData): Promise<AuthResult> {
    try {
      // Create or update user from Google data
      const user = await storage.upsertUserFromGoogle(googleData);
      
      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          username: user.username,
          authProvider: user.authProvider,
          googleId: user.googleId 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          authProvider: user.authProvider,
          isEmailVerified: user.isEmailVerified,
        },
        token
      };
    } catch (error: any) {
      throw new Error("Failed to sign in with Google. Please try again.");
    }
  }

  /**
   * Verify JWT token and return user data
   */
  async verifyToken(token: string): Promise<{ userId: string; email: string | null; username: string | null; authProvider: string | null }> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return {
        userId: decoded.userId,
        email: decoded.email || null,
        username: decoded.username || null,
        authProvider: decoded.authProvider || null,
      };
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  /**
   * Get user by token
   */
  async getUserByToken(token: string): Promise<AuthResult['user'] | null> {
    try {
      const tokenData = await this.verifyToken(token);
      const user = await storage.getUser(tokenData.userId);
      
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        authProvider: user.authProvider,
        isEmailVerified: user.isEmailVerified,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(oldToken: string): Promise<string> {
    const tokenData = await this.verifyToken(oldToken);
    
    // Generate new token with same data
    return jwt.sign(
      { 
        userId: tokenData.userId, 
        email: tokenData.email,
        username: tokenData.username,
        authProvider: tokenData.authProvider 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await storage.getUser(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.passwordHash) {
      throw new Error("This account was created with Google and doesn't have a password");
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    
    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update user with new password hash
    await storage.updateUser(userId, { passwordHash: newPasswordHash, updatedAt: new Date() });
  }
}

export const authService = new AuthService();