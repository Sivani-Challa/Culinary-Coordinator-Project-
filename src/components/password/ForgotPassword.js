import React, { useState } from 'react';
import { Formik, Field, Form } from 'formik';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Alert,
  CircularProgress,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Snackbar
} from '@mui/material';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

// Security question options
const securityQuestions = [
  "What was the name of your elementary school?",
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "In which city were you born?",
  "What was your childhood nickname?",
  "What is the name of your favorite childhood teacher?",
  "What is your favorite movie?",
  "What was your first car?",
  "What is your favorite holiday destination?",
  "What is the name of your favorite childhood friend?"
];

// Validation schema
const ResetPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email format').required('Email is required'),
  securityQuestion: Yup.string().required('Security question is required'),
  securityQuestionAnswer: Yup.string().required('Security answer is required'),
  newPassword: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: Yup.string()
    .required('Confirm password is required')
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
});

const ForgotPassword = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('http://localhost:8082/reset-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          securityQuestion: values.securityQuestion,
          securityQuestionAnswer: values.securityQuestionAnswer,
          password: values.newPassword
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to reset password');
      }

      // Set success message in both places for visibility
      setSuccess('Password reset successful!');
      setSnackbarMessage('Password reset successful!');
      setOpenSnackbar(true);
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message || 'An error occurred. Please check your information and try again.');
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mt: 8, 
          mb: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center' 
        }}
      >
        <Typography 
          component="h1" 
          variant="h4" 
          align="center" 
          gutterBottom
          sx={{ 
            color: '#442c2e',
            fontWeight: 'bold' 
          }}
        >
          Reset Password
        </Typography>
        
        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Success Message */}
        {success && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Formik
          initialValues={{ 
            email: '', 
            securityQuestion: '', 
            securityQuestionAnswer: '', 
            newPassword: '', 
            confirmPassword: '' 
          }}
          validationSchema={ResetPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, values, setFieldValue, handleBlur }) => (
            <Form style={{ width: '100%' }}>
              <Field
                as={TextField}
                name="email"
                label="Email"
                fullWidth
                variant="outlined"
                margin="normal"
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                disabled={isLoading}
              />
              
              {/* Security Question Dropdown */}
              <FormControl 
                fullWidth 
                error={touched.securityQuestion && Boolean(errors.securityQuestion)}
                sx={{ mt: 2, mb: 1 }}
                disabled={isLoading}
              >
                <InputLabel id="security-question-label">Security Question</InputLabel>
                <Select
                  labelId="security-question-label"
                  id="securityQuestion"
                  name="securityQuestion"
                  value={values.securityQuestion}
                  label="Security Question"
                  onChange={(e) => setFieldValue('securityQuestion', e.target.value)}
                  onBlur={handleBlur}
                >
                  {securityQuestions.map((question, index) => (
                    <MenuItem key={index} value={question}>
                      {question}
                    </MenuItem>
                  ))}
                </Select>
                {touched.securityQuestion && errors.securityQuestion && (
                  <FormHelperText>{errors.securityQuestion}</FormHelperText>
                )}
              </FormControl>
              
              <Field
                as={TextField}
                name="securityQuestionAnswer"
                label="Security Answer"
                fullWidth
                variant="outlined"
                margin="normal"
                error={touched.securityQuestionAnswer && Boolean(errors.securityQuestionAnswer)}
                helperText={touched.securityQuestionAnswer && errors.securityQuestionAnswer}
                disabled={isLoading}
              />
              
              <Field
                as={TextField}
                name="newPassword"
                type="password"
                label="New Password"
                fullWidth
                variant="outlined"
                margin="normal"
                error={touched.newPassword && Boolean(errors.newPassword)}
                helperText={touched.newPassword && errors.newPassword}
                disabled={isLoading}
              />
              
              <Field
                as={TextField}
                name="confirmPassword"
                type="password"
                label="Confirm New Password"
                fullWidth
                variant="outlined"
                margin="normal"
                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                helperText={touched.confirmPassword && errors.confirmPassword}
                disabled={isLoading}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Link href="/login" style={{ textDecoration: 'none' }}>
                  <Button variant="text">
                    Back to Login
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isLoading}
                  sx={{ 
                    py: 1,
                    width: '160px',
                    backgroundColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#115293',
                    },
                  }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Reset'}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>

      {/* Snackbar for success message */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ForgotPassword;