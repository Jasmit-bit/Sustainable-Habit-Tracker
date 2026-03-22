import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home'

vi.mock('../supabaseClient', () => ({
    supabase: {
        auth: {
            getUser: vi.fn().mockResolvedValue({
                data: { user: { id: '123', user_metadata: { name: 'John' } } }
            })
        },
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: [] })
            })
        })
    }
}))

// unit tests
import { calculateTotalCO2 } from './Home'
describe('calculateTotalCO2', () => {
    it('correctly adds up CO2 values from habit logs', () => {
        const fakeLogs = [
            { total_co2_saved: 2.5 },
            { total_co2_saved: 4.0 },
        ]
        expect(calculateTotalCO2(fakeLogs)).toBe(6.5)
    })
})

import { getRandomTipContent } from './Home'
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

import { getUsername } from './Home'
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

// integration tests
describe('Home component', () => {
    it('renders without crashing', () => {
        render(<MemoryRouter><Home /></MemoryRouter>)
    })
})

describe('Home component', () => {
    it('renders without crashing', () => {
        render(<MemoryRouter><Home /></MemoryRouter>)
    })

    it('displays the username on the page', async () => {
        render(<MemoryRouter><Home /></MemoryRouter>)
        await waitFor(() => screen.getByText('Hello, John! 🌍'))
    })

    it('displays an eco tip on the page', () => {
        render(<MemoryRouter><Home /></MemoryRouter>)
        screen.getByText('💡 Daily Eco-Tip')
    })

    it('displays CO2 and activity count stats', () => {
        render(<MemoryRouter><Home /></MemoryRouter>)
        screen.getByText('kg CO₂ Saved')
        screen.getByText('Activities Logged')
    })

    it('displays quick action buttons', () => {
        render(<MemoryRouter><Home /></MemoryRouter>)
        screen.getByText('Quick Actions')
        screen.getByText('➕ Log a New Habit')
        screen.getByText('📊 View My Progress')
    })
})