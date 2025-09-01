# Zipli Architecture Overview

## 🏗️ System Architecture

### Technology Stack

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript
- **UI Framework**: Shadcn UI + Tailwind CSS + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **State Management**: Zustand + React Query
- **Deployment**: Vercel
- **AI Integration**: OpenAI (Whisper + GPT for food processing)

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── donate/            # Donor workflow
│   ├── request/           # Receiver workflow
│   ├── dashboard/         # Role-based dashboards
│   └── city/              # City admin pages
├── components/
│   ├── ui/                # Reusable UI components
│   ├── auth/              # Auth-specific components
│   └── donations/         # Donation-related components
├── lib/
│   ├── supabase/          # Database client & types
│   └── utils.ts           # Utility functions
└── store/                 # Zustand state management
```

## 🔄 Data Flow

### User Roles & Workflows

1. **Donors** (Restaurants/Caterers)
   - Create food items → Create donations → Manage pickups
2. **Receivers** (Charities/Individuals)
   - Browse donations → Claim items → Coordinate pickup
3. **City Admins**
   - Monitor sustainability metrics → Generate reports

### Database Schema

```sql
-- Core tables
profiles (user_role, organization_name, address)
food_items (name, description, image_url, allergens)
donations (status, quantity, pickup_time, claimed_at)
qr_login_tokens (for pickup authentication)
```

### API Endpoints

- `/api/auth/*` - QR authentication system
- `/api/transcribe-audio` - Voice-to-text processing
- `/api/process-item-details` - AI food item extraction
- `/api/generate-food-image` - DALL-E image generation

## 🎯 Key Features

### Voice Input System

- **Audio Capture**: Browser MediaRecorder API
- **Transcription**: OpenAI Whisper API
- **Processing**: GPT-4 for structured data extraction
- **Fallback**: Manual entry forms

### Real-time Updates

- **Supabase Realtime**: Live donation status changes
- **Optimistic Updates**: Immediate UI feedback
- **Toast Notifications**: User action confirmations

### Multi-step Workflows

- **Donation Flow**: Items → Scheduling → Summary → Confirmation
- **Request Flow**: Browse → Claim → Pickup coordination
- **State Management**: Zustand stores for form persistence

## 🔐 Security & Authentication

### Row Level Security (RLS)

- **Profiles**: Users can only edit their own data
- **Donations**: Donors manage their donations, receivers can claim
- **Food Items**: Linked to donor profiles with proper access control

### API Security

- **Rate Limiting**: Prevents abuse of AI endpoints
- **CORS Protection**: Restricted to allowed domains
- **Input Sanitization**: All user inputs validated and sanitized

## 📱 Responsive Design

### Mobile-First Approach

- **Touch Targets**: Optimized for mobile interaction
- **Voice Input**: Primary interaction method on mobile
- **Progressive Enhancement**: Works without JavaScript

### Component System

- **Atomic Design**: Reusable UI components
- **Design Tokens**: Consistent spacing, colors, typography
- **Accessibility**: WCAG compliant with proper ARIA labels

## 🚀 Performance Optimizations

### Next.js Features

- **App Router**: Modern routing with layouts
- **Server Components**: Reduced client-side JavaScript
- **Image Optimization**: Automatic image processing
- **Static Generation**: Pre-rendered pages where possible

### Database Optimization

- **Indexes**: Optimized queries for common operations
- **Connection Pooling**: Efficient database connections
- **Caching**: React Query for client-side caching

## 🔧 Development Workflow

### Branch Strategy

- **Main Branch**: Production-ready code
- **Feature Branches**: Short-lived branches for specific features
- **Merge Strategy**: Feature → Main → Deploy

### Quality Assurance

- **TypeScript**: Strict type checking
- **ESLint/Prettier**: Code formatting and linting
- **Jest Testing**: Unit and integration tests
- **Snapshot Tests**: UI consistency validation

## 🌍 Internationalization Ready

### i18n Architecture

- **Translation Keys**: Structured for easy localization
- **Locale Support**: Date, number, currency formatting
- **Content Management**: Separate translation files
- **Language Detection**: Browser and user preference based

This architecture supports the current feature development plan while maintaining scalability and maintainability.
