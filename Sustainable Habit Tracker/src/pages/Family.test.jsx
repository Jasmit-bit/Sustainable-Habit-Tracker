import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import Family from './Family.jsx';

// Lets say the user is not logged in, this should get me the no household screen
vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
  },
}));

describe('Family Component UI Integration Tests', function() {
  
  test('FAM-IT-01: "Create Household" UI appears when clicked', async function() {
    render(<Family />);
    
    // I had a problem for the test going to early so if I wait for the screen to load that should fix it
    await waitFor(function() {
      expect(screen.getByText("You don't have a household yet!")).toBeDefined();
    });

    // create button test, if I click it should prompt me to choose a household name
    const createButton = screen.getByText('Create a Household');
    fireEvent.click(createButton);

    const inputForm = screen.getByPlaceholderText('Enter Household Name');
    expect(inputForm).toBeDefined();
  });

  test('FAM-IT-02: "Join Household" UI appears when clicked', async function() {
    render(<Family />);
    await waitFor(function() {
      expect(screen.getByText("You don't have a household yet!")).toBeDefined();
    });
    const joinButton = screen.getByText('Join a Household');
    fireEvent.click(joinButton);
    const joinForm = screen.getByPlaceholderText('Enter 6 Digit Invite Code');
    expect(joinForm).toBeDefined();
  });

  test('FAM-IT-03: Cancel Button State hides form and resets UI', async function() {
    render(<Family />);

    await waitFor(function() {
      expect(screen.getByText("You don't have a household yet!")).toBeDefined();
    });

    fireEvent.click(screen.getByText('Create a Household'));
    expect(screen.getByPlaceholderText('Enter Household Name')).toBeDefined();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByPlaceholderText('Enter Household Name')).toBeNull();
    expect(screen.getByText('Create a Household')).toBeDefined();
  });

  test('FAM-IT-04: Join Code Input State updates correctly', async function() {
    render(<Family />);
    await waitFor(function() {
      expect(screen.getByText("You don't have a household yet!")).toBeDefined();
    });

    fireEvent.click(screen.getByText('Join a Household'));
    const joinInput = screen.getByPlaceholderText('Enter 6 Digit Invite Code');
    fireEvent.change(joinInput, { target: { value: 'ABCDEF' } });
    expect(joinInput.value).toBe('ABCDEF');
  });

});