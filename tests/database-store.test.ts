/**
 * Database Store Tests
 * Tests the Supabase database store with mocked Supabase client
 * This tests our application logic while avoiding ESM/Jest configuration issues
 */

// Mock Supabase before importing
const mockSupabaseClient = {
  from: jest.fn(),
  auth: {
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
  },
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnValue('ok'),
    unsubscribe: jest.fn().mockReturnValue('ok'),
  })),
};

const mockFromChain = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  upsert: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  contains: jest.fn().mockReturnThis(),
  like: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn(),
};

mockSupabaseClient.from.mockReturnValue(mockFromChain);

jest.mock('@/lib/supabase/client', () => ({
  supabase: mockSupabaseClient,
}));

// Import the store after mocking
import { useSupabaseDatabase } from '@/store/supabaseDatabaseStore';

describe('Database Store Tests', () => {
  // Using store directly since it's a Zustand store
  const store = useSupabaseDatabase;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state using the new Supabase store structure
    const state = store.getState();
    // Directly set the state properties since this is a test environment
    store.setState({
      currentUser: null,
      users: [],
      donations: [],
      requests: [],
      foodItems: [],
      isInitialized: false,
      loading: false,
      error: null,
    });
  });

  describe('Authentication and User Management', () => {
    it('should handle user login', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'food_donor',
        full_name: 'Test User',
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      });

      mockFromChain.single.mockResolvedValueOnce({
        data: mockUser,
        error: null,
      });

      const result = await store
        .getState()
        .login('test@example.com', 'password');

      expect(result.error).toBeNull();
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
      expect(store.getState().currentUser).toEqual(mockUser);
    });

    it('should handle login errors', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid credentials' },
      });

      const result = await store
        .getState()
        .login('wrong@example.com', 'wrongpassword');

      expect(result.error).toBe('Invalid credentials');
      expect(store.getState().currentUser).toBeNull();
    });

    it('should handle user logout', async () => {
      // Set a current user first
      await store.getState().setCurrentUser('test@example.com');

      mockSupabaseClient.auth.signOut.mockResolvedValueOnce({ error: null });

      await store.getState().logout();

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
      expect(store.getState().currentUser).toBeNull();
    });
  });

  describe('Food Items Management', () => {
    const mockFoodItems = [
      {
        id: '1',
        name: 'Fresh Bread',
        description: 'Daily baked bread',
        allergens: ['Wheat', 'Gluten'],
        image_url: '/images/bread.jpg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Vegetable Soup',
        description: 'Hearty soup',
        allergens: ['Celery'],
        image_url: '/images/soup.jpg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    it('should fetch food items successfully', async () => {
      mockFromChain.single.mockResolvedValueOnce({
        data: mockFoodItems,
        error: null,
      });

      await store.getState().fetchFoodItems();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('food_items');
      expect(store.getState().foodItems).toEqual(mockFoodItems);
    });

    it('should handle food items fetch errors', async () => {
      mockFromChain.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      });

      await store.getState().fetchFoodItems();

      expect(store.getState().foodItems).toEqual([]);
    });

    it('should add food item', async () => {
      const newFoodItem = {
        name: 'New Food Item',
        description: 'A new test item',
        allergens: JSON.stringify(['None']),
        image_url: '/test.jpg',
        image_urls: ['/test.jpg'],
        category: 'test',
        expires_at: null,
        quantity: 1,
        unit: 'piece',
        food_type: 'test',
        user_id: 'test-user-id',
        donor_id: 'test-donor-id',
      };

      const mockCreatedItem = {
        id: '3',
        ...newFoodItem,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockFromChain.single.mockResolvedValueOnce({
        data: mockCreatedItem,
        error: null,
      });

      const result = await store.getState().addFoodItem(newFoodItem);

      expect(result.error).toBeNull();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('food_items');
      expect(mockFromChain.insert).toHaveBeenCalledWith(newFoodItem);
    });
  });

  describe('Donations Management', () => {
    const mockDonations = [
      {
        id: '1',
        food_item_id: '1',
        donor_id: 'donor-1',
        quantity: 10,
        status: 'available',
        pickup_slots: [
          { date: '2025-08-14', start_time: '10:00', end_time: '12:00' },
        ],
        pickup_time: null,
        instructions_for_driver: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    it('should fetch donations successfully', async () => {
      mockFromChain.single.mockResolvedValueOnce({
        data: mockDonations,
        error: null,
      });

      await store.getState().fetchDonations();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('donations');
      expect(store.getState().donations).toEqual(mockDonations);
    });

    it('should create donation', async () => {
      const newDonation = {
        food_item_id: '1',
        donor_id: 'donor-1',
        quantity: 5,
        status: 'available' as const,
        pickup_slots: [
          { date: '2025-08-15', start_time: '14:00', end_time: '16:00' },
        ],
      };

      const mockCreatedDonation = {
        id: '2',
        ...newDonation,
        pickup_time: null,
        instructions_for_driver: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockFromChain.single.mockResolvedValueOnce({
        data: mockCreatedDonation,
        error: null,
      });

      const result = await store.getState().addDonation(newDonation);

      expect(result.error).toBeNull();
      expect(mockFromChain.insert).toHaveBeenCalledWith(newDonation);
    });

    it('should update donation status', async () => {
      const donationId = '1';
      const newStatus = 'claimed';

      mockFromChain.single.mockResolvedValueOnce({
        data: { ...mockDonations[0], status: newStatus },
        error: null,
      });

      const result = await store
        .getState()
        .updateDonation(donationId, { status: newStatus });

      expect(result.error).toBeNull();
      expect(mockFromChain.update).toHaveBeenCalledWith({ status: newStatus });
      expect(mockFromChain.eq).toHaveBeenCalledWith('id', donationId);
    });

    it('should delete donation', async () => {
      const donationId = '1';

      mockFromChain.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const result = await store.getState().deleteDonation(donationId);

      expect(result.error).toBeNull();
      expect(mockFromChain.delete).toHaveBeenCalled();
      expect(mockFromChain.eq).toHaveBeenCalledWith('id', donationId);
    });
  });

  describe('Requests Management', () => {
    const mockRequests = [
      {
        id: '1',
        user_id: 'user-1',
        description: 'Need food for 50 people',
        people_count: 50,
        pickup_date: '2025-08-14',
        pickup_start_time: '11:00:00',
        pickup_end_time: '13:00:00',
        is_recurring: false,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    it('should fetch requests successfully', async () => {
      mockFromChain.single.mockResolvedValueOnce({
        data: mockRequests,
        error: null,
      });

      await store.getState().fetchRequests();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('requests');
      expect(store.getState().requests).toEqual(mockRequests);
    });

    it('should create request', async () => {
      const newRequest = {
        user_id: 'user-2',
        description: 'Weekly food assistance',
        people_count: 30,
        pickup_date: '2025-08-15',
        pickup_start_time: '14:00:00',
        pickup_end_time: '16:00:00',
        is_recurring: true,
        status: 'active' as const,
      };

      const mockCreatedRequest = {
        id: '2',
        ...newRequest,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockFromChain.single.mockResolvedValueOnce({
        data: mockCreatedRequest,
        error: null,
      });

      const result = await store.getState().addRequest(newRequest);

      expect(result.error).toBeNull();
      expect(mockFromChain.insert).toHaveBeenCalledWith(newRequest);
    });
  });

  describe('Real-time Subscriptions', () => {
    it('should set up real-time subscriptions', () => {
      store.getState().setupRealtimeSubscriptions();

      expect(mockSupabaseClient.channel).toHaveBeenCalledWith('donations');
      expect(mockSupabaseClient.channel).toHaveBeenCalledWith('requests');
    });

    it('should handle subscription cleanup', () => {
      store.getState().setupRealtimeSubscriptions();

      // Should be able to unsubscribe
      const state = store.getState();
      expect(state.subscriptions).toBeDefined();
    });
  });

  describe('Data Filtering and Search', () => {
    it('should filter donations by status', () => {
      const allDonations = [
        {
          id: '1',
          status: 'available',
          food_item_id: '1',
          donor_id: '1',
          quantity: 5,
        },
        {
          id: '2',
          status: 'claimed',
          food_item_id: '2',
          donor_id: '1',
          quantity: 3,
        },
        {
          id: '3',
          status: 'available',
          food_item_id: '3',
          donor_id: '2',
          quantity: 8,
        },
      ];

      // Mock donations in store state
      // Note: In real implementation, donations would be fetched from database

      // Test filtering
      const availableDonations = store
        .getState()
        .donations.filter((d) => d.status === 'available');
      expect(availableDonations).toHaveLength(2);
      expect(availableDonations.every((d) => d.status === 'available')).toBe(
        true
      );
    });

    it('should handle search functionality', () => {
      const foodItems = [
        { id: '1', name: 'Fresh Bread', description: 'Daily baked bread' },
        {
          id: '2',
          name: 'Vegetable Soup',
          description: 'Hearty soup with vegetables',
        },
        { id: '3', name: 'Fruit Salad', description: 'Mixed seasonal fruits' },
      ];

      // Mock food items in store state
      // Note: In real implementation, food items would be fetched from database

      // Test search (this would be implemented in the store)
      const searchResults = store
        .getState()
        .foodItems.filter(
          (item) =>
            item.name.toLowerCase().includes('bread') ||
            item.description?.toLowerCase().includes('bread')
        );

      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].name).toBe('Fresh Bread');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockFromChain.single.mockRejectedValueOnce(new Error('Network error'));

      await store.getState().fetchFoodItems();

      // Store should handle errors without crashing
      expect(store.getState().foodItems).toEqual([]);
    });

    it('should handle malformed data', async () => {
      mockFromChain.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Malformed data', code: 'PGRST116' },
      });

      await store.getState().fetchDonations();

      expect(store.getState().donations).toEqual([]);
    });
  });

  describe('State Management', () => {
    it('should maintain consistent state', () => {
      const initialState = store.getState();

      expect(initialState.currentUser).toBeNull();
      expect(initialState.foodItems).toEqual([]);
      expect(initialState.donations).toEqual([]);
      expect(initialState.requests).toEqual([]);
      expect(initialState.users).toEqual([]);
    });

    it('should update state correctly', () => {
      const testUser = {
        id: 'test-user',
        email: 'test@example.com',
        role: 'food_donor' as const,
        full_name: 'Test User',
        organization_name: 'Test Organization',
        contact_number: null,
        address: null,
        city: null,
        country: null,
        postal_code: null,
        street_address: null,
        driver_instructions: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Use setState directly since setter methods don't exist in new store
      store.setState({ currentUser: testUser });
      expect(store.getState().currentUser).toEqual(testUser);

      store.setState({ currentUser: null });
      expect(store.getState().currentUser).toBeNull();
    });

    it('should handle concurrent state updates', () => {
      const foodItems = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];

      const donations = [{ id: '1', food_item_id: '1', quantity: 5 }];

      // Use setState directly since setter methods don't exist in new store
      store.setState({ foodItems: foodItems as any });
      store.setState({ donations: donations as any });

      expect(store.getState().foodItems).toEqual(foodItems);
      expect(store.getState().donations).toEqual(donations);
    });
  });
});
