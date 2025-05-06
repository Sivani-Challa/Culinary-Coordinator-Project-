// RegisterPage.jsx
import React from 'react';
import { Box } from '@mui/material';
import RegisterForm from './RegisterForm';

const RegisterPage = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: 'calc(100vh - 64px)',
        width: '100%',
        // Fixed position background container
        '&::before': {
          content: '""',
          position: 'fixed',
          top: '64px', // Position below header
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${process.env.PUBLIC_URL + '/loginlogo.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: -1 // Place behind content
        }
      }}
    >
      {/* Scrollable content container */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)',
          width: '100%',
          padding: '20px 0',
          overflow: 'auto' // Allow scrolling
        }}
      >
        {/* Register form container */}
        <Box
          sx={{
            width: { xs: '90%', sm: '450px' },
            mx: 'auto', // Center horizontally
            my: 3 // Add some vertical margin
          }}
        >
          <RegisterForm />
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;