import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import UserProfile from '../components/userprofile/UserProfile';

jest.mock('axios');

describe('UserProfile Component', () => {
  const mockProfileData = {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    location: 'New York',
    bio: 'Bio about John',
    skillLevel: 'Intermediate',
    profilePictureUrl: 'http://example.com/profile.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading spinner initially', () => {
    axios.get.mockReturnValue(new Promise(() => {})); // never resolves
    render(<UserProfile />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('loads and displays fetched profile data', async () => {
    axios.get.mockResolvedValue({ data: mockProfileData });
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockProfileData.fullName)).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue(mockProfileData.email)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProfileData.phone)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProfileData.location)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProfileData.bio)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockProfileData.skillLevel)).toBeInTheDocument();

    expect(screen.getByRole('img')).toHaveAttribute('src', mockProfileData.profilePictureUrl);
  });

  test('shows validation errors on empty required fields', async () => {
    axios.get.mockResolvedValue({ data: mockProfileData });
    render(<UserProfile />);

    await waitFor(() => screen.getByDisplayValue(mockProfileData.fullName));

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/Skill Level/i), { target: { value: '' } });

    fireEvent.submit(screen.getByRole('button', { name: /save profile/i }));

    expect(await screen.findByText(/Full name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Phone is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Location is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Skill level is required/i)).toBeInTheDocument();
  });

  test('shows error if phone is invalid', async () => {
    axios.get.mockResolvedValue({ data: mockProfileData });
    render(<UserProfile />);

    await waitFor(() => screen.getByDisplayValue(mockProfileData.phone));

    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '12345' } });

    fireEvent.submit(screen.getByRole('button', { name: /save profile/i }));

    expect(await screen.findByText(/Phone must be 10 digits/i)).toBeInTheDocument();
  });

  test('submits form successfully', async () => {
    axios.get.mockResolvedValue({ data: mockProfileData });
    axios.put.mockResolvedValue({});

    window.alert = jest.fn();

    render(<UserProfile />);

    await waitFor(() => screen.getByDisplayValue(mockProfileData.fullName));

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Jane Doe' } });

    fireEvent.submit(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() =>
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:8082/profile',
        expect.objectContaining({ fullName: 'Jane Doe' }),
      ),
    );

    expect(window.alert).toHaveBeenCalledWith('Profile updated successfully');
  });

  test('handles form submission error', async () => {
    axios.get.mockResolvedValue({ data: mockProfileData });
    axios.put.mockRejectedValue(new Error('Update failed'));

    console.error = jest.fn();

    render(<UserProfile />);

    await waitFor(() => screen.getByDisplayValue(mockProfileData.fullName));

    fireEvent.submit(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => expect(console.error).toHaveBeenCalledWith('Update failed:', expect.any(Error)));
  });

  test('handles image file selection and preview', async () => {
    axios.get.mockResolvedValue({ data: mockProfileData });

    const { container } = render(<UserProfile />);

    await waitFor(() => screen.getByDisplayValue(mockProfileData.fullName));

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const inputFile = container.querySelector('input[type="file"]');
    expect(inputFile).toBeInTheDocument();

    fireEvent.change(inputFile, { target: { files: [file] } });

    // Avatar src should update to a blob url (starts with 'blob:')
    expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('blob:'));
  });

  test('uploads image successfully', async () => {
    axios.get.mockResolvedValue({ data: mockProfileData });
    axios.post.mockResolvedValue({});

    window.alert = jest.fn();

    const { container } = render(<UserProfile />);

    await waitFor(() => screen.getByDisplayValue(mockProfileData.fullName));

    const file = new File(['image'], 'image.png', { type: 'image/png' });
    const inputFile = container.querySelector('input[type="file"]');
    expect(inputFile).toBeInTheDocument();

    fireEvent.change(inputFile, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: /upload picture/i }));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());

    expect(window.alert).toHaveBeenCalledWith('Profile picture uploaded');
  });

  test('does not upload image if no file selected', async () => {
    axios.get.mockResolvedValue({ data: mockProfileData });

    render(<UserProfile />);

    await waitFor(() => screen.getByDisplayValue(mockProfileData.fullName));

    axios.post.mockClear();

    fireEvent.click(screen.getByRole('button', { name: /upload picture/i }));

    expect(axios.post).not.toHaveBeenCalled();
  });

  test('handles image upload error', async () => {
    axios.get.mockResolvedValue({ data: mockProfileData });
    axios.post.mockRejectedValue(new Error('Upload failed'));

    console.error = jest.fn();

    const { container } = render(<UserProfile />);

    await waitFor(() => screen.getByDisplayValue(mockProfileData.fullName));

    const file = new File(['image'], 'image.png', { type: 'image/png' });
    const inputFile = container.querySelector('input[type="file"]');
    expect(inputFile).toBeInTheDocument();

    fireEvent.change(inputFile, { target: { files: [file] } });

    fireEvent.click(screen.getByRole('button', { name: /upload picture/i }));

    await waitFor(() => expect(console.error).toHaveBeenCalledWith('Upload error:', expect.any(Error)));
  });
});
