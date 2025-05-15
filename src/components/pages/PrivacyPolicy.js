// src/components/pages/PrivacyPolicy.js
import React from 'react';
import { Container, Typography, Box, Paper, useTheme } from '@mui/material';

const PrivacyPolicy = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 4,
            fontWeight: 'bold',
            color: isDarkMode ? '#ffffff' : 'inherit'
          }}
        >
          Privacy Policy
        </Typography>

        <Paper
          sx={{
            p: 3,
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'white',
            borderRadius: 1
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: isDarkMode ? '#ffffff' : 'inherit'
            }}
          >
            Last Updated: May 4, 2025
          </Typography>

          <Typography
            variant="body1"
            paragraph
            sx={{
              color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
            }}
          >
            At Culinary Mart, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services. Please read this Privacy Policy carefully. By accessing or using our website, you consent to the collection, use, and disclosure of your personal information in accordance with this Privacy Policy.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 1,
                color: isDarkMode ? '#ffffff' : 'inherit'
              }}
            >
              Information We Collect
            </Typography>
            <Typography
              variant="body1"
              paragraph
              sx={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
              }}
            >
              We may collect personal information that you provide to us, including but not limited to your name, email address, postal address, phone number, and payment information when you register an account, place an order, sign up for our newsletter, respond to a survey, or contact us.
            </Typography>
            <Typography
              variant="body1"
              paragraph
              sx={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
              }}
            >
              We may also collect non-personal information automatically when you visit our website, such as your IP address, browser type, operating system, referring URLs, access times, and pages viewed.
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 1,
                color: isDarkMode ? '#ffffff' : 'inherit'
              }}
            >
              How We Use Your Information
            </Typography>
            <Typography
              variant="body1"
              paragraph
              sx={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
              }}
            >
              We may use the information we collect for various purposes, including to:
            </Typography>
            <ul style={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : undefined }}>
              <li>Process and fulfill your orders</li>
              <li>Create and manage your account</li>
              <li>Send you order confirmations and updates</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Send you promotional emails and newsletters (if you've opted in)</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </Box>

          {/* More sections can be added as needed */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 1,
                color: isDarkMode ? '#ffffff' : 'inherit'
              }}
            >
              Contact Us
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
              }}
            >
              If you have any questions or concerns about this Privacy Policy, please contact us at privacy@culinarymart.com or call us at +1 (555) 123-4567.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default PrivacyPolicy;