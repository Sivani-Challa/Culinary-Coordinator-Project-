import React, { useState, useEffect } from 'react';
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
  Snackbar,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Grid,
  Divider
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Enhanced Validation Schema for Profile Edit
const ProfileEditSchema = Yup.object().shape({
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
    
  securityQuestion: Yup.string(),
  
  securityQuestionAnswer: Yup.string()
    .when('securityQuestion', {
      is: (val) => val && val.length > 0,
      then: (schema) => schema
        .required('Security question answer is required when security question is selected')
        .min(3, 'Answer must be at least 3 characters')
        .max(100, 'Answer must not exceed 100 characters')
        .matches(/^[a-zA-Z0-9\s'-]+$/, 'Answer can only contain letters, numbers, spaces, hyphens, and apostrophes'),
      otherwise: (schema) => schema
    })
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

// Common field styling for consistency
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
  },
};

const ProfileEdit = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  
  // Get the user ID and token from localStorage
  const token = localStorage.getItem('token') || '';

  useEffect(() => {
    // Fetch user profile data
    const fetchUserProfile = async () => {
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching profile data...');
        
        const response = await axios.get(`http://localhost:8082/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Profile data received:', response.data);
        setUserData(response.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    if (!token) {
      setNotification({
        open: true,
        message: 'Authentication required. Please log in again.',
        severity: 'error'
      });
      setSubmitting(false);
      return;
    }

    console.log('Submitting updated profile data:', values);
    
    try {
      // Prepare update payload with sanitized data
      const updatedProfile = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
        state: values.state.trim(),
        zipcode: values.zipcode.trim(),
        country: values.country.trim()
      };

      // Enhanced security question validation
      const hasSecurityQuestion = values.securityQuestion && values.securityQuestion.trim();
      const hasSecurityAnswer = values.securityQuestionAnswer && values.securityQuestionAnswer.trim();

      if (hasSecurityQuestion && !hasSecurityAnswer) {
        setFieldError('securityQuestionAnswer', 'Security question answer is required when security question is selected');
        setNotification({
          open: true,
          message: 'Please provide an answer for the selected security question.',
          severity: 'error'
        });
        setSubmitting(false);
        return;
      }

      if (!hasSecurityQuestion && hasSecurityAnswer) {
        setFieldError('securityQuestion', 'Security question is required when answer is provided');
        setNotification({
          open: true,
          message: 'Please select a security question for your answer.',
          severity: 'error'
        });
        setSubmitting(false);
        return;
      }

      // Include security question fields if both are provided
      if (hasSecurityQuestion && hasSecurityAnswer) {
        updatedProfile.securityQuestion = values.securityQuestion.trim();
        updatedProfile.securityQuestionAnswer = values.securityQuestionAnswer.trim();
      }

      console.log('Sending update request with data:', updatedProfile);

      // Send data to your update endpoint
      const response = await axios.put('http://localhost:8082/update', updatedProfile, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Update response:', response.data);

      setNotification({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });
      
      // Update local user data
      setUserData(response.data);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      console.log('Full error object:', err);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      let hasFieldErrors = false;
      
      if (err.response) {
        const { status, data } = err.response;
        console.log('Error status:', status);
        console.log('Error data:', data);
        
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
          if (hasFieldErrors) {
            setSubmitting(false);
            return;
          }
        }
        
        // Enhanced pattern matching for phone errors (most common in profile updates)
        if (lowerResponseText.includes('phone')) {
          if (lowerResponseText.includes('already') || 
              lowerResponseText.includes('exists') || 
              lowerResponseText.includes('registered') ||
              lowerResponseText.includes('duplicate') ||
              lowerResponseText.includes('unique') ||
              lowerResponseText.includes('constraint') ||
              lowerResponseText.includes('violation')) {
            setFieldError('phone', 'This phone number is already registered by another user');
            errorMessage = 'Phone number is already registered by another user. Please use a different phone number.';
            hasFieldErrors = true;
          } else if (lowerResponseText.includes('invalid') || lowerResponseText.includes('format')) {
            setFieldError('phone', 'Invalid phone number format');
            errorMessage = 'Please enter a valid phone number (10 digits starting with 6-9).';
            hasFieldErrors = true;
          }
        }
        
        // Check for first name validation errors
        if (lowerResponseText.includes('first name') || lowerResponseText.includes('firstname')) {
          if (lowerResponseText.includes('invalid') || lowerResponseText.includes('format')) {
            setFieldError('firstName', 'Invalid first name format');
            errorMessage = 'First name can only contain letters, spaces, hyphens, and apostrophes.';
            hasFieldErrors = true;
          } else if (lowerResponseText.includes('required')) {
            setFieldError('firstName', 'First name is required');
            errorMessage = 'First name is required.';
            hasFieldErrors = true;
          }
        }
        
        // Check for last name validation errors
        if (lowerResponseText.includes('last name') || lowerResponseText.includes('lastname')) {
          if (lowerResponseText.includes('invalid') || lowerResponseText.includes('format')) {
            setFieldError('lastName', 'Invalid last name format');
            errorMessage = 'Last name can only contain letters, spaces, hyphens, and apostrophes.';
            hasFieldErrors = true;
          } else if (lowerResponseText.includes('required')) {
            setFieldError('lastName', 'Last name is required');
            errorMessage = 'Last name is required.';
            hasFieldErrors = true;
          }
        }
        
        // Check for address validation errors
        if (lowerResponseText.includes('address')) {
          if (lowerResponseText.includes('invalid') || lowerResponseText.includes('format')) {
            setFieldError('address', 'Invalid address format');
            errorMessage = 'Please enter a valid address.';
            hasFieldErrors = true;
          } else if (lowerResponseText.includes('required')) {
            setFieldError('address', 'Address is required');
            errorMessage = 'Address is required.';
            hasFieldErrors = true;
          }
        }
        
        // Check for state validation errors
        if (lowerResponseText.includes('state')) {
          if (lowerResponseText.includes('invalid') || lowerResponseText.includes('format')) {
            setFieldError('state', 'Invalid state format');
            errorMessage = 'State can only contain letters, spaces, hyphens, and apostrophes.';
            hasFieldErrors = true;
          } else if (lowerResponseText.includes('required')) {
            setFieldError('state', 'State is required');
            errorMessage = 'State is required.';
            hasFieldErrors = true;
          }
        }
        
        // Check for zipcode validation errors
        if (lowerResponseText.includes('zipcode') || lowerResponseText.includes('zip code') || lowerResponseText.includes('postal')) {
          if (lowerResponseText.includes('invalid') || lowerResponseText.includes('format')) {
            setFieldError('zipcode', 'Invalid zipcode format');
            errorMessage = 'Zipcode must be 5 or 6 digits.';
            hasFieldErrors = true;
          } else if (lowerResponseText.includes('required')) {
            setFieldError('zipcode', 'Zipcode is required');
            errorMessage = 'Zipcode is required.';
            hasFieldErrors = true;
          }
        }
        
        // Check for country validation errors
        if (lowerResponseText.includes('country')) {
          if (lowerResponseText.includes('invalid') || lowerResponseText.includes('format')) {
            setFieldError('country', 'Invalid country format');
            errorMessage = 'Country can only contain letters, spaces, hyphens, and apostrophes.';
            hasFieldErrors = true;
          } else if (lowerResponseText.includes('required')) {
            setFieldError('country', 'Country is required');
            errorMessage = 'Country is required.';
            hasFieldErrors = true;
          }
        }
        
        // Check for security question validation errors
        if (lowerResponseText.includes('security question')) {
          if (lowerResponseText.includes('required') || lowerResponseText.includes('must provide both')) {
            setFieldError('securityQuestion', 'Both security question and answer must be provided');
            setFieldError('securityQuestionAnswer', 'Both security question and answer must be provided');
            errorMessage = 'Both security question and answer must be provided to update security information.';
            hasFieldErrors = true;
          }
        }
        
        // Check for database-specific error patterns
        if (lowerResponseText.includes('idx_phone') || 
            lowerResponseText.includes('phone_unique') ||
            lowerResponseText.includes('uc_phone')) {
          setFieldError('phone', 'This phone number is already registered by another user');
          errorMessage = 'Phone number is already registered by another user. Please use a different phone number.';
          hasFieldErrors = true;
        }
        
        // If we found specific field errors, show them
        if (hasFieldErrors) {
          setNotification({
            open: true,
            message: errorMessage,
            severity: 'error'
          });
          setSubmitting(false);
          return;
        }
        
        // Handle specific HTTP status codes if no field errors were found
        switch (status) {
          case 400:
            errorMessage = 'Invalid data provided. Please check all fields and try again.';
            break;
          case 401:
            errorMessage = 'Authentication failed. Please log in again.';
            // Redirect to login
            setTimeout(() => navigate('/login'), 2000);
            break;
          case 403:
            errorMessage = 'You do not have permission to update this profile.';
            break;
          case 409:
            errorMessage = 'Some information conflicts with existing data. Please check your phone number.';
            break;
          case 422:
            errorMessage = 'Invalid data format. Please check your inputs and try again.';
            break;
          case 429:
            errorMessage = 'Too many update attempts. Please try again later.';
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
              errorMessage = `Update failed with error ${status}. Please try again.`;
            }
        }
        
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your connection and try again.';
      } else if (err.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = 'An unexpected error occurred. Please try again.';
      }
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
          Back to Login
        </Button>
      </Container>
    );
  }

  // If userData is still null after loading
  if (!userData) {
    return (
      <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          No user data available. Please try again.
        </Alert>
        <Button variant="contained" color="primary" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Back navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ 
            textTransform: 'none',
            color: 'primary.main',
          }}
        >
          Back to Home
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold', color: '#442c2e', textAlign: 'center' }}>
          Edit Profile
        </Typography>

        <Formik
          initialValues={{
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            state: userData.state || '',
            zipcode: userData.zipcode || '',
            country: userData.country || '',
            securityQuestion: userData.securityQuestion || '',
            securityQuestionAnswer: ''
          }}
          validationSchema={ProfileEditSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ errors, touched, isSubmitting, values, setFieldValue, handleBlur }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    name="firstName"
                    label="First Name"
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    autoComplete="given-name"
                    error={touched.firstName && Boolean(errors.firstName)}
                    helperText={touched.firstName && errors.firstName}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    name="lastName"
                    label="Last Name"
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    autoComplete="family-name"
                    error={touched.lastName && Boolean(errors.lastName)}
                    helperText={touched.lastName && errors.lastName}
                    sx={fieldSx}
                  />
                </Grid>
              </Grid>

              <Field
                as={TextField}
                name="email"
                label="Email"
                fullWidth
                variant="outlined"
                margin="normal"
                disabled={true}
                autoComplete="email"
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email ? errors.email : "Email cannot be changed"}
                sx={{
                  ...fieldSx,
                  '& .MuiOutlinedInput-root.Mui-disabled': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              />

              <Field
                as={TextField}
                name="phone"
                label="Phone"
                fullWidth
                variant="outlined"
                margin="normal"
                autoComplete="tel"
                error={touched.phone && Boolean(errors.phone)}
                helperText={touched.phone && errors.phone}
                sx={fieldSx}
              />

              <Field
                as={TextField}
                name="address"
                label="Address"
                fullWidth
                variant="outlined"
                margin="normal"
                autoComplete="street-address"
                error={touched.address && Boolean(errors.address)}
                helperText={touched.address && errors.address}
                sx={fieldSx}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    name="state"
                    label="State"
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    autoComplete="address-level1"
                    error={touched.state && Boolean(errors.state)}
                    helperText={touched.state && errors.state}
                    sx={fieldSx}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    name="zipcode"
                    label="Zipcode"
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    autoComplete="postal-code"
                    error={touched.zipcode && Boolean(errors.zipcode)}
                    helperText={touched.zipcode && errors.zipcode}
                    sx={fieldSx}
                  />
                </Grid>
              </Grid>

              <Field
                as={TextField}
                name="country"
                label="Country"
                fullWidth
                variant="outlined"
                margin="normal"
                autoComplete="country-name"
                error={touched.country && Boolean(errors.country)}
                helperText={touched.country && errors.country}
                sx={fieldSx}
              />

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" component="h2" sx={{ mt: 3, mb: 2 }}>
                Security Information
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                Only update security question and answer if you wish to change them. Both fields must be provided to update security information.
              </Typography>

              {/* Security Question Dropdown */}
              <FormControl 
                fullWidth 
                error={touched.securityQuestion && Boolean(errors.securityQuestion)}
                sx={{ 
                  mt: 2, 
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                  },
                }}
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
                  <MenuItem value="">
                    <em>Select a security question</em>
                  </MenuItem>
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
                label="Security Question Answer"
                fullWidth
                variant="outlined"
                margin="normal"
                error={touched.securityQuestionAnswer && Boolean(errors.securityQuestionAnswer)}
                helperText={touched.securityQuestionAnswer && errors.securityQuestionAnswer}
                sx={fieldSx}
              />

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/')}
                  disabled={isSubmitting}
                >
                  CANCEL
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || Object.keys(errors).length > 0}
                  sx={{ minWidth: 150 }}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'SAVE CHANGES'}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={8000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ 
            width: '100%',
            maxWidth: '500px',
            '& .MuiAlert-message': {
              whiteSpace: 'pre-line',
              wordBreak: 'break-word'
            }
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfileEdit;