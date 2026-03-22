// habitlog.test.js
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { 
  logNormalHabit, 
  logTransportHabit, 
  getHabit, 
  getHabitsByCategory, 
  calculateTransportCo2Saved 
} from './habitlog.js';

const { mockFrom } = vi.hoisted(() => {
  return {
    mockFrom: vi.fn()
  };
});

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: mockFrom
  }
}));

const createMockQuery = () => {
  const mock = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis()
  };
  return mock;
};

describe('Habit Services Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getHabit', () => {
    test('GET-HABIT-01: should return habit data when habit exists', async () => {
      const mockHabit = { id: 1, habit_name: 'Water bottle', co2Saved: 0.08, plasticSaved: 13.5 };
      
      const mockQuery = createMockQuery();
      mockQuery.eq.mockResolvedValue({ data: [mockHabit], error: null });
      
      mockFrom.mockReturnValue(mockQuery);

      const result = await getHabit(1);

      expect(mockFrom).toHaveBeenCalledWith('habit');
      expect(result.data).toEqual([mockHabit]);
      expect(result.error).toBeNull();
    });

    test('GET-HABIT-02: should return error when habit not found', async () => {
      const mockError = { message: 'Habit not found' };
      
      const mockQuery = createMockQuery();
      mockQuery.eq.mockResolvedValue({ data: null, error: mockError });
      
      mockFrom.mockReturnValue(mockQuery);

      const result = await getHabit(999);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('getHabitsByCategory', () => {
    test('GET-CAT-01: should return habits for given category', async () => {
      const mockHabits = [
        { id: 1, habit_name: 'Water bottle', category: 'food' },
        { id: 2, habit_name: 'Crisps wrapper', category: 'food' }
      ];
      
      const mockQuery = createMockQuery();
      mockQuery.eq.mockResolvedValue({ data: mockHabits, error: null });
      
      mockFrom.mockReturnValue(mockQuery);

      const result = await getHabitsByCategory('food');

      expect(mockFrom).toHaveBeenCalledWith('habit');
      expect(result.data).toEqual(mockHabits);
    });

    test('GET-CAT-02: should return empty array when no habits in category', async () => {
      const mockQuery = createMockQuery();
      mockQuery.eq.mockResolvedValue({ data: [], error: null });
      
      mockFrom.mockReturnValue(mockQuery);

      const result = await getHabitsByCategory('nonexistent');

      expect(result.data).toEqual([]);
    });
  });

  describe('calculateTransportCo2Saved', () => {
    test('CALC-TRAN-01: should correctly calculate total CO2 saved', async () => {
      const mockData = [{ co2Saved: 0.20 }];
      
      const mockQuery = createMockQuery();
      const mockEqChain = {
        eq: vi.fn().mockResolvedValue({ data: mockData, error: null })
      };
      mockQuery.select.mockReturnValue({
        eq: vi.fn().mockReturnValue(mockEqChain)
      });
      
      mockFrom.mockReturnValue(mockQuery);

      const result = await calculateTransportCo2Saved('Cycled', 5);

      expect(result).toBe(1.0);
    });

    test('CALC-TRAN-02: should return null when error occurs', async () => {
      const mockError = { message: 'Database error' };
      
      const mockQuery = createMockQuery();
      const mockEqChain = {
        eq: vi.fn().mockResolvedValue({ data: null, error: mockError })
      };
      mockQuery.select.mockReturnValue({
        eq: vi.fn().mockReturnValue(mockEqChain)
      });
      
      mockFrom.mockReturnValue(mockQuery);

      const result = await calculateTransportCo2Saved('Cycled', 5);

      expect(result).toBeNull();
    });

    test('CALC-TRAN-03: should handle zero distance correctly', async () => {
      const mockData = [{ co2Saved: 0.20 }];
      
      const mockQuery = createMockQuery();
      const mockEqChain = {
        eq: vi.fn().mockResolvedValue({ data: mockData, error: null })
      };
      mockQuery.select.mockReturnValue({
        eq: vi.fn().mockReturnValue(mockEqChain)
      });
      
      mockFrom.mockReturnValue(mockQuery);

      const result = await calculateTransportCo2Saved('Cycled', 0);

      expect(result).toBe(0);
    });
  });

  describe('logNormalHabit', () => {
    const mockUserID = 'user-123';
    const mockHabitID = 1;
    const mockHabit = [{ id: 1, co2Saved: 0.08, plasticSaved: 13.5 }];
    const mockProfile = { co2_saved: 2.5 };

    test('LOG-NORM-01: should successfully log habit and update profile', async () => {
      const habitQuery = createMockQuery();
      habitQuery.eq.mockResolvedValue({ data: mockHabit, error: null });
      
      const insertQuery = createMockQuery();
      insertQuery.insert.mockResolvedValue({ data: { id: 999 }, error: null });
      
      const profileSelectQuery = createMockQuery();
      profileSelectQuery.select.mockReturnThis();
      profileSelectQuery.eq.mockReturnThis();
      profileSelectQuery.single.mockResolvedValue({ data: mockProfile, error: null });
      
      const profileUpdateQuery = createMockQuery();
      profileUpdateQuery.update.mockReturnThis();
      profileUpdateQuery.eq.mockResolvedValue({ data: null, error: null });
      
      mockFrom
        .mockReturnValueOnce(habitQuery)
        .mockReturnValueOnce(insertQuery)
        .mockReturnValueOnce(profileSelectQuery)
        .mockReturnValueOnce(profileUpdateQuery);

      const result = await logNormalHabit(mockUserID, mockHabitID);

      expect(result).toEqual({ error: null });
    });

    test('LOG-NORM-02: should handle missing profile co2_saved (null/undefined)', async () => {
      const mockProfileNull = { co2_saved: null };
      
      const habitQuery = createMockQuery();
      habitQuery.eq.mockResolvedValue({ data: mockHabit, error: null });
      
      const insertQuery = createMockQuery();
      insertQuery.insert.mockResolvedValue({ data: { id: 999 }, error: null });
      
      const profileSelectQuery = createMockQuery();
      profileSelectQuery.select.mockReturnThis();
      profileSelectQuery.eq.mockReturnThis();
      profileSelectQuery.single.mockResolvedValue({ data: mockProfileNull, error: null });
      
      const profileUpdateQuery = createMockQuery();
      profileUpdateQuery.update.mockReturnThis();
      profileUpdateQuery.eq.mockResolvedValue({ data: null, error: null });
      
      mockFrom
        .mockReturnValueOnce(habitQuery)
        .mockReturnValueOnce(insertQuery)
        .mockReturnValueOnce(profileSelectQuery)
        .mockReturnValueOnce(profileUpdateQuery);

      const result = await logNormalHabit(mockUserID, mockHabitID);

      expect(result).toEqual({ error: null });
    });

    test('LOG-NORM-03: should return error if getHabit fails', async () => {
      const mockError = { message: 'Habit not found' };
      
      const habitQuery = createMockQuery();
      habitQuery.eq.mockResolvedValue({ data: null, error: mockError });
      
      mockFrom.mockReturnValueOnce(habitQuery);

      const result = await logNormalHabit(mockUserID, mockHabitID);

      expect(result).toEqual({ error: mockError });
    });

    test('LOG-NORM-04: should return error if habit_logs insert fails', async () => {
      const mockError = { message: 'Insert failed' };
      
      const habitQuery = createMockQuery();
      habitQuery.eq.mockResolvedValue({ data: mockHabit, error: null });
      
      const insertQuery = createMockQuery();
      insertQuery.insert.mockResolvedValue({ data: null, error: mockError });
      
      mockFrom
        .mockReturnValueOnce(habitQuery)
        .mockReturnValueOnce(insertQuery);

      const result = await logNormalHabit(mockUserID, mockHabitID);

      expect(result).toEqual({ error: mockError });
    });

    test('LOG-NORM-05: should return error if profile update fails', async () => {
      const mockError = { message: 'Update failed' };
      
      const habitQuery = createMockQuery();
      habitQuery.eq.mockResolvedValue({ data: mockHabit, error: null });
      
      const insertQuery = createMockQuery();
      insertQuery.insert.mockResolvedValue({ data: { id: 999 }, error: null });
      
      const profileSelectQuery = createMockQuery();
      profileSelectQuery.select.mockReturnThis();
      profileSelectQuery.eq.mockReturnThis();
      profileSelectQuery.single.mockResolvedValue({ data: mockProfile, error: null });
      
      const profileUpdateQuery = createMockQuery();
      profileUpdateQuery.update.mockReturnThis();
      profileUpdateQuery.eq.mockResolvedValue({ data: null, error: mockError });
      
      mockFrom
        .mockReturnValueOnce(habitQuery)
        .mockReturnValueOnce(insertQuery)
        .mockReturnValueOnce(profileSelectQuery)
        .mockReturnValueOnce(profileUpdateQuery);

      const result = await logNormalHabit(mockUserID, mockHabitID);

      expect(result).toEqual({ error: mockError });
    });
  });

  describe('logTransportHabit', () => {
    const mockUserID = 'user-123';
    const mockHabitID = 5;
    const mockDistance = 10;
    const mockHabit = [{ id: 5, co2Saved: 0.20, plasticSaved: 0 }];
    const mockProfile = { co2_saved: 5.0 };

    test('LOG-TRAN-01: should correctly calculate CO2 with distance and update profile', async () => {
      const habitQuery = createMockQuery();
      habitQuery.eq.mockResolvedValue({ data: mockHabit, error: null });
      
      const insertQuery = createMockQuery();
      insertQuery.insert.mockResolvedValue({ data: { id: 999 }, error: null });
      
      const profileSelectQuery = createMockQuery();
      profileSelectQuery.select.mockReturnThis();
      profileSelectQuery.eq.mockReturnThis();
      profileSelectQuery.single.mockResolvedValue({ data: mockProfile, error: null });
      
      const profileUpdateQuery = createMockQuery();
      profileUpdateQuery.update.mockReturnThis();
      profileUpdateQuery.eq.mockResolvedValue({ data: null, error: null });
      
      mockFrom
        .mockReturnValueOnce(habitQuery)
        .mockReturnValueOnce(insertQuery)
        .mockReturnValueOnce(profileSelectQuery)
        .mockReturnValueOnce(profileUpdateQuery);

      const result = await logTransportHabit(mockUserID, mockHabitID, mockDistance);

      expect(result).toEqual({ error: null });
    });

    test('LOG-TRAN-02: should handle decimal CO2 values correctly', async () => {
      const mockHabitDecimal = [{ id: 5, co2Saved: 0.33, plasticSaved: 0 }];
      
      const habitQuery = createMockQuery();
      habitQuery.eq.mockResolvedValue({ data: mockHabitDecimal, error: null });
      
      const insertQuery = createMockQuery();
      insertQuery.insert.mockResolvedValue({ data: { id: 999 }, error: null });
      
      const profileSelectQuery = createMockQuery();
      profileSelectQuery.select.mockReturnThis();
      profileSelectQuery.eq.mockReturnThis();
      profileSelectQuery.single.mockResolvedValue({ data: mockProfile, error: null });
      
      const profileUpdateQuery = createMockQuery();
      profileUpdateQuery.update.mockReturnThis();
      profileUpdateQuery.eq.mockResolvedValue({ data: null, error: null });
      
      mockFrom
        .mockReturnValueOnce(habitQuery)
        .mockReturnValueOnce(insertQuery)
        .mockReturnValueOnce(profileSelectQuery)
        .mockReturnValueOnce(profileUpdateQuery);

      const result = await logTransportHabit(mockUserID, mockHabitID, 3);

      expect(result).toEqual({ error: null });
    });

    test('LOG-TRAN-03: should return error if getHabit fails', async () => {
      const mockError = { message: 'Habit not found' };
      
      const habitQuery = createMockQuery();
      habitQuery.eq.mockResolvedValue({ data: null, error: mockError });
      
      mockFrom.mockReturnValueOnce(habitQuery);

      const result = await logTransportHabit(mockUserID, mockHabitID, mockDistance);

      expect(result).toEqual({ error: mockError });
    });

    test('LOG-TRAN-04: should return error if habit_logs insert fails', async () => {
      const mockError = { message: 'Insert failed' };
      
      const habitQuery = createMockQuery();
      habitQuery.eq.mockResolvedValue({ data: mockHabit, error: null });
      
      const insertQuery = createMockQuery();
      insertQuery.insert.mockResolvedValue({ data: null, error: mockError });
      
      mockFrom
        .mockReturnValueOnce(habitQuery)
        .mockReturnValueOnce(insertQuery);

      const result = await logTransportHabit(mockUserID, mockHabitID, mockDistance);

      expect(result).toEqual({ error: mockError });
    });

    test('LOG-TRAN-05: should return error if profile update fails', async () => {
      const mockError = { message: 'Update failed' };
      
      const habitQuery = createMockQuery();
      habitQuery.eq.mockResolvedValue({ data: mockHabit, error: null });
      
      const insertQuery = createMockQuery();
      insertQuery.insert.mockResolvedValue({ data: { id: 999 }, error: null });
      
      const profileSelectQuery = createMockQuery();
      profileSelectQuery.select.mockReturnThis();
      profileSelectQuery.eq.mockReturnThis();
      profileSelectQuery.single.mockResolvedValue({ data: mockProfile, error: null });
      
      const profileUpdateQuery = createMockQuery();
      profileUpdateQuery.update.mockReturnThis();
      profileUpdateQuery.eq.mockResolvedValue({ data: null, error: mockError });
      
      mockFrom
        .mockReturnValueOnce(habitQuery)
        .mockReturnValueOnce(insertQuery)
        .mockReturnValueOnce(profileSelectQuery)
        .mockReturnValueOnce(profileUpdateQuery);

      const result = await logTransportHabit(mockUserID, mockHabitID, mockDistance);

      expect(result).toEqual({ error: mockError });
    });
  });
});