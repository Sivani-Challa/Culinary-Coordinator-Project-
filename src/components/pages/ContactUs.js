// src/components/pages/ContactUs.js
import React from 'react';
import { Typography, Box, Grid } from '@mui/material';
import { Phone, Email, LocationOn } from '@mui/icons-material';
import PageTemplate from './PageTemplate';

const ContactUs = () => {
  const content = (
    <>
      <Grid container spacing={4}>
        {/* Contact Information */}
        <Grid item xs={12} md={4}>
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Get In Touch
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn sx={{ mr: 2, color: 'primary.main' }} />
              <Typography sx={{ color: 'text.secondary' }}>
                123 Culinary Street, Foodville, IN 12345
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Phone sx={{ mr: 2, color: 'primary.main' }} />
              <Typography sx={{ color: 'text.secondary' }}>
                +1 (555) 123-4567
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Email sx={{ mr: 2, color: 'primary.main' }} />
              <Typography sx={{ color: 'text.secondary' }}>
                support@culinarymart.com
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ mt: 4, color: 'text.secondary' }}>
              Our customer service team is available Monday through Friday, 9am to 5pm EST.
            </Typography>
          </Box>
        </Grid>

        {/* Contact Form would go here */}
        <Grid item xs={12} md={8}>
          {/* Form content */}
        </Grid>
      </Grid>
    </>
  );

  return <PageTemplate title="Contact Us" content={content} />;
};

export default ContactUs;