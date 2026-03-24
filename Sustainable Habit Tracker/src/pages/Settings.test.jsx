import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Settings from './Settings.jsx'
import Accessibility from './Accessibility.jsx'

const { mockUpdateUser, mockGetUser, mockFromUpdate } = vi.hoisted(() => ({
  mockUpdateUser: vi.fn(),
  mockGetUser: vi.fn(),
  mockFromUpdate: vi.fn(),
}))
// Mock supabase
vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: mockGetUser,
      updateUser: mockUpdateUser,
    },
    from: () => ({
      update: mockFromUpdate,
      eq: vi.fn().mockResolvedValue({ error: null }),
    }),
  },
}))

const renderSettings = () =>
  render(
    <MemoryRouter>
      <Settings />
    </MemoryRouter>
  )

describe('Settings Page Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'test-user',
          user_metadata: {
            name: 'Old Name',
            username: 'olduser',
          },
        },
      },
    })

    mockUpdateUser.mockResolvedValue({ error: null })
    mockFromUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    })
  })

  it('SET-UT-01: Update Name Metadata', async () => {
    renderSettings()
    const input = await screen.findByPlaceholderText('Full Name')
    fireEvent.change(input, { target: { value: 'John Smith' } })
    fireEvent.click(screen.getByText('Update Name'))
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalled()
    })
  })

  it('SET-UT-02: Update Username Metadata', async () => {
    renderSettings()
    const input = await screen.findByPlaceholderText('Username')
    fireEvent.change(input, { target: { value: 'johnsmith123' } })
    fireEvent.click(screen.getByText('Update Username'))
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalled()
    })
  })

  it('SET-UT-03: Empty Name disables button', async () => {
    renderSettings()
    const input = await screen.findByPlaceholderText('Full Name')
    fireEvent.change(input, { target: { value: '' } })
    const button = screen.getByText('Update Name')
    expect(button.disabled).toBe(true)
  })
})

describe('Accessibility Unit Tests', () => {
  it('SET-UT-04: Dark Mode Toggle', () => {
    render(
      <MemoryRouter>
        <Accessibility />
      </MemoryRouter>
    )
    const button = screen.getByRole('button', { name: /Enable Dark Mode/i })
    fireEvent.click(button)
    expect(document.body.classList.contains('dark-mode')).toBe(true)
  })

  it('SET-UT-05: Text Size Slider', () => {
    render(
      <MemoryRouter>
        <Accessibility />
      </MemoryRouter>
    )
    const sliders = screen.getAllByRole('slider')
    const textSizeSlider = sliders[0]
    fireEvent.change(textSizeSlider, { target: { value: '20' } })
    expect(document.documentElement.style.fontSize).toBe('20px')
  })

  it('SET-UT-06: Brightness Slider', () => {
    render(
      <MemoryRouter>
        <Accessibility />
      </MemoryRouter>
    )
    const sliders = screen.getAllByRole('slider')
    const brightnessSlider = sliders[1]
    fireEvent.change(brightnessSlider, { target: { value: '50' } })
    const overlay = document.getElementById('brightness-overlay')
    expect(overlay).toBeDefined()
  })
})