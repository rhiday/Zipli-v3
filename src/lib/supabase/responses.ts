import type { Database } from './types';

export type DonationRow = Database['public']['Tables']['donations']['Row'];
export type FoodItemRow = Database['public']['Tables']['food_items']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export interface BaseResponse<T> {
  data: T | null;
  error: any; // We can make this more specific later if needed
  loading?: boolean;
}

export interface DonationResponse extends BaseResponse<DonationRow> {}

export interface DonationWithFoodItemResponse extends BaseResponse<DonationRow & {
  food_item: FoodItemRow;
}> {}

export interface DonationsListResponse extends BaseResponse<(DonationRow & {
  food_item: FoodItemRow;
})[]> {}

export interface ProfileResponse extends BaseResponse<ProfileRow> {} 