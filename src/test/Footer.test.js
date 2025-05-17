import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../components/footer/Footer'; 
import { BrowserRouter } from 'react-router-dom';

const renderFooter = () => {
  return render(
    <BrowserRouter>
      <Footer />
    </BrowserRouter>
  );
};

describe('Footer Component', () => {


  // Positive Test Cases
  test('renders brand title and description', () => {
    renderFooter();
    expect(screen.getByText('Culinary Mart')).toBeInTheDocument();
    expect(screen.getByText(/Your one-stop shop for all your culinary needs/i)).toBeInTheDocument();
  });

  test('renders Quick Links section with Home and All Products links', () => {
    renderFooter();
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /All Products/i })).toHaveAttribute('href', '/all-products');
  });

  test('renders Customer Service links correctly', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: /Contact Us/i })).toHaveAttribute('href', '/contactus');
    expect(screen.getByRole('link', { name: /FAQs/i })).toHaveAttribute('href', '/faqs');
  });

  test('renders social media links correctly', () => {
    renderFooter();
    expect(screen.getByRole('link', { name: /Facebook/i })).toHaveAttribute('href', 'https://facebook.com');
    expect(screen.getByRole('link', { name: /Twitter/i })).toHaveAttribute('href', 'https://twitter.com');
    expect(screen.getByRole('link', { name: /Instagram/i })).toHaveAttribute('href', 'https://instagram.com');
    expect(screen.getByRole('link', { name: /Pinterest/i })).toHaveAttribute('href', 'https://pinterest.com');
  });

  test('renders copyright and policies', () => {
    renderFooter();
    const year = new Date().getFullYear();
    expect(screen.getByText(`© ${year} Culinary Mart. All rights reserved.`)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Privacy Policy/i })).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: /Cookie Policy/i })).toHaveAttribute('href', '/cookies');
  });

  // Negative Test Cases
  test('does not show broken or empty links', () => {
    renderFooter();
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      const href = link.getAttribute('href');
      expect(href).not.toBe('#');
      expect(href).not.toBe(null);
      expect(href).not.toBe('');
    });
  });

  test('does not render unrelated text', () => {
    renderFooter();
    expect(screen.queryByText(/unsubscribe/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/terms of sale/i)).not.toBeInTheDocument();
  });
});