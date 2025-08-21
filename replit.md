# FitTracker - Fitness Tracking Application

## Overview

FitTracker is a modern fitness tracking web application built with React and Express. It allows users to log workouts, track progress, set goals, and visualize their fitness journey through an intuitive dashboard. The application features a comprehensive exercise database, workout logging capabilities, progress visualization, and goal management system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with custom Tailwind CSS styling using the shadcn/ui component system
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety across the entire stack
- **API Design**: RESTful API with JSON responses
- **Error Handling**: Centralized error handling middleware with structured error responses
- **Logging**: Custom request/response logging middleware for API monitoring

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Connection**: Neon Database serverless PostgreSQL for cloud hosting
- **Development Storage**: In-memory storage implementation for development and testing

### Database Schema Design
- **Users**: Basic user information with streak tracking
- **Exercises**: Comprehensive exercise catalog with categories, muscle groups, and equipment
- **Workouts**: User workout sessions with duration, calories, and notes
- **Workout Exercises**: Junction table linking workouts to specific exercises with sets, reps, weight, and duration
- **Goals**: User-defined fitness goals with progress tracking

### Authentication and Authorization
- **Current Implementation**: Mock user system for development
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Future Enhancement**: Ready for implementation of proper authentication system

### UI/UX Design Patterns
- **Design System**: Consistent component library based on shadcn/ui with Radix UI primitives
- **Responsive Design**: Mobile-first approach with adaptive layouts for desktop and mobile
- **Theme System**: CSS custom properties for consistent theming and dark mode support
- **Accessibility**: WCAG-compliant components with proper ARIA labels and keyboard navigation

### Development Tools and Configuration
- **Type Safety**: Shared TypeScript schemas between frontend and backend
- **Code Quality**: ESLint and TypeScript compiler for code validation
- **Build Process**: Separate build processes for client and server with optimized bundling
- **Development Environment**: Hot module replacement and error overlay for rapid development

## External Dependencies

### Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database ORM with PostgreSQL dialect
- **Database Connection**: @neondatabase/serverless for optimized serverless connections

### UI and Styling Framework
- **Radix UI**: Comprehensive set of accessible UI primitives for React
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **Lucide Icons**: Modern icon library for consistent iconography
- **Class Variance Authority**: Type-safe utility for managing component variants

### Data Fetching and State Management
- **TanStack Query**: Powerful data synchronization for React applications
- **React Hook Form**: Performant forms with easy validation
- **Zod**: Schema validation for runtime type checking

### Development and Build Tools
- **Vite**: Next-generation frontend tooling for fast development and builds
- **TypeScript**: Static type checking for JavaScript
- **React DevTools**: Development tools integration for debugging
- **ESBuild**: Fast JavaScript bundler for server-side code

### Utility Libraries
- **Date-fns**: Modern JavaScript date utility library
- **clsx**: Utility for constructing className strings conditionally
- **Nanoid**: Secure URL-friendly unique string ID generator
- **Wouter**: Minimalist routing library for React applications

### Chart and Visualization
- **Chart.js**: External CDN-loaded charting library for progress visualization
- **Recharts**: React chart components (included in dependencies but Chart.js used via CDN)