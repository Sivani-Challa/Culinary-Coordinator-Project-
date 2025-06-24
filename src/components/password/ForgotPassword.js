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
  Snackbar,
  InputAdornment,
  IconButton,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Divider
} from '@mui/material';
import {
  Email,
  Security,
  Help,
  Lock,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

// Enhanced security question options
const securityQuestions = [
  "What was the name of your elementary school?",
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "In which city were you born?",
  "What was your childhood nickname?",
  "What is the name of your favorite childhood teacher?",
  "What is your favorite movie?",
  "What was your first car model?",
  "What is your favorite holiday destination?",
  "What is the name of your favorite childhood friend?",
  "What was the first company you worked for?",
  "What is your favorite book?",
  "What was your first phone number?",
  "What is the name of the street you grew up on?"
];

// Enhanced validation schema with comprehensive security rules
const ResetPasswordSchema = Yup.object().shape({
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
  securityQuestion: Yup.string()
    .required('Security question is required')
    .min(10, 'Security question must be at least 10 characters'),
  securityQuestionAnswer: Yup.string()
    .trim()
    .required('Security question answer is required')
    .min(3, 'Answer must be at least 3 characters')
    .max(100, 'Answer must not exceed 100 characters')
    .matches(/^[a-zA-Z0-9\s'-]+$/, 'Answer can only contain letters, numbers, spaces, hyphens, and apostrophes'),
  newPassword: Yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must not exceed 128 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
    ),
  confirmPassword: Yup.string()
    .required('Please confirm your new password')
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
});

// Password strength checker
const getPasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (/[a-z]/.test(password)) strength += 20;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/\d/.test(password)) strength += 15;
  if (/[@$!%*?&]/.test(password)) strength += 15;
  
  return Math.min(strength, 100);
};

const getStrengthColor = (strength) => {
  if (strength < 40) return '#f44336'; // Red
  if (strength < 70) return '#ff9800'; // Orange
  if (strength < 90) return '#2196f3'; // Blue
  return '#4caf50'; // Green
};

const getStrengthText = (strength) => {
  if (strength < 40) return 'Weak';
  if (strength < 70) return 'Fair';
  if (strength < 90) return 'Good';
  return 'Strong';
};

const steps = ['Verify Identity', 'Security Question', 'New Password'];

