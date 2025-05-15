// src/components/pages/PageTemplate.js
import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const PageTemplate = ({ title, content }) => {
  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: 'calc(100vh - 300px)' }}>
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          mb: 2, 
          textAlign: 'center',
          fontWeight: 'bold',
          color: '#000000',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          display: 'inline-block',
          padding: '5px 15px',
          borderRadius: '4px',
          marginX: 'auto',
          width: 'auto'
        }}
      >
        {title}
      </Typography>
      
      <Box sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: '20px',
        borderRadius: '8px'
      }}>
        {content}
      </Box>
    </Container>
  );
};

export default PageTemplate;