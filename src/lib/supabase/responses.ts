import { Donation, FoodItem, Profile } from './types';

export interface BaseResponse<T> {
  data: T | null;
  error: any; // We can make this more specific later if needed
  loading?: boolean;
}

export interface DonationResponse extends BaseResponse<Donation> {}

export interface DonationWithFoodItemResponse extends BaseResponse<Donation & {
  food_item: FoodItem;
}> {}

export interface DonationsListResponse extends BaseResponse<(Donation & {
  food_item: FoodItem;
})[]> {}

export interface ProfileResponse extends BaseResponse<Profile> {} 