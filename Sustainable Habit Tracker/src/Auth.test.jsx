import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import Auth from './Auth.jsx';

vi.mock('./supabaseClient', () => ({
  supabase: {
    rpc: vi.fn(),
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
    }
  }
}));

describe('Auth Component UI Integration Tests', function() {
  test('AUTH-IT-01: UI switches from Log In to Sign Up', function() {
    render(<Auth />);
    // need to check uf we are in sign in page by standard
    expect(screen.getByRole('heading', { name: 'Log In' })).toBeDefined();
    expect(screen.queryByPlaceholderText('Username')).toBeNull();
    // click the sign up button
    const toggleLink = screen.getByText('Need an account? Sign Up');
    fireEvent.click(toggleLink);
    // check if you are on the sign up page and checks if the extra boxes which are not in sign up have shown up
    expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeDefined();
    expect(screen.getByPlaceholderText('Username')).toBeDefined();
    expect(screen.getByText(/At least 8 characters/i)).toBeDefined(); 
  });

});