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
        const fakeMetadata = {name: 'John', username: 'john123'}
        const result = getUsername(fakeMetadata)
        expect(result).toBe('John')
    })

    it('return username when name is not present', () => {
        const fakeMetadata = {username: 'john123'}
        const result = getUsername(fakeMetadata)
        expect(result).toBe('john123')
    })

    it('return default name when username and name are not present', () => {
        const fakeMetadata = {}
        const result = getUsername(fakeMetadata)
        expect(result).toBe('Eco Warrior')
    })
})