const ForgotPassword = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [stepCompleted, setStepCompleted] = useState([false, false, false]);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const navigate = useNavigate();

  const handleClickShowNewPassword = () => setShowNewPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // Handle step progression based on field interaction
  const handleFieldFocus = (stepIndex) => {
    if (stepIndex > activeStep) {
      setActiveStep(stepIndex);
    }
  };

  // Mark step as completed
  const markStepCompleted = (stepIndex, completed) => {
    setStepCompleted(prev => {
      const newCompleted = [...prev];
      newCompleted[stepIndex] = completed;
      return newCompleted;
    });
  };

  // Check password match in real-time
  const checkPasswordMatch = (newPassword, confirmPassword) => {
    if (confirmPassword && newPassword !== confirmPassword) {
      setPasswordMismatch(true);
      return false;
    } else {
      setPasswordMismatch(false);
      return true;
    }
  };

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Sanitize input data
      const sanitizedValues = {
        email: values.email.trim().toLowerCase(),
        securityQuestion: values.securityQuestion,
        securityQuestionAnswer: values.securityQuestionAnswer.trim(),
        password: values.newPassword
      };

      console.log('Attempting password reset for:', sanitizedValues.email);

      const response = await fetch('http://localhost:8082/reset-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(sanitizedValues),
        timeout: 10000 // 10 second timeout
      });

      // Try to parse response - first attempt JSON, fallback to text
      let responseData;
      let isJsonResponse = false;
      
      try {
        const responseText = await response.text();
        
        // Try to parse as JSON first
        try {
          responseData = JSON.parse(responseText);
          isJsonResponse = true;
        } catch (jsonError) {
          // If JSON parsing fails, use the text as is
          responseData = responseText;
          isJsonResponse = false;
        }
      } catch (textError) {
        responseData = 'Failed to read response';
        isJsonResponse = false;
      }

      if (!response.ok) {
        let errorMessage = 'Password reset failed. Please check your information and try again.';
        
        // Handle JSON error responses
        if (isJsonResponse && typeof responseData === 'object') {
          // Handle field-specific errors
          if (response.status === 400 && responseData.fieldErrors) {
            Object.keys(responseData.fieldErrors).forEach(field => {
              setFieldError(field, responseData.fieldErrors[field]);
            });
            return;
          }

          // Handle specific error cases
          switch (response.status) {
            case 400:
              if (responseData.code === 'SAME_PASSWORD' || responseData.message?.includes('same password')) {
                setFieldError('newPassword', 'New password cannot be the same as your current password');
                errorMessage = 'New password cannot be the same as your current password.';
              } else if (responseData.code === 'PASSWORD_REUSED' || responseData.message?.includes('last 5 passwords')) {
                setFieldError('newPassword', 'You cannot reuse your last 5 passwords. Please choose a different password.');
                errorMessage = 'You cannot reuse your last 5 passwords. Please choose a different password.';
              } else if (responseData.code === 'WEAK_PASSWORD') {
                setFieldError('newPassword', 'Password does not meet security requirements');
                errorMessage = 'Password does not meet security requirements.';
              } else {
                errorMessage = responseData.message || errorMessage;
              }
              break;
            case 401:
              errorMessage = 'Invalid email or security question answer. Please check your information.';
              setVerificationAttempts(prev => prev + 1);
              if (verificationAttempts >= 2) {
                errorMessage += ' Account may be temporarily locked due to multiple failed attempts.';
              }
              break;
            case 404:
              errorMessage = 'Email address not found. Please check your email or register a new account.';
              setFieldError('email', 'Email address not found');
              break;
            case 429:
              errorMessage = 'Too many password reset attempts. Please try again later.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = responseData.message || errorMessage;
          }
        } else {
          // Handle text error responses
          const errorText = responseData;
          
          if (errorText.includes('Password cannot be the same') || errorText.includes('same password')) {
            setFieldError('newPassword', 'New password cannot be the same as your current password');
            errorMessage = 'New password cannot be the same as your current password.';
          } else if (errorText.includes('password reused') || errorText.includes('last 5 passwords') || errorText.includes('previously used')) {
            setFieldError('newPassword', 'You cannot reuse your last 5 passwords. Please choose a different password.');
            errorMessage = 'You cannot reuse your last 5 passwords. Please choose a different password.';
          } else if (errorText.includes('Invalid email') || errorText.includes('email not found')) {
            setFieldError('email', 'Email address not found');
            errorMessage = 'Email address not found. Please check your email.';
          } else if (errorText.includes('Invalid security') || errorText.includes('security question')) {
            setFieldError('securityQuestionAnswer', 'Incorrect security question answer');
            errorMessage = 'Incorrect security question answer. Please try again.';
          } else if (errorText.includes('weak password') || errorText.includes('password requirements')) {
            setFieldError('newPassword', 'Password does not meet security requirements');
            errorMessage = 'Password does not meet security requirements.';
          } else if (errorText.trim()) {
            errorMessage = errorText;
          } else {
            // Handle HTTP status codes when response is empty
            switch (response.status) {
              case 400:
                errorMessage = 'Bad request. Please check your input and try again.';
                break;
              case 401:
                errorMessage = 'Invalid credentials. Please check your email and security question answer.';
                break;
              case 404:
                errorMessage = 'Email address not found. Please check your email.';
                break;
              case 429:
                errorMessage = 'Too many attempts. Please try again later.';
                break;
              case 500:
                errorMessage = 'Server error. Please try again later.';
                break;
              default:
                errorMessage = `Request failed with status ${response.status}. Please try again.`;
            }
          }
        }
        
        throw new Error(errorMessage);
      }

      // Success handling - check if response is JSON or text
      let successMessage = 'Password reset successful! You can now log in with your new password.';
      
      if (isJsonResponse && typeof responseData === 'object') {
        console.log('Password reset successful (JSON response):', responseData);
        if (responseData.message) {
          successMessage = responseData.message;
        }
      } else {
        console.log('Password reset successful (Text response):', responseData);
        // Clean up the success message if it's a simple text response
        if (responseData && typeof responseData === 'string') {
          // Remove any extra whitespace and use the response if it looks like a success message
          const cleanResponse = responseData.trim();
          if (cleanResponse.length > 0 && cleanResponse.length < 200) {
            successMessage = cleanResponse;
          }
        }
      }

      // Set success messages
      setSuccess(successMessage);
      setSnackbarMessage('Password reset successful! Redirecting to login...');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setActiveStep(2); // Move to final step
      
      // Clear any verification attempts
      setVerificationAttempts(0);
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Password reset successful! Please log in with your new password.',
            email: sanitizedValues.email 
          }
        });
      }, 3000);
      
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
      setSnackbarMessage(error.message || 'Password reset failed');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mt: 4, 
          mb: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <Typography 
          component="h1" 
          variant="h4" 
          align="center" 
          gutterBottom
          sx={{ 
            color: '#442c2e',
            fontWeight: 'bold',
            mb: 3
          }}
        >
          Reset Your Password
        </Typography>

        {/* Progress Stepper */}
        <Box sx={{ width: '100%', mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label} completed={stepCompleted[index]}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: activeStep === index ? '#1976d2' : stepCompleted[index] ? '#4caf50' : '#757575',
                      fontWeight: activeStep === index ? 'bold' : 'normal'
                    }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        
        {/* Security Notice */}
        <Alert 
          severity="info" 
          icon={<Security />}
          sx={{ width: '100%', mb: 3 }}
        >
          <Typography variant="body2">
            <strong>Security Requirements:</strong> Your new password cannot be the same as your current password 
            or any of your last 5 passwords. Choose a strong, unique password.
          </Typography>
        </Alert>

        {/* Error Message */}
        {error && (
          <Alert 
            severity="error" 
            icon={<Warning />}
            sx={{ width: '100%', mb: 2 }}
          >
            {error}
          </Alert>
        )}
        
        {/* Success Message */}
        {success && (
          <Alert 
            severity="success" 
            icon={<CheckCircle />}
            sx={{ width: '100%', mb: 2 }}
          >
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
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({ errors, touched, isSubmitting, values, setFieldValue, handleBlur, handleChange }) => (
            <Form style={{ width: '100%', maxWidth: 500 }}>
              {/* Email Field */}
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
                onFocus={() => handleFieldFocus(0)}
                onChange={(e) => {
                  handleChange(e);
                  markStepCompleted(0, e.target.value.trim().length > 0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color={touched.email && errors.email ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              
              <Divider sx={{ my: 2 }} />
              
              {/* Security Question Dropdown */}
              <FormControl 
                fullWidth 
                error={touched.securityQuestion && Boolean(errors.securityQuestion)}
                disabled={isLoading}
                sx={{ mb: 2 }}
              >
                <InputLabel id="security-question-label">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security fontSize="small" />
                    Security Question
                  </Box>
                </InputLabel>
                <Select
                  labelId="security-question-label"
                  id="securityQuestion"
                  name="securityQuestion"
                  value={values.securityQuestion}
                  label="Security Question"
                  onFocus={() => handleFieldFocus(1)}
                  onChange={(e) => {
                    setFieldValue('securityQuestion', e.target.value);
                    markStepCompleted(1, e.target.value.length > 0 && values.securityQuestionAnswer.trim().length > 0);
                  }}
                  onBlur={handleBlur}
                >
                  {securityQuestions.map((question, index) => (
                    <MenuItem key={index} value={question}>
                      <Typography variant="body2">{question}</Typography>
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
                placeholder="Enter your security question answer"
                fullWidth
                variant="outlined"
                margin="normal"
                error={touched.securityQuestionAnswer && Boolean(errors.securityQuestionAnswer)}
                helperText={touched.securityQuestionAnswer && errors.securityQuestionAnswer}
                disabled={isLoading}
                onFocus={() => handleFieldFocus(1)}
                onChange={(e) => {
                  handleChange(e);
                  markStepCompleted(1, values.securityQuestion.length > 0 && e.target.value.trim().length > 0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Help color={touched.securityQuestionAnswer && errors.securityQuestionAnswer ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <Divider sx={{ my: 2 }} />
              
              {/* New Password */}
              <Field
                as={TextField}
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                fullWidth
                variant="outlined"
                margin="normal"
                autoComplete="new-password"
                error={touched.newPassword && Boolean(errors.newPassword)}
                helperText={touched.newPassword && errors.newPassword}
                disabled={isLoading}
                onFocus={() => handleFieldFocus(2)}
                onChange={(e) => {
                  handleChange(e);
                  setPasswordStrength(getPasswordStrength(e.target.value));
                  const isMatching = checkPasswordMatch(e.target.value, values.confirmPassword);
                  markStepCompleted(2, e.target.value.length >= 8 && isMatching && values.confirmPassword.length > 0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color={touched.newPassword && errors.newPassword ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowNewPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        disabled={isLoading}
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1 }}
              />

              {/* Password Strength Indicator */}
              {values.newPassword && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Password Strength
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ color: getStrengthColor(passwordStrength), fontWeight: 'bold' }}
                    >
                      {getStrengthText(passwordStrength)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={passwordStrength}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getStrengthColor(passwordStrength),
                        borderRadius: 3,
                      },
                    }}
                  />
                </Box>
              )}
              
              {/* Confirm Password */}
              <Field
                as={TextField}
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                fullWidth
                variant="outlined"
                margin="normal"
                autoComplete="new-password"
                error={(touched.confirmPassword && Boolean(errors.confirmPassword)) || passwordMismatch}
                helperText={
                  touched.confirmPassword && errors.confirmPassword ? 
                  errors.confirmPassword : 
                  (passwordMismatch ? 'Passwords do not match' : '')
                }
                disabled={isLoading}
                onFocus={() => handleFieldFocus(2)}
                onChange={(e) => {
                  handleChange(e);
                  const isMatching = checkPasswordMatch(values.newPassword, e.target.value);
                  markStepCompleted(2, values.newPassword.length >= 8 && isMatching && e.target.value.length > 0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color={((touched.confirmPassword && errors.confirmPassword) || passwordMismatch) ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-error fieldset': {
                      borderColor: passwordMismatch ? '#f44336' : undefined,
                    },
                  },
                }}
              />

              {/* Real-time password mismatch warning */}
              {passwordMismatch && values.confirmPassword && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Passwords do not match. Please make sure both passwords are identical.
                </Alert>
              )}
              
              {/* Action Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                <Link href="/login" style={{ textDecoration: 'none' }}>
                  <Button variant="text" disabled={isLoading}>
                    ← Back to Login
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isLoading || Object.keys(errors).length > 0 || passwordMismatch}
                  sx={{ 
                    py: 1.5,
                    px: 3,
                    minWidth: '160px',
                    backgroundColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#115293',
                    },
                    '&:disabled': {
                      backgroundColor: '#ccc',
                    },
                  }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                </Button>
              </Box>

              {/* Security Tips */}
              <Alert 
                severity="info" 
                sx={{ mt: 3 }}
                icon={<Security />}
              >
                <Typography variant="body2">
                  <strong>Password Security Tips:</strong>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    <li>Use a unique password you haven't used before</li>
                    <li>Include uppercase, lowercase, numbers, and special characters</li>
                    <li>Avoid personal information or common words</li>
                    <li>Consider using a password manager</li>
                  </ul>
                </Typography>
              </Alert>
            </Form>
          )}
        </Formik>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
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