-- =====================================================
-- Add sodexo_admin role to user_role enum
-- Created: 2025-10-08
-- Description: Adds sodexo_admin role for Sodexo administrators
-- =====================================================

-- Add sodexo_admin to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'sodexo_admin';
