import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home.jsx';
import { calculateTotalCO2, getRandomTipContent, getUsername } from './Home'

// Mock supabase
vi.mock('../supabaseClient', () => ({
    supabase: {
        auth: {
            getUser: vi.fn().mockResolvedValue({
                data: {
                    user: {
                        id: 'test-user-id',
                        user_metadata: { name: 'Salami' },
                    },
                },
            }),
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn().mockResolvedValue({ data: [] }),
            })),
        })),
    },
}));

// Mock prediction service
vi.mock('../services/activityPrediction', () => ({
    getCombinedSuggestions: vi.fn().mockResolvedValue({ data: [], error: null }),
}));

// Mock habitlog service
vi.mock('../services/habitlog.js', () => ({
    logNormalHabit: vi.fn().mockResolvedValue({ error: null }),
    logTransportHabit: vi.fn().mockResolvedValue({ error: null }),
}));

// Unit tests
describe('calculateTotalCO2', () => {
    it('correctly adds up CO2 values from habit logs', () => {
        const fakeLogs = [
            { total_co2_saved: 2.5 },
            { total_co2_saved: 4.0 },
        ]
        expect(calculateTotalCO2(fakeLogs)).toBe(6.5)
    })
})

describe('getRandomTipContent', () => {
    it('returns a tip that exists in the array', () => {
        const fakeTips = [
            { content: 'Tip one' },
            { content: 'Tip two' },
            { content: 'Tip three' },
        ]
        const result = getRandomTipContent(fakeTips)
        expect(result).toBeDefined()
        expect(fakeTips.map(tip => tip.content)).toContain(result)
    })
})

describe('getUsername', () => {
    it('returns name when name is present', () => {
        const fakeMetadata = { name: 'John', username: 'john123' }
        const result = getUsername(fakeMetadata)
        expect(result).toBe('John')
    })

    it('return username when name is not present', () => {
        const fakeMetadata = { username: 'john123' }
        const result = getUsername(fakeMetadata)
        expect(result).toBe('john123')
    })

    it('return default name when username and name are not present', () => {
        const fakeMetadata = {}
        const result = getUsername(fakeMetadata)
        expect(result).toBe('Eco Warrior')
    })
})

function renderHome() {
    return render(
        <MemoryRouter>
            <Home />
        </MemoryRouter>
    );
}

// Integration tests
describe('Home Page Integration Tests', function () {

    test('HOME-IT-01: Greeting message renders with username', async function () {
        renderHome();
        await waitFor(function () {
            expect(screen.getByText('Hello, Salami! 🌍')).toBeDefined();
        });
    });

    test('HOME-IT-02: Stats widgets are present on page', async function () {
        renderHome();
        await waitFor(function () {
            expect(screen.getByText('kg CO₂ Saved')).toBeDefined();
            expect(screen.getByText('Activities Logged')).toBeDefined();
        });
    });

    test('HOME-IT-03: Quick Logs section is hidden when there are no predictions', async function () {
        renderHome();
        await waitFor(function () {
            expect(screen.queryByText('⚡ Quick Logs')).toBeNull();
        });
    });

    test('HOME-IT-04: Quick Logs section shows when predictions are returned', async function () {
        const { getCombinedSuggestions } = await import('../services/activityPrediction');
        getCombinedSuggestions.mockResolvedValueOnce({
            data: [
                { id: '1', name: 'Water bottle', category: 'shopping', source: 'timed' },
            ],
            error: null,
        });

        renderHome();
        await waitFor(function () {
            expect(screen.getByText('⚡ Quick Logs')).toBeDefined();
            expect(screen.getByText('Water bottle')).toBeDefined();
        });
    });

    test('HOME-IT-05: "Usually logged at this time" label shown for timed prediction', async function () {
        const { getCombinedSuggestions } = await import('../services/activityPrediction');
        getCombinedSuggestions.mockResolvedValueOnce({
            data: [
                { id: '1', name: 'Water bottle', category: 'shopping', source: 'timed' },
            ],
            error: null,
        });

        renderHome();
        await waitFor(function () {
            expect(screen.getByText(/usually logged at this time/i)).toBeDefined();
        });
    });

    test('HOME-IT-06: "Frequently logged" label shown for frequency prediction', async function () {
        const { getCombinedSuggestions } = await import('../services/activityPrediction');
        getCombinedSuggestions.mockResolvedValueOnce({
            data: [
                { id: '2', name: 'Cycling', category: 'transport', source: 'frequent' },
            ],
            error: null,
        });

        renderHome();
        await waitFor(function () {
            expect(screen.getByText(/frequently logged/i)).toBeDefined();
        });
    });

    test('HOME-IT-07: Quick Actions buttons link to correct pages', async function () {
        renderHome();
        await waitFor(function () {
            expect(screen.getByText(/Log a New Habit/i)).toBeDefined();
            expect(screen.getByText(/View My Progress/i)).toBeDefined();
        });
    });

    test('HOME-IT-08: Daily Eco-Tip section is present', async function () {
        renderHome();
        await waitFor(function () {
            expect(screen.getByText(/Daily Eco-Tip/i)).toBeDefined();
        });
    });

});
