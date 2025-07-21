# PRD: Zipli - Food Donation Platform (Supabase + Shadcn UI)

**Version:** 1.2  
**Date:** 2025-04-28

---

## 1. Introduction & Goal

Goal: Build "Zipli," a food donation platform connecting food donors (restaurants, caterers) with receivers (charities, individuals) and city officials to reduce food waste and enhance sustainability.

- Backend: Supabase (Auth, Database, Storage, Realtime)
- Frontend: Next.js 14 with Shadcn UI (Tailwind CSS, Radix UI)
- Hosting: Vercel / Netlify
- Style: Native app feel, fluid, smooth experience like Slack.

---

## 2. User Roles

1. Donor: Food providers who list and donate surplus food.
2. Receiver: Charities/individuals who request/claim food donations.
3. City Admin: City officials who monitor sustainability metrics and donations.

---

## 3. Functional Requirements

### 3.1 Authentication (Supabase Auth)

- Users sign up via email/password.
- Select role: Donor / Receiver / City Admin.
- Profiles linked to `auth.users` with additional metadata.
- Confirm email mandatory.
- Password reset and redirect handling.

### 3.2 Donor Workflow

- Dashboard showing today's menu and live donation statuses.
- Add new menu item:
  - Upload food image.
  - Add description, tags.
- Donation flow (Multi-Step):
  - Select food items to donate.
  - Input quantity.
  - Set pickup time window.
  - Confirm donation.
- Manage donations:
  - View claimed donations.
  - Mark picked up.
  - Cancel if necessary.

### 3.3 Receiver Workflow

- View available donations list.
- Rescue (claim) food:
  - Confirm pickup.
  - Scheduled pickups view.

### 3.4 City Admin Workflow

- Special login access.
- City-level dashboard:
  - 12-month overview of donations.
  - Graphs (Redistributed food, Surplus breakdown).
  - KPIs: Meals served, CO2 avoided, Freshwater saved.
  - Climate goal tracking.
  - Recommended sustainability actions.
- Dark mode enabled.

### 3.5 Notifications

- In-app toast alerts for major actions.
- Planned: Push notifications (web and mobile).

### 3.6 Multi-Step Flows

- Donate Food Flow
- Request Rescue Flow
- Password Recovery Flow

---

## 4. Database Schema (Supabase/PostgreSQL)

- Tables: `profiles`, `food_items`, `donations`
- Types:
  - `user_role` ENUM ('donor', 'receiver', 'city')
  - `donation_status` ENUM ('available', 'claimed', 'picked_up', 'cancelled')
- Relationships:
  - `profiles.id` -> `auth.users.id`
  - `food_items.donor_id` -> `profiles.id`
  - `donations.food_item_id` -> `food_items.id`
  - `donations.donor_id` -> `profiles.id`
  - `donations.receiver_id` -> `profiles.id` (nullable)
- Policies (RLS):
  - Secure access based on roles and ownership.
- Triggers:
  - `updated_at` auto-update.
  - New user profile creation.
- Indexes:
  - On `status`, `donor_id`, `receiver_id`.

---

## 5. UI/UX Requirements

- Technology: Shadcn UI, TailwindCSS, Radix UI
- Responsive Design: Mobile-first approach
- Navigation:
  - Bottom tabs (mobile) / Sidebar (desktop)
  - Pages: Dashboard, Donate, Request, Sustainability, Profile
- Dark Mode: For city view
- Loading States: Skeletons, spinners
- Error Handling: Toast alerts, error pages
- Components:
  - Reusable: Buttons, Cards, Modals, Tables, Inputs, Uploaders

### Design Layout Instructions

- Grid system for responsive layout
- Native app fluid feel (like Slack)
- Animations via Framer Motion
- Consistent use of `PrimaryButton`, `Dialog`, `Badge`, `Avatar`
- Modular file structure inside `/src/components/`, `/src/pages/`, `/src/utils/`
- Use `clsx` for className management

### Sample Layout Structure


---

## 6. Technology Stack

- Frontend: Next.js 14, React 18
- UI: Shadcn UI, Tailwind CSS, Radix UI
- Backend: Supabase
- State Management: React Query
- Testing: Jest, Testing Library
- Deployment: Vercel / Netlify

---

## 7. Non-Functional Requirements

- Security: Full RLS on Supabase tables
- Performance: Fast loads with SSG where needed
- Scalability: Modular and scalable structure
- Reliability: Error boundaries, minimal downtime
- Logging: Basic console logs and error tracking

---

## 8. Future Enhancements

- Voice-driven food donation updates
- Map integration for pickup locations
- Push notifications
- Admin panel for moderation
- React Native mobile app

---

# Notes for Cursor

- Cursor rule compliance in `CURSOR_RULES.md`
- Modular codebase
- Scaffolds ready for fast AI-based feature generation
- Mock Data included
- Basic tests included
- Public assets (images, favicon) prepared
- Focus on clean commits and atomic PRs
