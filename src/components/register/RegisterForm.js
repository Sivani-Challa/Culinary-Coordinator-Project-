import React, { useState } from 'react';
import { Formik, Field, Form } from 'formik';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Link, 
  Snackbar, 
  Alert, 
  MenuItem, 
  Select, 
  FormControl, 
  InputLabel, 
  FormHelperText,
  InputAdornment,
  IconButton,
  LinearProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  Phone,
  Home,
  LocationCity,
  Public,
  Security,
  Help
} from '@mui/icons-material';
import * as Yup from 'yup';
import axios from 'axios';

// Enhanced Validation Schema with comprehensive security rules
const RegisterSchema = Yup.object().shape({
  firstName: Yup.string()
    .trim()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
    
  lastName: Yup.string()
    .trim()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
    
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
    
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password'), null], 'Passwords must match'),
    
  countryCode: Yup.string()
    .required('Country code is required')
    .matches(/^\+\d{1,4}$/, 'Invalid country code format'),
    
  phone: Yup.string()
    .trim()
    .required('Phone number is required')
    .matches(/^[6-9]{1}[0-9]{9}$/, 'Phone must be 10 digits starting with 6-9')
    .length(10, 'Phone number must be exactly 10 digits'),
    
  address: Yup.string()
    .trim()
    .required('Address is required')
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address must not exceed 200 characters'),
    
  state: Yup.string()
    .trim()
    .required('State is required')
    .min(2, 'State must be at least 2 characters')
    .max(50, 'State must not exceed 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/, 'State can only contain letters, spaces, hyphens, and apostrophes'),
    
  zipcode: Yup.string()
    .trim()
    .required('Zipcode is required')
    .matches(/^\d{5,6}$/, 'Zipcode must be 5 or 6 digits')
    .test('valid-zipcode', 'Invalid zipcode format', function(value) {
      return value && /^[1-9]\d{4,5}$/.test(value);
    }),
    
  country: Yup.string()
    .trim()
    .required('Country is required')
    .min(2, 'Country must be at least 2 characters')
    .max(50, 'Country must not exceed 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/, 'Country can only contain letters, spaces, hyphens, and apostrophes'),
    
  securityQuestion: Yup.string()
    .required('Security question is required')
    .min(10, 'Security question must be at least 10 characters'),
    
  securityQuestionAnswer: Yup.string()
    .trim()
    .required('Security question answer is required')
    .min(3, 'Answer must be at least 3 characters')
    .max(100, 'Answer must not exceed 100 characters')
    .matches(/^[a-zA-Z0-9\s'-]+$/, 'Answer can only contain letters, numbers, spaces, hyphens, and apostrophes'),
});

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

// Expanded country code options
const countryCodes = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+7', country: 'Russia', flag: '🇷🇺' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦' },
  { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
];

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

// Common field styling to ensure consistent appearance
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    '&:hover': {
      backgroundColor: 'white',
    },
    '&.Mui-focused': {
      backgroundColor: 'white',
    },
    '&:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 1000px white inset',
      WebkitTextFillColor: 'inherit',
    },
  },
  '& .MuiOutlinedInput-input': {
    backgroundColor: 'transparent !important',
    '&:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 1000px white inset !important',
      WebkitTextFillColor: 'inherit !important',
      transition: 'background-color 5000s ease-in-out 0s',
    },
    '&:-webkit-autofill:hover': {
      WebkitBoxShadow: '0 0 0 1000px white inset !important',
    },
    '&:-webkit-autofill:focus': {
      WebkitBoxShadow: '0 0 0 1000px white inset !important',
    },
  },
};

