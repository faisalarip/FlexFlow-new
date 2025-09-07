import { Request, Response, NextFunction } from "express";
import { authService } from "./auth-service";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string | null;
        username: string | null;
        firstName: string | null;
        lastName: string | null;
        profileImageUrl: string | null;
        authProvider: string | null;
        isEmailVerified: boolean | null;
      };
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Auth header:", authHeader);
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log("No token found");
      return res.status(401).json({ message: "Access token required" });
    }

    console.log("Token:", token.substring(0, 50) + "...");

    // Verify token and get user data
    const user = await authService.getUserByToken(token);
    console.log("User from token:", user);
    
    if (!user) {
      console.log("No user found for token");
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

/**
 * Middleware to optionally authenticate JWT tokens (doesn't fail if no token)
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token) {
      // Try to verify token and get user data
      const user = await authService.getUserByToken(token);
      if (user) {
        req.user = user;
      }
    }
    
    // Continue regardless of token verification result
    next();
  } catch (error) {
    // Continue without authentication if token verification fails
    next();
  }
};

/**
 * Utility function to get current user ID from request
 */
export const getCurrentUserId = (req: Request): string | null => {
  return req.user?.id || null;
};

/**
 * Utility function to get current user from request
 */
export const getCurrentUser = (req: Request) => {
  return req.user || null;
};