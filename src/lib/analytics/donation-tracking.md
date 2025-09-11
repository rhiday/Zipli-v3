# Donation Tracking Events

This document outlines the PostHog tracking events implemented for donation lifecycle management.

## Events Tracked

### 1. `donation_created`

**Triggered when:** A new donation is successfully created
**Location:** `src/store/supabaseDatabaseStore.ts` - `addDonation` method
**Properties:**

- `donation_id`: Unique identifier for the donation
- `quantity`: Amount/quantity of the donation
- `status`: Initial status (usually 'available')
- `has_pickup_slots`: Boolean indicating if pickup slots are configured
- `pickup_slots_count`: Number of pickup slots configured
- `has_instructions`: Boolean indicating if driver instructions are provided

### 2. `donation_completed`

**Triggered when:** Donation status changes to 'picked_up' (completion)
**Locations:**

- `src/store/supabaseDatabaseStore.ts` - `updateDonation` method
- `src/app/donate/[id]/handover-confirm/page.tsx` - handover confirmation
  **Properties:**
- `donation_id`: Unique identifier for the donation
- `quantity`: Amount/quantity of the donation
- `previous_status`: Status before the change
- `new_status`: New status ('picked_up')
- `claimed_at`: Timestamp when donation was claimed (if available)
- `picked_up_at`: Timestamp when donation was picked up (if available)
- `completion_method`: How completion was triggered ('handover_confirmation' for direct updates)

### 3. `donation_cancelled`

**Triggered when:** Donation is cancelled or deleted
**Locations:**

- `src/store/supabaseDatabaseStore.ts` - `updateDonation` method (status change to 'cancelled')
- `src/store/supabaseDatabaseStore.ts` - `deleteDonation` method (deletion)
  **Properties:**
- `donation_id`: Unique identifier for the donation
- `quantity`: Amount/quantity of the donation
- `previous_status`: Status before the change
- `new_status`: New status ('cancelled' or 'deleted')
- `cancellation_method`: How cancellation was triggered ('deletion' for deletions)

## Implementation Notes

- All tracking uses dynamic imports to avoid SSR issues
- Tracking only occurs in browser environment (`typeof window !== 'undefined'`)
- Events include relevant metadata for analytics and debugging
- Status changes are tracked with both previous and new status for funnel analysis

## Database Triggers

Note: Database triggers in `supabase/migrations/20250813_setup_rls_policies.sql` automatically update donation status when claims are approved/completed. These changes are not currently tracked via PostHog as they occur at the database level. Consider implementing a webhook or additional tracking mechanism for these automated status changes.
