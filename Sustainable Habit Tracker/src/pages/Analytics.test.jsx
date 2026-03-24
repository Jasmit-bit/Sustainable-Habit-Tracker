import {render, screen, waitFor} from '@testing-library/react';
import {describe, test, expect, vi, beforeAll} from 'vitest';
import Analytics from './Analytics.jsx';

//mock supabase client
vi.mock('../supabaseClient.js', () => ({
    supabase: {
        auth: {
            getUser: vi.fn().mockResolvedValue({data: {user: {id: 'test-user'}}})
        },
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({
                    data: [],
                    error: null
                })
            })
        })
    }   
}))

//mock habitlogging service - not running any tests on it here, but it imports at the top of Analytics.jsx so need
// to mock in order for the tests to run
vi.mock('../services/habitlog.js', () => ({
    logNormalHabit: vi.fn().mockResolvedValue({error: null}),
    logTransportHabit: vi.fn().mockResolvedValue({error: null})
}))

import {supabase} from '../supabaseClient.js';

describe('Analytics UI Integration Tests', function() {
    
    //PAGE RENDERING
    //ANA-IT-01 - Analytics page renders stats cards properly
    test('ANA-IT-01: Analytics page renders stats cards after data loads', async function() {
        render(<Analytics />);

        await waitFor (function() {
            expect(screen.getByText('CO₂ Saved')).toBeDefined();
            expect(screen.getByText('Plastic Saved')).toBeDefined();
            expect(screen.getByText('Total Habits Logged')).toBeDefined();
        })
    })

    //ANA-IT-02
    test('ANA-IT-02: Error message displays when Supabase fetch fails', async function() {
        //overwrite mock database to display an error
        vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
            data: {user: {id: 'test-user'}}
        })
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockRejectedValueOnce(new Error('Error message'))
            })
        })
        
        render(<Analytics />);

        await waitFor(function() {
            expect(screen.queryByText('Error message')).not.toBeNull();
        })
    })

    //EMPTY STATE
    //ANA-IT-03
    test('ANA-IT-03: Stats cards show 0 when user has no logged habits', async function() {
        render(<Analytics />);

        await waitFor(function() {
            expect(screen.getByText('0 kg')).toBeDefined();
            expect(screen.getByText('0 g')).toBeDefined();
        })
    })

    //ANA-IT-04
    test('ANA-IT-04: Favourite habits section is hidden when there are no logs', async function() {
        render(<Analytics />);

        await waitFor(function() {
            expect(screen.queryByText('⭐ Your Favourite Habits')).toBeNull();
        })
    })

    //WITH MOCK DATA

    const mockLogsData = [
        { total_co2_saved: 2.6, total_plastic_saved: 0, habit: { id: '1', habit_name: 'Biked or walked', category: 'transport' }, timestamp: '2026-03-17T08:30:00' },
        { total_co2_saved: 2.0, total_plastic_saved: 0, habit: { id: '2', habit_name: 'Meatless meal', category: 'food' }, timestamp: '2026-03-17T13:00:00' },
        { total_co2_saved: 0.3, total_plastic_saved: 50, habit: { id: '3', habit_name: 'Avoided plastic', category: 'waste' }, timestamp: '2026-03-17T20:00:00' },
    ]

    //ANA-IT-05
    test('ANA-IT-05: CO2 stat card displays correct value', async function() {
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({data: mockLogsData, error: null})
            })
        })

        render(<Analytics />);

        await waitFor(function() {
            expect(screen.getByText('4.9 kg')).toBeDefined();
        })
    })

    //ANA-IT-06
    test('ANA-IT-06: Plastic stat card displays correct value', async function() {
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({data: mockLogsData, error: null})
            })
        })

        render(<Analytics />);

        await waitFor(function() {
            expect(screen.getByText('50 g')).toBeDefined();
        })
    })

    //ANA-IT-07
    test('ANA-IT-07: Habit count displays correct number', async function() {
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({data: mockLogsData, error: null})
            })
        })
        
        render(<Analytics />);

        await waitFor(function() {
            expect(screen.getByText('3')).toBeDefined();
        })
    })

    //ANA-IT-08
    test('ANA-IT-08: Favourite habits section renders when logs exist', async function() {
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({data: mockLogsData, error: null})
            })
        })

        render(<Analytics />);
        
        await waitFor(function() {
            expect(screen.getByText('⭐ Your Favourite Habits')).toBeDefined();
        })
    })

    //ANA-IT-09
    test('ANA-IT-09: "Log Now" button appears for each habit', async function() {
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({data: mockLogsData, error: null})
            })
        })

        render(<Analytics />);
        
        await waitFor(function() {
            expect(screen.getAllByText('Log Now').length).toBeGreaterThan(0);
        })
    })

    //CHART TESTING

    //ANA-IT-13
    test('ANA-IT-13: BarChart renders when data exists', async function() {
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({data: mockLogsData, error: null})
            })
        })

        render(<Analytics />);

        await waitFor(function() {
            expect(screen.getByText('📅 Weekly CO₂ vs Plastic')).toBeDefined();
        })
    })

    //ANA-IT-14
    test('ANA-IT-14: BarChart does not render when there is no data', async function() {
        render (<Analytics />);

        await waitFor(function() {
            expect(screen.queryByText('📅 Weekly CO₂ vs Plastic')).toBeNull();
        })
    })

    //ANA-IT-15
    test('ANA-IT-15: PieChart renders when data exists', async function() {
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({data: mockLogsData, error: null})
            })
        })

        render(<Analytics />);

        await waitFor(function() {
            expect(screen.getByText('Habit Breakdown')).toBeDefined();
        })
    })

    //ANA-IT-16
    test('ANA-IT-16: PieChart does not render when there is no data', async function() {
        render (<Analytics />);

        await waitFor(function() {
            expect(screen.queryByText('Habit Breakdown')).toBeNull();
        })
    })
})