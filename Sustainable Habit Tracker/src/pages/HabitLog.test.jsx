import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import HabitLog from './HabitLog';
 
// ── Hoist mocks (same pattern as habitlog.test.js) ───────────────────────────
const { mockGetUser, mockNavigate } = vi.hoisted(() => ({
  mockGetUser:  vi.fn(),
  mockNavigate: vi.fn(),
}));
 
// ── Mock react-router-dom ─────────────────────────────────────────────────────
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
}));
 
// ── Mock supabaseClient (matching your '../supabaseClient' path) ───────────────
vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: mockGetUser,
    },
  },
}));
 
// ── Mock habitlog service ─────────────────────────────────────────────────────
const { mockGetHabitsByCategory, mockLogNormalHabit, mockLogTransportHabit } = vi.hoisted(() => ({
  mockGetHabitsByCategory: vi.fn(),
  mockLogNormalHabit:      vi.fn(),
  mockLogTransportHabit:   vi.fn(),
}));
 
vi.mock('../services/habitlog.js', () => ({
  getHabitsByCategory: mockGetHabitsByCategory,
  logNormalHabit:      mockLogNormalHabit,
  logTransportHabit:   mockLogTransportHabit,
}));
 
// ── Stub data ─────────────────────────────────────────────────────────────────
const HABIT_STUBS = {
  food:      [{ id: 'food-1',      habit_name: 'Compost food scraps'    }],
  transport: [{ id: 'transport-1', habit_name: 'Cycle instead of drive' }],
  shopping:  [{ id: 'shopping-1',  habit_name: 'Buy second-hand'        }],
};
 
const renderComponent = () =>
  render(
    <MemoryRouter>
      <HabitLog />
    </MemoryRouter>
  );
 
// ── Tests ─────────────────────────────────────────────────────────────────────
describe('HabitLog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
 
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'test-user-123' } },
    });
 
    mockGetHabitsByCategory.mockImplementation((category) =>
      Promise.resolve({ data: HABIT_STUBS[category] ?? [], error: null })
    );
 
    mockLogNormalHabit.mockResolvedValue({ data: {}, error: null });
    mockLogTransportHabit.mockResolvedValue({ data: {}, error: null });
  });
 
  describe('Food waste recycling', () => {
    it('LOG-IT-01: selects a food waste recycling habit and saves it', async () => {
      renderComponent();
 
      // Food is selected by default — wait for dropdown to populate
      const dropdown = await screen.findByRole('combobox');
      fireEvent.change(dropdown, { target: { value: 'food-1' } });
 
      fireEvent.click(screen.getByRole('button', { name: /save activity/i }));
 
      await waitFor(() => {
        expect(mockLogNormalHabit).toHaveBeenCalledOnce();
        expect(mockLogNormalHabit).toHaveBeenCalledWith('test-user-123', 'food-1');
      });
 
      expect(await screen.findByText(/habit logged successfully/i)).toBeInTheDocument();
    });
  });
 
  describe('Transport', () => {
    it('LOG-IT-02: selects a transport habit with a positive distance and saves it', async () => {
      renderComponent();
 
      // Switch to Transport
      fireEvent.click(screen.getByRole('radio', { name: /transport/i }));
 
      await waitFor(() =>
        expect(mockGetHabitsByCategory).toHaveBeenCalledWith('transport')
      );
 
      const dropdown = await screen.findByRole('combobox');
      fireEvent.change(dropdown, { target: { value: 'transport-1' } });
 
      fireEvent.change(screen.getByPlaceholderText(/e\.g\.,?\s*5\.5/i), {
        target: { value: '12.5' },
      });
 
      fireEvent.click(screen.getByRole('button', { name: /save activity/i }));
 
      await waitFor(() => {
        expect(mockLogTransportHabit).toHaveBeenCalledOnce();
        expect(mockLogTransportHabit).toHaveBeenCalledWith('test-user-123', 'transport-1', 12.5);
      });
 
      expect(await screen.findByText(/habit logged successfully/i)).toBeInTheDocument();
    });
  });
 
  describe('Shopping alternatives', () => {
    it('LOG-IT-04: selects a shopping alternative habit and saves it', async () => {
      renderComponent();
 
      // Switch to Shopping
      fireEvent.click(screen.getByRole('radio', { name: /shopping/i }));
 
      await waitFor(() =>
        expect(mockGetHabitsByCategory).toHaveBeenCalledWith('shopping')
      );
 
      const dropdown = await screen.findByRole('combobox');
      fireEvent.change(dropdown, { target: { value: 'shopping-1' } });
 
      fireEvent.click(screen.getByRole('button', { name: /save activity/i }));
 
      await waitFor(() => {
        expect(mockLogNormalHabit).toHaveBeenCalledOnce();
        expect(mockLogNormalHabit).toHaveBeenCalledWith('test-user-123', 'shopping-1');
      });
 
      expect(await screen.findByText(/habit logged successfully/i)).toBeInTheDocument();
    });
  });
});