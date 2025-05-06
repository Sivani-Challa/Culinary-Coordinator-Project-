// src/components/pages/CookiePolicy.js
import React from 'react';
import { Container, Typography, Box, Paper, useTheme } from '@mui/material';
import Footer from '../footer/Footer';

const CookiePolicy = () => {
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
          Cookie Policy
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
            This Cookie Policy explains how Culinary Mart uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 1,
                color: isDarkMode ? '#ffffff' : 'inherit'
              }}
            >
              What Are Cookies?
            </Typography>
            <Typography
              variant="body1"
              paragraph
              sx={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
              }}
            >
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information. Cookies set by the website owner (in this case, Culinary Mart) are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies." Third-party cookies enable third-party features or functionality to be provided on or through the website.
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
              Types of Cookies We Use
            </Typography>
            <Typography
              variant="body1"
              paragraph
              sx={{
                color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
              }}
            >
              We use the following types of cookies:
            </Typography>
            <ul style={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : undefined }}>
              <li><strong style={{ color: isDarkMode ? '#ffffff' : 'inherit' }}>Essential Cookies:</strong> These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in, or filling in forms.</li>
              <li><strong style={{ color: isDarkMode ? '#ffffff' : 'inherit' }}>Analytical/Performance Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.</li>
              <li><strong style={{ color: isDarkMode ? '#ffffff' : 'inherit' }}>Functional Cookies:</strong> These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.</li>
              <li><strong style={{ color: isDarkMode ? '#ffffff' : 'inherit' }}>Targeting Cookies:</strong> These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites.</li>
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
              If you have any questions or concerns about our use of cookies, please contact us at privacy@culinarymart.com or call us at +1 (555) 123-4567.
            </Typography>
          </Box>
        </Paper>
      </Container>
      <Footer />
    </>
  );
};

export default CookiePolicy;