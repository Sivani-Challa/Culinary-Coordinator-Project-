import React, { useState } from 'react';
import { Formik, Field, Form } from 'formik';
import { TextField, Button, Box, Typography, Link, Snackbar, Alert, MenuItem, Select, FormControl, InputLabel, FormHelperText } from '@mui/material';
import * as Yup from 'yup';
import axios from 'axios';

// Validation Schema for Register
const RegisterSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string().required('Password is required'),
  phone: Yup.string()
    .matches(/^[6-9]{1}[0-9]{9}$/, "Phone must be 10 digits starting with 6-9")
    .required('Phone is required'),
  address: Yup.string().required('Address is required'),
  state: Yup.string().required('State is required'),
  zipcode: Yup.string()
    .matches(/^\d{5,6}$/, 'Zipcode must be 5 or 6 digits')
    .required('Zipcode is required'),
  country: Yup.string().required('Country is required'),
  securityQuestion: Yup.string().required('Security Question is required'),
  securityQuestionAnswer: Yup.string().required('Security Question Answer is required'),
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

const RegisterForm = () => {
  const [submitStatus, setSubmitStatus] = useState({ open: false, message: '', severity: 'success' });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      console.log('Preparing to submit registration data:', values);
      
      // Add headers for better debugging
      const response = await axios.post('http://localhost:8082/register', values, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Registration successful! Server response:', response.data);
      
      // Show success message
      setSubmitStatus({
        open: true,
        message: 'Registration successful!',
        severity: 'success'
      });
      
      // Reset form after successful submission
      resetForm();
    } catch (error) {
      console.error('Registration error details:', error);
      
      // Handle error based on server response
      setSubmitStatus({
        open: true,
        message: error.response?.data || 'Registration failed. Please try again.',
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
        maxWidth: '450px',
        boxShadow: 3,
        borderRadius: 1,
        p: 3,
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
        Register
      </Typography>

      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          password: '',
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
        validateOnChange={false}
        validateOnBlur={true}
      >
        {({ errors, touched, isSubmitting, values, setFieldValue, handleBlur }) => (
          <Form style={{ width: '100%' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Field
                name="firstName"
                placeholder="First Name"
                variant="outlined"
                fullWidth
                as={TextField}
                error={touched.firstName && Boolean(errors.firstName)}
                helperText={touched.firstName && errors.firstName}
                sx={{ mb: 2 }}
              />
              <Field
                name="lastName"
                placeholder="Last Name"
                variant="outlined"
                fullWidth
                as={TextField}
                error={touched.lastName && Boolean(errors.lastName)}
                helperText={touched.lastName && errors.lastName}
                sx={{ mb: 2 }}
              />
            </Box>
            
            <Field
              name="email"
              placeholder="Email"
              variant="outlined"
              fullWidth
              as={TextField}
              error={touched.email && Boolean(errors.email)}
              helperText={touched.email && errors.email && (typeof errors.email === 'string' ? errors.email : 'Invalid email format')}
              sx={{ mb: 2 }}
            />
            
            <Field
              name="password"
              placeholder="Password"
              type="password"
              variant="outlined"
              fullWidth
              as={TextField}
              error={touched.password && Boolean(errors.password)}
              helperText={touched.password && errors.password}
              sx={{ mb: 2 }}
            />
            
            <Field
              name="phone"
              placeholder="Phone"
              variant="outlined"
              fullWidth
              as={TextField}
              error={touched.phone && Boolean(errors.phone)}
              helperText={touched.phone && errors.phone}
              sx={{ mb: 2 }}
            />
            
            <Field
              name="address"
              placeholder="Address"
              variant="outlined"
              fullWidth
              as={TextField}
              error={touched.address && Boolean(errors.address)}
              helperText={touched.address && errors.address}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Field
                name="state"
                placeholder="State"
                variant="outlined"
                fullWidth
                as={TextField}
                error={touched.state && Boolean(errors.state)}
                helperText={touched.state && errors.state}
                sx={{ mb: 2 }}
              />
              
              <Field
                name="zipcode"
                placeholder="Zipcode"
                variant="outlined"
                fullWidth
                as={TextField}
                error={touched.zipcode && Boolean(errors.zipcode)}
                helperText={touched.zipcode && errors.zipcode}
                sx={{ mb: 2 }}
              />
            </Box>
            
            <Field
              name="country"
              placeholder="Country"
              variant="outlined"
              fullWidth
              as={TextField}
              error={touched.country && Boolean(errors.country)}
              helperText={touched.country && errors.country}
              sx={{ mb: 2 }}
            />
            
            {/* Security Question Dropdown */}
            <FormControl 
              fullWidth 
              error={touched.securityQuestion && Boolean(errors.securityQuestion)}
              sx={{ mb: 2 }}
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
              name="securityQuestionAnswer"
              placeholder="Security Question Answer"
              variant="outlined"
              fullWidth
              as={TextField}
              error={touched.securityQuestionAnswer && Boolean(errors.securityQuestionAnswer)}
              helperText={touched.securityQuestionAnswer && errors.securityQuestionAnswer}
              sx={{ mb: 2 }}
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isSubmitting}
              sx={{ 
                mt: 1,
                backgroundColor: '#1976d2',
                height: '48px',
                borderRadius: '4px',
              }}
            >
              {isSubmitting ? 'REGISTERING...' : 'REGISTER'}
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