const RegisterForm = () => {
  const [submitStatus, setSubmitStatus] = useState({ open: false, message: '', severity: 'success' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (values, { setSubmitting, resetForm, setFieldError }) => {
    try {
      console.log('Preparing to submit registration data:', values);
      
      // Sanitize and prepare data
      const sanitizedValues = {
        ...values,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        address: values.address.trim(),
        state: values.state.trim(),
        zipcode: values.zipcode.trim(),
        country: values.country.trim(),
        securityQuestionAnswer: values.securityQuestionAnswer.trim()
      };

      // Remove confirmPassword from submission
      delete sanitizedValues.confirmPassword;
      
      const response = await axios.post('http://localhost:8082/register', sanitizedValues, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });
      
      console.log('Registration successful! Server response:', response.data);
      
      setSubmitStatus({
        open: true,
        message: 'Registration successful!',
        severity: 'success'
      });
      
      resetForm();
      setPasswordStrength(0);
      
    } catch (error) {
      console.error('Registration error details:', error);
      console.log('Full error object:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      let hasFieldErrors = false;
      
      if (error.response) {
        const { status, data } = error.response;
        console.log('Error status:', status);
        console.log('Error data:', data);
        console.log('Error response:', error.response);
        
        // Try to get the response text/message in different ways
        let responseText = '';
        if (typeof data === 'string') {
          responseText = data;
        } else if (data && data.message) {
          responseText = data.message;
        } else if (data && data.error) {
          responseText = data.error;
        } else {
          responseText = JSON.stringify(data);
        }
        
        console.log('Response text for analysis:', responseText);
        const lowerResponseText = responseText.toLowerCase();
        
        // Handle field-specific errors from backend (structured format)
        if (data && data.fieldErrors) {
          console.log('Found fieldErrors:', data.fieldErrors);
          Object.keys(data.fieldErrors).forEach(field => {
            setFieldError(field, data.fieldErrors[field]);
            hasFieldErrors = true;
          });
          // Don't show snackbar if we have field-specific errors
          if (hasFieldErrors) return;
        }
        
        // Enhanced pattern matching for email errors
        if (lowerResponseText.includes('email')) {
          if (lowerResponseText.includes('already') || 
              lowerResponseText.includes('exists') || 
              lowerResponseText.includes('registered') ||
              lowerResponseText.includes('duplicate') ||
              lowerResponseText.includes('unique') ||
              lowerResponseText.includes('constraint') ||
              lowerResponseText.includes('violation')) {
            setFieldError('email', 'This email address is already registered');
            errorMessage = 'Email address is already registered. Please use a different email address.';
            hasFieldErrors = true;
          } else if (lowerResponseText.includes('invalid') || lowerResponseText.includes('format')) {
            setFieldError('email', 'Invalid email format');
            errorMessage = 'Please enter a valid email address.';
            hasFieldErrors = true;
          }
        }
        
        // Enhanced pattern matching for phone errors
        if (lowerResponseText.includes('phone')) {
          if (lowerResponseText.includes('already') || 
              lowerResponseText.includes('exists') || 
              lowerResponseText.includes('registered') ||
              lowerResponseText.includes('duplicate') ||
              lowerResponseText.includes('unique') ||
              lowerResponseText.includes('constraint') ||
              lowerResponseText.includes('violation')) {
            setFieldError('phone', 'This phone number is already registered');
            if (!hasFieldErrors) {
              errorMessage = 'Phone number is already registered. Please use a different phone number.';
            } else {
              errorMessage = 'Email and phone number are already registered. Please use different information.';
            }
            hasFieldErrors = true;
          } else if (lowerResponseText.includes('invalid') || lowerResponseText.includes('format')) {
            setFieldError('phone', 'Invalid phone number format');
            errorMessage = 'Please enter a valid phone number.';
            hasFieldErrors = true;
          }
        }
        
        // Check for database-specific error patterns
        if (lowerResponseText.includes('idx_email') || 
            lowerResponseText.includes('email_unique') ||
            lowerResponseText.includes('uc_email')) {
          setFieldError('email', 'This email address is already registered');
          errorMessage = 'Email address is already registered. Please use a different email address.';
          hasFieldErrors = true;
        }
        
        if (lowerResponseText.includes('idx_phone') || 
            lowerResponseText.includes('phone_unique') ||
            lowerResponseText.includes('uc_phone')) {
          setFieldError('phone', 'This phone number is already registered');
          if (!hasFieldErrors) {
            errorMessage = 'Phone number is already registered. Please use a different phone number.';
          } else {
            errorMessage = 'Email and phone number are already registered. Please use different information.';
          }
          hasFieldErrors = true;
        }
        
        // Check for generic duplicate/constraint errors and try to identify the field
        if (!hasFieldErrors && (lowerResponseText.includes('duplicate') || 
                                lowerResponseText.includes('unique constraint') ||
                                lowerResponseText.includes('already exists'))) {
          
          // Try to identify which field based on context
          if (lowerResponseText.includes(values.email.toLowerCase())) {
            setFieldError('email', 'This email address is already registered');
            errorMessage = 'Email address is already registered. Please use a different email address.';
            hasFieldErrors = true;
          }
          
          if (lowerResponseText.includes(values.phone)) {
            setFieldError('phone', 'This phone number is already registered');
            if (!hasFieldErrors) {
              errorMessage = 'Phone number is already registered. Please use a different phone number.';
            } else {
              errorMessage = 'Email and phone number are already registered. Please use different information.';
            }
            hasFieldErrors = true;
          }
        }
        
        // If we found specific field errors, show them
        if (hasFieldErrors) {
          setSubmitStatus({
            open: true,
            message: errorMessage,
            severity: 'error'
          });
          return;
        }
        
        // Handle specific HTTP status codes if no field errors were found
        switch (status) {
          case 400:
            errorMessage = 'Invalid data provided. Please check all fields and try again.';
            break;
          case 409:
            errorMessage = 'Some information is already registered. Please check your email and phone number.';
            break;
          case 422:
            errorMessage = 'Invalid data format. Please check your inputs and try again.';
            break;
          case 429:
            errorMessage = 'Too many registration attempts. Please try again later.';
            break;
          case 500:
            errorMessage = 'Server error occurred. Please try again later.';
            break;
          default:
            if (data && data.message) {
              errorMessage = data.message;
            } else if (responseText && responseText !== '{}' && responseText !== '[object Object]') {
              errorMessage = responseText;
            } else {
              errorMessage = `Registration failed with error ${status}. Please try again.`;
            }
        }
        
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your connection and try again.';
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = 'An unexpected error occurred. Please try again.';
      }
      
      setSubmitStatus({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSubmitStatus({ ...submitStatus, open: false });
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '500px',
        boxShadow: 3,
        borderRadius: 2,
        p: 4,
        backgroundColor: 'white',
        marginRight: { xs: '16px', sm: '48px', md: '80px' },
      }}
    >
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          textAlign: 'center',
          mb: 3,
          fontWeight: 'bold',
          color: '#442c2e',
        }}
      >
        Create Account
      </Typography>

      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          countryCode: '+91',
          phone: '',
          address: '',
          state: '',
          zipcode: '',
          country: '',
          securityQuestion: '',
          securityQuestionAnswer: '',
        }}
        validationSchema={RegisterSchema}
        onSubmit={handleSubmit}
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ errors, touched, isSubmitting, values, setFieldValue, handleBlur, handleChange }) => (
          <Form style={{ width: '100%' }}>
            {/* Name Fields */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Field
                name="firstName"
                placeholder="First Name"
                variant="outlined"
                fullWidth
                as={TextField}
                error={touched.firstName && Boolean(errors.firstName)}
                helperText={touched.firstName && errors.firstName}
                disabled={isSubmitting}
                autoComplete="given-name"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color={touched.firstName && errors.firstName ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
              <Field
                name="lastName"
                placeholder="Last Name"
                variant="outlined"
                fullWidth
                as={TextField}
                error={touched.lastName && Boolean(errors.lastName)}
                helperText={touched.lastName && errors.lastName}
                disabled={isSubmitting}
                autoComplete="family-name"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color={touched.lastName && errors.lastName ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
            </Box>
            
            {/* Email */}
            <Field
              name="email"
              placeholder="Email Address"
              type="email"
              variant="outlined"
              fullWidth
              as={TextField}
              autoComplete="email"
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email}
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color={touched.email && errors.email ? 'error' : 'action'} />
                  </InputAdornment>
                ),
              }}
              sx={{ ...fieldSx, mb: 2 }}
            />
            
            {/* Password */}
            <Field
              name="password"
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              as={TextField}
              autoComplete="new-password"
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
              disabled={isSubmitting}
              onChange={(e) => {
                handleChange(e);
                setPasswordStrength(getPasswordStrength(e.target.value));
              }}
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
                      disabled={isSubmitting}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ ...fieldSx, mb: 1 }}
            />

            {/* Password Strength Indicator */}
            {values.password && (
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
              name="confirmPassword"
              placeholder="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              as={TextField}
              autoComplete="new-password"
              error={touched.confirmPassword && Boolean(errors.confirmPassword)}
              helperText={touched.confirmPassword && errors.confirmPassword}
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color={touched.confirmPassword && errors.confirmPassword ? 'error' : 'action'} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleClickShowConfirmPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      disabled={isSubmitting}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ ...fieldSx, mb: 2 }}
            />
            
            {/* Phone with Country Code */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <FormControl 
                sx={{ 
                  width: '40%',
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                  },
                }} 
                variant="outlined"
                error={touched.countryCode && Boolean(errors.countryCode)}
                disabled={isSubmitting}
              >
                <InputLabel id="country-code-label">Country Code</InputLabel>
                <Select
                  labelId="country-code-label"
                  id="countryCode"
                  name="countryCode"
                  value={values.countryCode || '+91'}
                  label="Country Code"
                  onChange={(e) => setFieldValue('countryCode', e.target.value)}
                  onBlur={handleBlur}
                  renderValue={(selected) => {
                    const country = countryCodes.find(c => c.code === selected);
                    return country ? `${country.flag} ${country.code}` : selected;
                  }}
                >
                  {countryCodes.map((item) => (
                    <MenuItem key={item.code} value={item.code}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{item.flag}</span>
                        <span>{item.code}</span>
                        <Typography variant="caption" color="text.secondary">
                          {item.country}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {touched.countryCode && errors.countryCode && (
                  <FormHelperText>{errors.countryCode}</FormHelperText>
                )}
              </FormControl>
              
              <Field
                name="phone"
                placeholder="Phone Number"
                variant="outlined"
                fullWidth
                as={TextField}
                autoComplete="tel"
                error={touched.phone && Boolean(errors.phone)}
                helperText={touched.phone && errors.phone}
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color={touched.phone && errors.phone ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
            </Box>
            
            {/* Address */}
            <Field
              name="address"
              placeholder="Street Address"
              variant="outlined"
              fullWidth
              as={TextField}
              autoComplete="street-address"
              error={touched.address && Boolean(errors.address)}
              helperText={touched.address && errors.address}
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Home color={touched.address && errors.address ? 'error' : 'action'} />
                  </InputAdornment>
                ),
              }}
              sx={{ ...fieldSx, mb: 2 }}
            />
            
            {/* State, Zipcode, Country */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Field
                name="state"
                placeholder="State/Province"
                variant="outlined"
                fullWidth
                as={TextField}
                autoComplete="address-level1"
                error={touched.state && Boolean(errors.state)}
                helperText={touched.state && errors.state}
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationCity color={touched.state && errors.state ? 'error' : 'action'} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
              
              <Field
                name="zipcode"
                placeholder="ZIP/Postal Code"
                variant="outlined"
                fullWidth
                as={TextField}
                autoComplete="postal-code"
                error={touched.zipcode && Boolean(errors.zipcode)}
                helperText={touched.zipcode && errors.zipcode}
                disabled={isSubmitting}
                sx={fieldSx}
              />
            </Box>
            
            <Field
              name="country"
              placeholder="Country"
              variant="outlined"
              fullWidth
              as={TextField}
              autoComplete="country-name"
              error={touched.country && Boolean(errors.country)}
              helperText={touched.country && errors.country}
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Public color={touched.country && errors.country ? 'error' : 'action'} />
                  </InputAdornment>
                ),
              }}
              sx={{ ...fieldSx, mb: 2 }}
            />
            
            {/* Security Question */}
            <FormControl 
              fullWidth 
              error={touched.securityQuestion && Boolean(errors.securityQuestion)}
              disabled={isSubmitting}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                },
              }}
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
                onChange={(e) => setFieldValue('securityQuestion', e.target.value)}
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
              name="securityQuestionAnswer"
              placeholder="Security Question Answer"
              variant="outlined"
              fullWidth
              as={TextField}
              error={touched.securityQuestionAnswer && Boolean(errors.securityQuestionAnswer)}
              helperText={touched.securityQuestionAnswer && errors.securityQuestionAnswer}
              disabled={isSubmitting}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Help color={touched.securityQuestionAnswer && errors.securityQuestionAnswer ? 'error' : 'action'} />
                  </InputAdornment>
                ),
              }}
              sx={{ ...fieldSx, mb: 3 }}
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isSubmitting || Object.keys(errors).length > 0}
              sx={{ 
                mt: 1,
                py: 1.5,
                backgroundColor: '#1976d2',
                height: '48px',
                borderRadius: '4px',
                '&:disabled': {
                  backgroundColor: '#ccc',
                },
              }}
            >
              {isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Already have an account?{' '}
                <Link href="/login" color="primary">
                  Login
                </Link>
              </Typography>
            </Box>
          </Form>
        )}
      </Formik>
      
      <Snackbar 
        open={submitStatus.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={submitStatus.severity} 
          sx={{ width: '100%' }}
        >
          {submitStatus.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegisterForm;