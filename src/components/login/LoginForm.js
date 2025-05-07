// LoginForm.jsx
import React, { useState, useContext } from 'react'; // Added useContext import
import { Formik, Field, Form } from 'formik';
import { TextField, Button, Box, Typography, Link, Alert, CircularProgress } from '@mui/material';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Added import for AuthContext

// Validation Schema
const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const LoginForm = ({ onLogin }) => {
  const [loginError, setLoginError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsLoading(true);
    setLoginError(null);
    
    try {
      const response = await fetch('http://localhost:8081/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Login failed. Please check your credentials.';
        try{
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If parsing fails, try to get the text
          try {
            const errorText = await response.text();
            if (errorText) errorMessage = errorText;
          } catch (textError) {
            // If even text extraction fails, use default message
            console.error('Could not parse error response:', textError);
          }
        }
        throw new Error(errorMessage);

      }

      const data = await response.json(); // Ensure you parse the response as JSON
      console.log('Login successful:', data);

      // Log the token in the console
      console.log('Token:', data.token);  // This will print the token to the console
      
      // Store the token and user data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.userName);
        
      // Create a user object instead of just passing the username
      const userData = { 
        username: data.userName,
        // Include any other user fields from your API response
      };
      
      // Call the context login function directly
      login(userData, data.token);
      
      // Also call the onLogin prop if provided
      if (onLogin) {
        onLogin(userData, data.token);
      }
      
      // Redirect to home page
      navigate('/');
      
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'An error occurred during login. Please try again.');
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
        borderRadius: 1,
        p: 4,
        backgroundColor: 'white',
        mr: { xs: 2, sm: 4 },
        ml: { xs: 2, sm: 0 },
      }}
    >
      {/* Form title centered */}
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
      
      {/* Show error message if login fails */}
      {loginError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loginError}
        </Alert>
      )}
      
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <Field
              as={TextField}
              name="email"
              placeholder="Email"
              fullWidth
              variant="outlined"
              margin="normal"
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email}
              sx={{ mb: 2 }}
              disabled={isLoading}
            />
            
            <Field
              as={TextField}
              name="password"
              type="password"
              placeholder="Password"
              fullWidth
              variant="outlined"
              margin="normal"
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
              sx={{ mb: 3 }}
              disabled={isLoading}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isLoading}
                sx={{ 
                  py: 1,
                  width: '120px',
                  backgroundColor: '#1976d2',
                  '&:hover': {
                    backgroundColor: '#115293',
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
                  SignUp
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