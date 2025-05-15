import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from './App'; // your main app component
import RegisterForm from './components/RegisterForm'; // adjust paths as needed
import LoginPage from './components/LoginPage';

describe('App Routing', () => {
  it('renders the Register page at /register', () => {
    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterForm />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
  });

  it('renders the Login page at /login', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
  });

  it('renders not found for unknown routes', () => {
    render(
      <MemoryRouter initialEntries={['/some/unknown/path']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/page not found/i)).toBeInTheDocument(); // assuming you have this fallback
  });
});
