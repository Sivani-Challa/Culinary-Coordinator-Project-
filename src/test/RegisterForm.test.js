import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterForm from '../components/register/RegisterForm';
import axios from 'axios';

jest.mock('axios');

describe('RegisterForm Component', () => {
    beforeEach(() => {
        axios.post.mockClear();
    });

    it('renders all form fields correctly', () => {
        render(<RegisterForm />);
        expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/phone number/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/address/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/state/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/zipcode/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/country/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/security question answer/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    it('shows validation errors when submitting empty form', async () => {
        render(<RegisterForm />);
        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => {
            expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText(/phone is required/i)).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText(/address is required/i)).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText(/state is required/i)).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText(/zipcode is required/i)).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText(/country is required/i)).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText(/security question is required/i)).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText(/security question answer is required/i)).toBeInTheDocument();
        });
    });


    it('shows validation error for invalid phone and zipcode', async () => {
        render(<RegisterForm />);
        fireEvent.change(screen.getByPlaceholderText(/phone number/i), {
            target: { value: '12345' },
        });
        fireEvent.change(screen.getByPlaceholderText(/zipcode/i), {
            target: { value: 'abc' },
        });
        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => {
            expect(screen.getByText(/phone must be 10 digits starting with 6-9/i)).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(screen.getByText(/zipcode must be 5 or 6 digits/i)).toBeInTheDocument();
        });
    });

    it('submits form successfully', async () => {
        axios.post.mockResolvedValueOnce({ data: { message: 'Success' } });

        render(<RegisterForm />);

        fireEvent.change(screen.getByPlaceholderText(/first name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByPlaceholderText(/phone number/i), { target: { value: '9876543210' } });
        fireEvent.change(screen.getByPlaceholderText(/address/i), { target: { value: '123 Main St' } });
        fireEvent.change(screen.getByPlaceholderText(/state/i), { target: { value: 'CA' } });
        fireEvent.change(screen.getByPlaceholderText(/zipcode/i), { target: { value: '123456' } });
        fireEvent.change(screen.getByPlaceholderText(/country/i), { target: { value: 'USA' } });
        fireEvent.change(screen.getByRole('combobox', { name: /security question/i }), {
            target: { value: 'What is your favorite movie?' },
        });
        fireEvent.change(screen.getByPlaceholderText(/security question answer/i), {
            target: { value: 'Inception' },
        });

        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => {
            expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
        });
    });

    it('handles registration failure and shows error message', async () => {
        axios.post.mockRejectedValueOnce({ response: { data: 'Email already exists' } });

        render(<RegisterForm />);
        fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'duplicate@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/first name/i), { target: { value: 'Test' } });
        fireEvent.change(screen.getByPlaceholderText(/last name/i), { target: { value: 'User' } });
        fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass1234' } });
        fireEvent.change(screen.getByPlaceholderText(/phone number/i), { target: { value: '9876543210' } });
        fireEvent.change(screen.getByPlaceholderText(/address/i), { target: { value: '123 Street' } });
        fireEvent.change(screen.getByPlaceholderText(/state/i), { target: { value: 'TestState' } });
        fireEvent.change(screen.getByPlaceholderText(/zipcode/i), { target: { value: '123456' } });
        fireEvent.change(screen.getByPlaceholderText(/country/i), { target: { value: 'TestCountry' } });
        fireEvent.change(screen.getByRole('combobox', { name: /security question/i }), {
            target: { value: 'What is your favorite movie?' },
        });
        fireEvent.change(screen.getByPlaceholderText(/security question answer/i), {
            target: { value: 'MovieName' },
        });

        fireEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => {
            expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
        });
    });
});
