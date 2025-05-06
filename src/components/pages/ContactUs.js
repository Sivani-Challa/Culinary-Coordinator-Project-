// src/components/pages/ContactUs.js
import React from 'react';
import { Container, Typography, Box, Grid, useTheme } from '@mui/material';
import { Phone, Email, LocationOn } from '@mui/icons-material';
import Footer from '../footer/Footer';

const ContactUs = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            mb: 2, 
            textAlign: 'center',
            fontWeight: 'bold',
            color: isDarkMode ? '#ffffff' : 'inherit'
          }}
        >
          Contact Us
        </Typography>
        
        <Typography 
          variant="body1" 
          align="center"
          sx={{ 
            mb: 4,
            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
          }}
        >
          We'd love to hear from you. Please fill out the form below or reach out directly.
        </Typography>
        
        <Grid container spacing={4}>
          {/* Contact Information */}
          <Grid item xs={12} md={4}>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3,
                  color: isDarkMode ? '#ffffff' : 'inherit'
                }}
              >
                Get In Touch
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOn 
                  sx={{ 
                    mr: 2, 
                    color: theme.palette.primary.main 
                  }} 
                />
                <Typography 
                  sx={{ 
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
                  }}
                >
                  123 Culinary Street, Foodville, IN 12345
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Phone 
                  sx={{ 
                    mr: 2, 
                    color: theme.palette.primary.main 
                  }} 
                />
                <Typography 
                  sx={{ 
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
                  }}
                >
                  +1 (555) 123-4567
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Email 
                  sx={{ 
                    mr: 2, 
                    color: theme.palette.primary.main 
                  }} 
                />
                <Typography 
                  sx={{ 
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
                  }}
                >
                  support@culinarymart.com
                </Typography>
              </Box>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 4,
                  color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
                }}
              >
                Our customer service team is available Monday through Friday, 9am to 5pm EST.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
};

export default ContactUs;