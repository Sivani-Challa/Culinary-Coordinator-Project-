import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider } from '@mui/material';

const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: '#f5f5f5',  // Light background for the footer
        py: 4,
        mt: 4,
        borderTop: '1px solid #e0e0e0',  // Border color for the footer
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Information */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
              variant="h6" 
              gutterBottom
            >
              Culinary Mart
            </Typography>
            <Typography 
              variant="body2" 
            >
              Your one-stop shop for all your culinary needs. Quality products at affordable prices.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
              variant="h6" 
              gutterBottom
            >
              Quick Links
            </Typography>
            <Link 
              href="/" 
              sx={{ 
                display: 'block', 
                mb: 1,
                textDecoration: 'none',
                '&:hover': {
                  color: '#1976d2'  // Default primary color
                }
              }}
            >
              Home
            </Link>
            <Link 
              href="/all-products" 
              sx={{ 
                display: 'block', 
                mb: 1,
                textDecoration: 'none',
                '&:hover': {
                  color: '#1976d2'  // Default primary color
                }
              }}
            >
              All Products
            </Link>
          </Grid>

          {/* Customer Service */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
              variant="h6" 
              gutterBottom
            >
              Customer Service
            </Typography>
            <Link 
              href="/contactus" 
              sx={{ 
                display: 'block', 
                mb: 1,
                textDecoration: 'none',
                '&:hover': {
                  color: '#1976d2'  // Default primary color
                }
              }}
            >
              Contact Us
            </Link>
            <Link 
              href="/faqs" 
              sx={{ 
                display: 'block', 
                mb: 1,
                textDecoration: 'none',
                '&:hover': {
                  color: '#1976d2'  // Default primary color
                }
              }}
            >
              FAQs
            </Link>
          </Grid>

          {/* Connect With Us */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography 
              variant="h6" 
              gutterBottom
            >
              Connect With Us
            </Typography>
            <Link 
              href="https://facebook.com" 
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                display: 'block', 
                mb: 1,
                textDecoration: 'none',
                '&:hover': {
                  color: '#1976d2'  // Default primary color
                }
              }}
            >
              Facebook
            </Link>
            <Link 
              href="https://twitter.com" 
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                display: 'block', 
                mb: 1,
                textDecoration: 'none',
                '&:hover': {
                  color: '#1976d2'  // Default primary color
                }
              }}
            >
              Twitter
            </Link>
            <Link 
              href="https://instagram.com" 
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                display: 'block', 
                mb: 1,
                textDecoration: 'none',
                '&:hover': {
                  color: '#1976d2'  // Default primary color
                }
              }}
            >
              Instagram
            </Link>
            <Link 
              href="https://pinterest.com" 
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                display: 'block', 
                mb: 1,
                textDecoration: 'none',
                '&:hover': {
                  color: '#1976d2'  // Default primary color
                }
              }}
            >
              Pinterest
            </Link>
          </Grid>
        </Grid>

        <Divider sx={{ 
          my: 3, 
          borderColor: '#e0e0e0' // Border color for the divider
        }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="body2"
          >
            © {new Date().getFullYear()} Culinary Mart. All rights reserved.
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Link 
              href="/privacy" 
              sx={{ 
                mx: 1,
                textDecoration: 'none',
                '&:hover': {
                  color: '#1976d2'  // Default primary color
                }
              }}
            >
              Privacy Policy
            </Link>
            <Link 
              href="/cookies" 
              sx={{ 
                mx: 1,
                textDecoration: 'none',
                '&:hover': {
                  color: '#1976d2'  // Default primary color
                }
              }}
            >
              Cookie Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
