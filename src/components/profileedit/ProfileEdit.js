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
  FormHelperText
} from '@mui/material';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Validation Schema for Profile Edit
const ProfileEditSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  phone: Yup.string()
    .matches(/^[6-9]{1}[0-9]{9}$/, "Phone must be 10 digits starting with 6-9")
    .required('Phone is required'),
  address: Yup.string().required('Address is required'),
  state: Yup.string().required('State is required'),
  zipcode: Yup.string()
    .matches(/^\d{5,6}$/, 'Zipcode must be 5 or 6 digits')
    .required('Zipcode is required'),
  country: Yup.string().required('Country is required'),
  securityQuestion: Yup.string(),
  securityQuestionAnswer: Yup.string()
});

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

const ProfileEdit = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();  // Correct usage of useNavigate inside the component.

  // Get the user ID and token from localStorage
  const userId = localStorage.getItem('userId') || '5'; // Default to 5 for testing
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
        console.log('Fetching profile for user ID:', userId);
        console.log('Using token:', token);
        
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
  }, [userId, token]);

  const handleSubmit = async (values, { setSubmitting }) => {
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
      // Prepare update payload
      const updatedProfile = {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        address: values.address,
        state: values.state,
        zipcode: values.zipcode,
        country: values.country
      };

      // Only include security question fields if both are provided
      if (values.securityQuestion && values.securityQuestionAnswer) {
        updatedProfile.securityQuestion = values.securityQuestion;
        updatedProfile.securityQuestionAnswer = values.securityQuestionAnswer;
      }

      console.log('Sending update request with data:', updatedProfile);

      const response = await axios.put(`http://localhost:8082/update/`, updatedProfile, {
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
      setNotification({
        open: true,
        message: err.response?.data || 'Failed to update profile. Please try again.',
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
            securityQuestion: '',
            securityQuestionAnswer: ''
          }}
          validationSchema={ProfileEditSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true} // Important! This ensures form updates when userData changes
        >
          {({ errors, touched, isSubmitting, values, setFieldValue, handleBlur }) => (
            <Form>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Field
                  as={TextField}
                  name="firstName"
                  label="First Name"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  error={touched.firstName && Boolean(errors.firstName)}
                  helperText={touched.firstName && errors.firstName}
                />
                <Field
                  as={TextField}
                  name="lastName"
                  label="Last Name"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  error={touched.lastName && Boolean(errors.lastName)}
                  helperText={touched.lastName && errors.lastName}
                />
              </Box>

              <Field
                as={TextField}
                name="email"
                label="Email"
                fullWidth
                variant="outlined"
                margin="normal"
                disabled={true} // Email cannot be changed
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
              />

              <Field
                as={TextField}
                name="phone"
                label="Phone"
                fullWidth
                variant="outlined"
                margin="normal"
                error={touched.phone && Boolean(errors.phone)}
                helperText={touched.phone && errors.phone}
              />

              <Field
                as={TextField}
                name="address"
                label="Address"
                fullWidth
                variant="outlined"
                margin="normal"
                error={touched.address && Boolean(errors.address)}
                helperText={touched.address && errors.address}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Field
                  as={TextField}
                  name="state"
                  label="State"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  error={touched.state && Boolean(errors.state)}
                  helperText={touched.state && errors.state}
                />
                <Field
                  as={TextField}
                  name="zipcode"
                  label="Zipcode"
                  fullWidth
                  variant="outlined"
                  margin="normal"
                  error={touched.zipcode && Boolean(errors.zipcode)}
                  helperText={touched.zipcode && errors.zipcode}
                />
              </Box>

              <Field
                as={TextField}
                name="country"
                label="Country"
                fullWidth
                variant="outlined"
                margin="normal"
                error={touched.country && Boolean(errors.country)}
                helperText={touched.country && errors.country}
              />

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
                sx={{ mt: 2, mb: 1 }}
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
                label="Security Question Answer"
                fullWidth
                variant="outlined"
                margin="normal"
                error={touched.securityQuestionAnswer && Boolean(errors.securityQuestionAnswer)}
                helperText={touched.securityQuestionAnswer && errors.securityQuestionAnswer}
              />

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  sx={{ minWidth: 120 }}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfileEdit;
