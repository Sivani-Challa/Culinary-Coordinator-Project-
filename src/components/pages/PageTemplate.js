// src/components/pages/PageTemplate.js
import React from 'react';
import { Container, Typography, Box, Breadcrumbs, Link } from '@mui/material';
import Footer from '../footer/Footer';

const PageTemplate = ({ title, content }) => {
  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link color="inherit" href="/">
            Home
          </Link>
          <Typography color="text.primary">{title}</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
          {title}
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          {content}
        </Box>
      </Container>
      <Footer />
    </>
  );
};

export default PageTemplate;