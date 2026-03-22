import {describe, test, expect} from 'vitest';
import { calculateCO2Saved, calculatePlasticSaved, getTimePeriod, getMostFrequent } from './analyticsUtils.js';

describe('Analytics Page Unit Tests', function() {

    const mockLogs = [
        { total_co2_saved: 2.6, total_plastic_saved: 0,  habit: { habit_name: 'Biked or walked' },    timestamp: '2026-03-17T08:30:00' },
        { total_co2_saved: 2.0, total_plastic_saved: 0,  habit: { habit_name: 'Meatless meal' },       timestamp: '2026-03-17T13:00:00' },
        { total_co2_saved: 0.3, total_plastic_saved: 50, habit: { habit_name: 'Avoided plastic' },     timestamp: '2026-03-17T20:00:00' },
        { total_co2_saved: 2.6, total_plastic_saved: 0,  habit: { habit_name: 'Biked or walked' },     timestamp: '2026-03-18T07:45:00' },
        { total_co2_saved: 0.8, total_plastic_saved: 0,  habit: { habit_name: 'Composted scraps' },    timestamp: '2026-03-18T19:00:00' },
        { total_co2_saved: 2.6, total_plastic_saved: 0,  habit: { habit_name: 'Biked or walked' },     timestamp: '2026-03-19T08:00:00' },
    ]

    const emptyMockLogs = []

    //ANA-UT-01 - calculateCO2Saved with multiple logs
    test('ANA-UT-01: calculateCO2Saved returns correct total', function() {
        const result = calculateCO2Saved(mockLogs);
        expect(result).toBe(10.9);
    })

    //ANA-UT-02 - calculateCO2Saved with empty array
    test('ANA-UT-02: calculateCO2Saved returns 0 for empty array', function() {
        const result = calculateCO2Saved(emptyMockLogs);
        expect(result).toBe(0);
    })

    //ANA-UT-03 - calculatePlasticSaved with multiple logs
    test('ANA-UT-03: calculatePlasticSaved returns correct total', function() {
        const result = calculatePlasticSaved(mockLogs);
        expect(result).toBe(50);
    })

    //ANA-UT-04 - calculatePlasticSaved with empty array
    test('ANA-UT-04: calculatePlasticSaved returns 0 for empty array', function() {
        const result = calculatePlasticSaved(emptyMockLogs);
        expect(result).toBe(0);
    })

    //ANA-UT-05 - getTimePeriod returns morning
    test('ANA-UT-05: getTimePeriod returns morning when current hour is between 6-12', function() {
        const mockTime = 8;
        const result = getTimePeriod(mockTime);
        expect(result).toBe('morning');
    })

    //ANA-UT-06 - getTimePeriod returns afternoon
    test('ANA-UT-06: getTimePeriod returns afternoon when current hour is between 12-18', function() {
        const mockTime = 14
        const result = getTimePeriod(mockTime);
        expect(result).toBe('afternoon');
    })

    //ANA-UT-07 - getTimePeriod returns night
    test('ANA-UT-07: getTimePeriod returns night when current hour is neither morning nor afternoon', function() {
        const mockTime = 21;
        const result = getTimePeriod(mockTime);
        expect(result).toBe('night');
    })
})
