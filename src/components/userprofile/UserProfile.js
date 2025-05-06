// UserProfile component for editing user profile information and uploading a profile picture.
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Paper,
  Avatar,
  CircularProgress,
} from '@mui/material';

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);

  const userId = '123'; // Replace with actual ID or context

  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      bio: '',
      skillLevel: '',
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required('Full name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      phone: Yup.string()
        .matches(/^\d{10}$/, 'Phone must be 10 digits')
        .required('Phone is required'),
      location: Yup.string().required('Location is required'),
      bio: Yup.string().max(200, 'Bio cannot exceed 200 characters'),
      skillLevel: Yup.string().required('Skill level is required'),
    }),
    onSubmit: async (values) => {
      try {
        await axios.put(`http://localhost:8082/profile`, values);
        alert('Profile updated successfully');
      } catch (error) {
        console.error('Update failed:', error);
      }
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`/api/profile`);
        formik.setValues(data);
        setPreview(data.profilePictureUrl);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleImageUpload = async () => {
    if (!profilePic) return;
    const formData = new FormData();
    formData.append('image', profilePic);

    try {
      await axios.post(`/api/profile/${userId}/upload-picture`, formData);
      alert('Profile picture uploaded');
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
      <Paper elevation={3} sx={{ padding: 4, width: 500 }}>
        <Typography variant="h5" gutterBottom>
          Edit Profile
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Avatar src={preview} sx={{ width: 100, height: 100 }} />
          <input type="file" accept="image/*" onChange={handleImageChange} />
          <Button onClick={handleImageUpload} variant="outlined">Upload Picture</Button>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
            <TextField
              label="Full Name"
              name="fullName"
              value={formik.values.fullName}
              onChange={formik.handleChange}
              error={formik.touched.fullName && !!formik.errors.fullName}
              helperText={formik.touched.fullName && formik.errors.fullName}
            />

            <TextField
              label="Email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && !!formik.errors.email}
              helperText={formik.touched.email && formik.errors.email}
            />

            <TextField
              label="Phone"
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              error={formik.touched.phone && !!formik.errors.phone}
              helperText={formik.touched.phone && formik.errors.phone}
            />

            <TextField
              label="Location"
              name="location"
              value={formik.values.location}
              onChange={formik.handleChange}
              error={formik.touched.location && !!formik.errors.location}
              helperText={formik.touched.location && formik.errors.location}
            />

            <TextField
              label="Bio"
              name="bio"
              multiline
              rows={3}
              value={formik.values.bio}
              onChange={formik.handleChange}
              error={formik.touched.bio && !!formik.errors.bio}
              helperText={formik.touched.bio && formik.errors.bio}
            />

            <TextField
              select
              label="Skill Level"
              name="skillLevel"
              value={formik.values.skillLevel}
              onChange={formik.handleChange}
              error={formik.touched.skillLevel && !!formik.errors.skillLevel}
              helperText={formik.touched.skillLevel && formik.errors.skillLevel}
            >
              <MenuItem value="Beginner">Beginner</MenuItem>
              <MenuItem value="Intermediate">Intermediate</MenuItem>
              <MenuItem value="Advanced">Advanced</MenuItem>
            </TextField>

            <Button type="submit" variant="contained" color="primary">
              Save Profile
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};
export default UserProfile;
