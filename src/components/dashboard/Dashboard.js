import React, { useState } from 'react';
import { Button, TextField, Grid, Container, Box, Typography, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox } from '@mui/material';  // Add FormControlLabel and Checkbox here

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [brand, setBrand] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [weightRange, setWeightRange] = useState({ min: '', max: '' });
  const [recentlyAdded, setRecentlyAdded] = useState(false);

  const handleSearch = () => {
    console.log('Searching for:', searchQuery, brand, manufacturer, ingredients, weightRange, recentlyAdded);
  };

  return (
    <Container>
      <Box sx={{ padding: '20px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><Typography variant="h4">Culinary Coordinator</Typography></div>
          <div>
            <Button variant="outlined" style={{ marginRight: '10px' }}>Profile</Button>
            <Button variant="outlined">Logout</Button>
          </div>
        </header>

        <div style={{ marginTop: '20px' }}>
          <Button variant="outlined" style={{ marginRight: '10px' }}>Home</Button>
          <Button variant="outlined">My Favorites</Button>
        </div>

        <div style={{ marginTop: '20px' }}>
          <TextField
            label="Search Food Items"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="contained" color="primary" onClick={handleSearch} style={{ marginTop: '10px' }}>
            Search
          </Button>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <FormControl fullWidth>
            <InputLabel>Brand</InputLabel>
            <Select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              label="Brand"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="brand1">Brand 1</MenuItem>
              <MenuItem value="brand2">Brand 2</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Manufacturer</InputLabel>
            <Select
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              label="Manufacturer"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="manufacturer1">Manufacturer 1</MenuItem>
              <MenuItem value="manufacturer2">Manufacturer 2</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Ingredients"
            variant="outlined"
            fullWidth
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            style={{ marginLeft: '10px' }}
          />
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <TextField
            label="Weight Range Min"
            variant="outlined"
            type="number"
            value={weightRange.min}
            onChange={(e) => setWeightRange({ ...weightRange, min: e.target.value })}
            fullWidth
            style={{ marginRight: '10px' }}
          />
          <TextField
            label="Weight Range Max"
            variant="outlined"
            type="number"
            value={weightRange.max}
            onChange={(e) => setWeightRange({ ...weightRange, max: e.target.value })}
            fullWidth
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <FormControlLabel
            control={<Checkbox checked={recentlyAdded} onChange={(e) => setRecentlyAdded(e.target.checked)} />}
            label="Recently Added Only"
          />
        </div>

        <div style={{ marginTop: '30px' }}>
          <Grid container spacing={3}>
            {/* Food Item Cards */}
            <Grid item xs={12} sm={6} md={4}>
              <div style={{ border: '1px solid #ccc', padding: '10px' }}>
                <img src="food-item.jpg" alt="Food Item" style={{ width: '100%' }} />
                <h3>Food Item Name</h3>
                <p>Manufacturer: XYZ</p>
                <p>Weight: 500g</p>
                <p>Brand: ABC</p>
                <Button variant="outlined">Add to Favorites</Button>
                <Button variant="outlined" style={{ marginTop: '10px' }}>Remove from Favorites</Button>
              </div>
            </Grid>
          </Grid>
        </div>
      </Box>
    </Container>
  );
};

export default Dashboard;
