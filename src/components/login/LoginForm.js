// LoginForm.jsx
import React, { useState, useContext } from 'react';
import { Formik, Field, Form } from 'formik';
import { TextField, Button, Box, Typography, Link, Alert, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Enhanced Validation Schema with comprehensive rules
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .trim()
    .email('Please enter a valid email address (e.g., user@example.com)')
    .required('Email address is required')
    .min(5, 'Email must be at least 5 characters long')
    .max(254, 'Email must not exceed 254 characters')
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Email format is invalid'
    ),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must not exceed 128 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
    ),
});

const LoginForm = ({ onLogin }) => {
  const [loginError, setLoginError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // Handle form submission with enhanced error handling
  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setIsLoading(true);
    setLoginError(null);
    
    try {
      // Trim whitespace from inputs
      const trimmedValues = {
        email: values.email.trim().toLowerCase(),
        password: values.password
      };

      const response = await fetch('http://localhost:8081/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trimmedValues),
      });

      if (!response.ok) {
        let errorMessage = 'Login failed. Please check your credentials.';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          
          // Handle specific field errors
          if (response.status === 400 && errorData.fieldErrors) {
            if (errorData.fieldErrors.email) {
              setFieldError('email', errorData.fieldErrors.email);
            }
            if (errorData.fieldErrors.password) {
              setFieldError('password', errorData.fieldErrors.password);
            }
            return;
          }
        } catch (parseError) {
          try {
            const errorText = await response.text();
            if (errorText) errorMessage = errorText;
          } catch (textError) {
            console.error('Could not parse error response:', textError);
          }
        }

        // Handle specific HTTP status codes
        switch (response.status) {
          case 401:
            errorMessage = 'Invalid email or password. Please try again.';
            break;
          case 403:
            errorMessage = 'Account is locked or disabled. Please contact support.';
            break;
          case 429:
            errorMessage = 'Too many login attempts. Please try again later.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            break;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Login successful:', data);

      // Validate response data
      if (!data.token) {
        throw new Error('Invalid response from server. Please try again.');
      }

      console.log('Token:', data.token);
      
      // Store the token and user data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.userName || 'User');
        
      const userData = { 
        username: data.userName || 'User',
      };
      
      // Call the context login function
      login(userData, data.token);
      
      // Notify parent component if onLogin prop was provided
      if (onLogin) {
        onLogin(userData, data.token);
      }
      
      // Redirect to home page
      navigate('/');
      
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'An unexpected error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '450px',
        boxShadow: 3,
        borderRadius: 2,
        p: 4,
        backgroundColor: 'white',
        mr: { xs: 2, sm: 4 },
        ml: { xs: 2, sm: 0 },
      }}
    >
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          textAlign: 'center',
          mb: 4,
          fontWeight: 'bold',
          color: '#442c2e',
        }}
      >
        Login
      </Typography>
      
      {loginError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loginError}
        </Alert>
      )}
      
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ errors, touched, isSubmitting, values }) => (
          <Form>
            <Field
              as={TextField}
              name="email"
              placeholder="Enter your email address"
              fullWidth
              variant="outlined"
              margin="normal"
              type="email"
              autoComplete="email"
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color={touched.email && errors.email ? 'error' : 'action'} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: touched.email && errors.email ? 'error.main' : 'primary.main',
                  },
                },
              }}
            />
            
            <Field
              as={TextField}
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              fullWidth
              variant="outlined"
              margin="normal"
              autoComplete="current-password"
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color={touched.password && errors.password ? 'error' : 'action'} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      disabled={isLoading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: touched.password && errors.password ? 'error.main' : 'primary.main',
                  },
                },
              }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading || !values.email || !values.password}
                sx={{ 
                  py: 1.5,
                  px: 3,
                  minWidth: '120px',
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#115293',
                  },
                  '&:disabled': {
                    backgroundColor: '#ccc',
                  },
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'LOGIN'}
              </Button>
              
              <Link href="/forgot-password" variant="body2" color="primary">
                Forgot Password?
              </Link>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Don't have an account?{' '}
                <Link href="/register" color="primary">
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default LoginForm;