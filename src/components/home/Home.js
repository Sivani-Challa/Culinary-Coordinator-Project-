import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Pagination,
  IconButton,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  Button,
  Drawer,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LoginPopup from '../common/LoginPopup';
import { checkIsFavorite } from '../../api/favoriteService';

const Home = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 40; // 10 rows with 4 items per row
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPopupOpen, setLoginPopupOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [searchPlaceholder, setSearchPlaceholder] = useState('Search for items...');


  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Filters state
  const [openFilters, setOpenFilters] = useState(false);
  const [availableFilters, setAvailableFilters] = useState({
    brands: [],
    categories: [],
    manufacturers: [],
    ingredients: []
  });
  const [selectedFilters, setSelectedFilters] = useState({
    brands: [],
    categories: [],
    manufacturers: [],
    ingredients: []
  });

  // Add state for Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Use effect to check login status
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token); // Convert to boolean
    };

    const fetchUserProfile = async () => {
      if (isLoggedIn) {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const response = await fetch('http://localhost:8083/profile', {
              headers: {
                'Authorization': `Bearer ${token}`,
              }
            });
            if (response.ok) {
              const profileData = await response.json();
              setUserProfile(profileData);
            } else {
              console.error('Failed to fetch profile data');
            }
          } catch (error) {
            console.error('Error fetching user profile:', error);
          }
        }
      }
    };

    checkLoginStatus();
    fetchUserProfile();

    // Listen for storage changes (in case user logs in from another tab)
    window.addEventListener('storage', checkLoginStatus);
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    // Fetch items from the JSON server
    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8084/items/all');
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        const data = await response.json();
        setItems(data);
        setFilteredItems(data);
        // Calculate total pages
        setTotalPages(Math.ceil(data.length / itemsPerPage));
        setError(null);

        // Fetch filters if user is logged in
        if (isLoggedIn) {
          fetchFilters();
        }
      } catch (error) {
        console.error('Error fetching items:', error);
        setError('Failed to load items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [isLoggedIn]);

  // Fetch available filters
  const fetchFilters = async () => {
    try {
      const response = await fetch('http://localhost:8084/items/filters');
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      const data = await response.json();

      // Process the filters data based on the API structure
      const processedFilters = {
        brands: [],
        categories: [],
        manufacturers: [],
        ingredients: []
      };

      // Process filters based on the API response structure
      if (data && data.filters) {
        data.filters.forEach(filter => {
          if (filter.filterType === 'BRAND') {
            processedFilters.brands = filter.filters || [];
          } else if (filter.filterType === 'CATEGORY') {
            processedFilters.categories = filter.filters || [];
          } else if (filter.filterType === 'MANUFACTURER') {
            processedFilters.manufacturers = filter.filters || [];
          } else if (filter.filterType === 'INGREDIENTS') {
            processedFilters.ingredients = filter.filters || [];
          }
        });
      }

      setAvailableFilters(processedFilters);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  // Search function
  const handleSearch = async () => {
    setHasSearched(true);
    console.log('Starting search with filters:', selectedFilters);

    // Check if there are any active filters
    const hasAnyFilters =
      selectedFilters.brands.length > 0 ||
      selectedFilters.categories.length > 0 ||
      selectedFilters.manufacturers.length > 0 ||
      selectedFilters.ingredients.length > 0;

    // If search term is empty and no filters are selected, show all items
    if (!searchTerm.trim() && !hasAnyFilters) {
      console.log('No search term or filters, showing all items');
      setFilteredItems(items);
      setTotalPages(Math.ceil(items.length / itemsPerPage));
      setPage(1);
      return;
    }

    setLoading(true);

    try {
      let url;
      let queryParams = new URLSearchParams();

      // IMPORTANT: Always include searchTerm parameter, even if empty
      queryParams.append('searchTerm', searchTerm.trim() || "");

      // If user is logged in, use the advanced search endpoint with filters
      if (isLoggedIn) {
        url = 'http://localhost:8084/items/search';

        // Add selected filters to query params
        if (selectedFilters.brands.length > 0) {
          const brandsParam = selectedFilters.brands.join(',');
          queryParams.append('brand', brandsParam);
          console.log('Added brands to query:', brandsParam);
        }

        if (selectedFilters.categories.length > 0) {
          const categoriesParam = selectedFilters.categories.join(',');
          queryParams.append('category', categoriesParam);
          console.log('Added categories to query:', categoriesParam);
        }

        if (selectedFilters.manufacturers.length > 0) {
          const manufacturersParam = selectedFilters.manufacturers.join(',');
          queryParams.append('manufacturer', manufacturersParam);
          console.log('Added manufacturers to query:', manufacturersParam);
        }

        if (selectedFilters.ingredients.length > 0) {
          const ingredientsParam = selectedFilters.ingredients.join(',');
          queryParams.append('ingredients', ingredientsParam);
          console.log('Added ingredients to query:', ingredientsParam);
        }
      } else {
        // For guest users, use the guest search endpoint
        url = 'http://localhost:8084/items/searchForGuest';
      }

      // Add query params to URL
      const fullUrl = `${url}?${queryParams.toString()}`;
      console.log('Searching with URL:', fullUrl);

      const token = localStorage.getItem('token');
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      // If logged in, add authorization header
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: headers,
        credentials: 'include' // Include cookies
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Search results received:', data.length, 'items');

      setFilteredItems(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      setPage(1); // Reset to first page

    } catch (error) {
      console.error('Error searching items:', error);
      setError('Failed to search items. Please try again later.');
      setFilteredItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };
  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    console.log(`Toggling ${filterType} filter: ${value}`);
    setSelectedFilters(prev => {
      const updated = { ...prev };

      if (updated[filterType].includes(value)) {
        // Remove value if already selected
        updated[filterType] = updated[filterType].filter(item => item !== value);
        console.log(`Removed ${value} from ${filterType}`);
      } else {
        // Add value if not selected
        updated[filterType] = [...updated[filterType], value];
        console.log(`Added ${value} to ${filterType}`);
      }
      console.log(`Updated ${filterType} filters:`, updated[filterType]);
      return updated;
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    console.log('Resetting all filters');
    setSelectedFilters({
      brands: [],
      categories: [],
      manufacturers: [],
      ingredients: []
    });
  };

  // Apply filters button
  const handleApplyFilters = () => {
    console.log('Applying filters:', selectedFilters);
    // Count total selected filters for debugging
    const totalSelected =
      selectedFilters.brands.length +
      selectedFilters.categories.length +
      selectedFilters.manufacturers.length +
      selectedFilters.ingredients.length;

    console.log(`Total selected filters: ${totalSelected}`);
    setOpenFilters(false);
    // Make sure we trigger the search to apply filters
    handleSearch();
  };

  // Get current page items
  const getCurrentItems = () => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  };

const handleChangePage = (event, value) => {
  // First scroll to top immediately with highest priority
  window.scrollTo(0, 0);
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  
  // Then update the page state
  setPage(value);
};

  const handleAddToFavorites = async (id) => {
    // Check if the user is logged in
    if (isLoggedIn) {
      console.log('Adding to favorites:', id);

      const item = items.find((item) => item.id === id);  // Find the item clicked
      if (!item) {
        console.error('Item not found');
        setSnackbarMessage('Item not found');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      try {
        // Check if the item is already in favorites first
        const isAlreadyFavorite = await checkIsFavorite(id);

        if (isAlreadyFavorite) {
          // Item is already in favorites
          setSnackbarMessage('Already available in favorites');
          setSnackbarSeverity('info');
          setSnackbarOpen(true);
          return;
        }

        // Get the auth token from localStorage
        const authToken = localStorage.getItem('token');
        if (!authToken) {
          console.error('No auth token found');
          return;
        }

        // Make the API request to add the item to favorites
        setLoading(true);  // Set loading to true while the request is being processed
        const response = await fetch('http://localhost:8083/favorite/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,  // Pass the token in the header
          },
          body: JSON.stringify(item),  // Send the item in the request body
        });

        // Check for 409 Conflict status specifically
        if (response.status === 409) {
          // This is a duplicate - show appropriate message
          setSnackbarMessage('Item is already in your favorites');
          setSnackbarSeverity('info');
          setSnackbarOpen(true);
          return;
        }

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        // Show success message - make it clear this was a NEW addition
        setSnackbarMessage('Successfully added to favorites');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);

        // Reset error
        setError(null);
      } catch (error) {
        console.error('Error adding item to favorites:', error);
        // Check if error message contains "already in favorites"
        if (error.message && error.message.toLowerCase().includes('already in favorites')) {
          setSnackbarMessage('Item is already in your favorites');
          setSnackbarSeverity('info');
          setSnackbarOpen(true);
        } else {
          // General error handling
          setError('Failed to add item to favorites. Please try again.');
          setSnackbarMessage('Error adding to favorites');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      } finally {
        setLoading(false);  // Set loading to false after the request is completed
      }
    } else {
      console.log('User not logged in, showing popup');
      // Force dialog to reopen by first closing then opening
      setLoginPopupOpen(true);
    }
  };

  const handleViewProduct = (id) => {
    console.log('Viewing product:', id);
    navigate(`/product/${id}`);
  };

  const handleCloseLoginPopup = () => {
    console.log('Closing login popup');
    setLoginPopupOpen(false);
  };

  const handleLogin = () => {
    console.log('Login successful');
    // setIsLoggedIn(true);
    setLoginPopupOpen(false);
    // Redirect to the login page
    navigate('/login');
  };

  // Handle closing the snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Function to reset the page to home state
  const resetToHome = () => {
    setSearchTerm('');
    handleResetFilters();
    setFilteredItems(items);
    setTotalPages(Math.ceil(items.length / itemsPerPage));
    setPage(1);
    setHasSearched(false);
  };

  // Add global styles to handle the background properly
  useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    style.textContent = `
      html, body, #root {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        overflow-x: hidden;
      }
      body {
        background-image: url('/homebg.jpeg');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-attachment: fixed;
      }
    `;
    // Append style to head
    document.head.appendChild(style);

    // Clean up function
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Render filter drawer - only shown when user is logged in
  const filterDrawer = isLoggedIn && (
    <Drawer
      anchor="left"
      open={openFilters}
      onClose={() => setOpenFilters(false)}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        },
      }}
    >
      <Box sx={{ padding: 2 }}>
        <Typography variant="h6" component="div" sx={{ mb: 2, fontWeight: 'bold' }}>
          Filters
        </Typography>

        <Button
          variant="outlined"
          sx={{ mb: 2 }}
          size="small"
          onClick={handleResetFilters}
        >
          Reset Filters
        </Button>

        {/* Brands */}
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Brands</Typography>
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ maxHeight: '150px', overflow: 'auto', mb: 2 }}>
          <FormGroup>
            {availableFilters.brands.slice(0, 15).map((brand) => (
              <FormControlLabel
                key={brand}
                control={
                  <Checkbox
                    checked={selectedFilters.brands.includes(brand)}
                    onChange={() => handleFilterChange('brands', brand)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">{brand}</Typography>}
              />
            ))}
          </FormGroup>
        </Box>

        {/* Categories */}
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Categories</Typography>
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ maxHeight: '150px', overflow: 'auto', mb: 2 }}>
          <FormGroup>
            {availableFilters.categories.slice(0, 15).map((category) => (
              <FormControlLabel
                key={category}
                control={
                  <Checkbox
                    checked={selectedFilters.categories.includes(category)}
                    onChange={() => handleFilterChange('categories', category)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">{category}</Typography>}
              />
            ))}
          </FormGroup>
        </Box>

        {/* Manufacturers */}
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Manufacturers</Typography>
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ maxHeight: '150px', overflow: 'auto', mb: 2 }}>
          <FormGroup>
            {availableFilters.manufacturers.slice(0, 15).map((manufacturer) => (
              <FormControlLabel
                key={manufacturer}
                control={
                  <Checkbox
                    checked={selectedFilters.manufacturers.includes(manufacturer)}
                    onChange={() => handleFilterChange('manufacturers', manufacturer)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">{manufacturer}</Typography>}
              />
            ))}
          </FormGroup>
        </Box>

        {/* Ingredients */}
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Ingredients</Typography>
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ maxHeight: '150px', overflow: 'auto', mb: 2 }}>
          <FormGroup>
            {availableFilters.ingredients.slice(0, 15).map((ingredient) => (
              <FormControlLabel
                key={ingredient}
                control={
                  <Checkbox
                    checked={selectedFilters.ingredients.includes(ingredient)}
                    onChange={() => handleFilterChange('ingredients', ingredient)}
                    size="small"
                  />
                }
                label={<Typography variant="body2">{ingredient}</Typography>}
              />
            ))}
          </FormGroup>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleApplyFilters}
            fullWidth
          >
            Apply Filters
          </Button>
        </Box>
      </Box>
    </Drawer>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          backgroundColor: 'transparent',
          padding: '20px',
          marginTop: '20px',
          marginBottom: '20px',
        }}
      >
        {/* Welcome message - MADE TRANSPARENT */}
        <Box sx={{
          textAlign: 'center',
          marginBottom: '5px',
          mt: 1,
          backgroundColor: 'transparent',
          padding: '20px',
          borderRadius: '8px',
        }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              marginBottom: '10px',
              fontWeight: 'bold',
              color: '#000000',
            }}
          >
            Welcome to Culinary Mart!
          </Typography>

          {/* Display profile info if user is logged in */}
          {isLoggedIn && userProfile && (
            <Typography variant="h6" sx={{ marginBottom: '20px', color: '#000000' }}>
              Welcome, {userProfile.name || 'User'}!
            </Typography>
          )}

          <Typography
            variant="h6"
            sx={{
              marginBottom: '20px',
              color: '#000000'
            }}
          >
            Discover a wide variety of items available at Culinary Mart. Browse through the best offers and manage your favorites.
          </Typography>
        </Box>

        {/* Search Bar with transparent background */}
        <Box sx={{
          backgroundColor: 'transparent',
          padding: '20px',
          marginBottom: '30px',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%'
        }}>
          {/* Search bar and filter button container */}
          <Box sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2
          }}>
            {/* Search bar */}
            <TextField
              sx={{
                width: '60%',
                maxWidth: '500px',
              }}
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSearchPlaceholder('Search for items...'); // Reset to default when typing
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  if (!searchTerm.trim()) {
                    setSearchPlaceholder('Enter text to search for items');
                    return;
                  }
                  handleSearch();
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => {
                        if (!searchTerm.trim()) {
                          setSearchPlaceholder('Enter text to search for items');
                          return;
                        }
                        handleSearch();
                      }}
                      color="primary"
                      sx={{
                        bgcolor: '#1976d2',
                        color: 'white',
                        '&:hover': {
                          bgcolor: '#1565c0'
                        },
                        width: 36,
                        height: 36
                      }}
                      aria-label="Search"
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '25px', // Highly curved edges
                  paddingRight: '4px', // Ensure the button fits nicely
                  '& fieldset': {
                    borderRadius: '25px',
                  },
                  backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent background for text field
                }
              }}
              variant="outlined"
              size="medium"
            />

            {/* Only show filters button when logged in - NOW NEXT TO SEARCH */}
            {isLoggedIn && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => setOpenFilters(true)}
                startIcon={<FilterListIcon />}
                sx={{
                  borderRadius: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)'
                }}
              >
                Filters
              </Button>
            )}
          </Box>
        </Box>

        <Grid container spacing={2}>
          {/* Render filter drawer */}
          {filterDrawer}

          {/* Main content area */}
          <Grid item xs={12}>
            <Box sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)', // Very light background
              padding: '20px',
              marginBottom: '20px',
              borderRadius: '8px',
              marginTop: '-20px',
            }}>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  marginBottom: '16px',
                  fontWeight: 'bold',
                  color: '#000000',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  display: 'inline-block',
                  padding: '5px 15px',
                  borderRadius: '4px',
                }}
              >
                {searchTerm ? `Search Results for "${searchTerm}"` : 'Featured Items'}
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Box sx={{ textAlign: 'center', color: 'error.main', p: 2 }}>
                  <Typography>{error}</Typography>
                </Box>
              ) : filteredItems.length === 0 && hasSearched ? ( // Only show "No items found" if user has searched
                <Box sx={{ textAlign: 'center', p: 4, backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: '8px' }}>
                  <Typography variant="h6">No items found matching your criteria.</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={resetToHome}
                  >
                    Clear Search
                  </Button>
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'flex-start' }}>
                    {getCurrentItems().map((item, index) => (
                      <Box
                        key={item.id || index}
                        sx={{
                          width: 'calc(25% - 12px)', // 4 cards per row with gap
                          minWidth: '230px',
                          '@media (max-width: 900px)': {
                            width: 'calc(50% - 8px)', // 2 cards per row on medium screens
                          },
                          '@media (max-width: 600px)': {
                            width: '100%', // 1 card per row on small screens
                          },
                        }}
                      >
                        <Box
                          sx={{
                            height: '180px',
                            display: 'flex',
                            flexDirection: 'column',
                            border: '1px solid rgba(230, 200, 180, 0.5)',
                            borderRadius: 2,
                            backgroundColor: 'rgba(255, 250, 240, 0.85)',
                            boxShadow: '0 2px 8px rgba(180, 140, 120, 0.15)',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              border: '1px solid rgba(210, 160, 130, 0.8)',
                              boxShadow: '0 4px 12px rgba(180, 140, 120, 0.25)',
                            }
                          }}

                        >
                          <Box sx={{
                            padding: 2,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}>
                            <Box>
                              <Typography
                                sx={{
                                  fontWeight: '600', // Make it bolder for visibility
                                  maxHeight: '3em', // Approximately 2 lines of text
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2, // Limit to 2 lines
                                  WebkitBoxOrient: 'vertical',
                                  lineHeight: '1.5em', // Set line height for consistent height calculation
                                  wordBreak: 'break-word',
                                  color: '#000000', // Black
                                }}
                              >
                                {item.itemname || 'No Name Available'}
                              </Typography>

                              <Typography
                                variant="body2"
                                sx={{
                                  mt: 1,
                                  fontWeight: '500', // Semi-bold for visibility
                                  color: '#000000', // Black
                                }}
                              >
                                {item.brand || 'Brand Not Available'}
                              </Typography>
                            </Box>

                            <Box sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mt: 'auto'
                            }}>
                              <IconButton
                                onClick={() => handleViewProduct(item.id)}
                                sx={{
                                  color: 'white',
                                  backgroundColor: 'blue',
                                  '&:hover': {
                                    backgroundColor: '#1565c0'
                                  },
                                  width: 36,
                                  height: 36
                                }}
                              >
                                <VisibilityIcon sx={{ fontSize: '20px' }} />
                              </IconButton>

                              <IconButton
                                onClick={() => handleAddToFavorites(item.id)}
                                sx={{
                                  color: 'white',
                                  backgroundColor: 'purple',
                                  '&:hover': {
                                    backgroundColor: '#9c27b0'
                                  },
                                  width: 36,
                                  height: 36
                                }}
                              >
                                <FavoriteIcon sx={{ fontSize: '20px' }} />
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Pagination - only show if there are items */}
                  {filteredItems.length > 0 && (
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mt: 4,
                      mb: 4
                    }}>
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handleChangePage}
                        color="primary"
                        showFirstButton
                        showLastButton
                        sx={{
                          '& .MuiPaginationItem-root': {
                            color: '#000000', // Black
                            backgroundColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent white
                            '&.Mui-selected': {
                              backgroundColor: 'rgba(3, 54, 105, 0.8)', // Semi-transparent primary color
                              color: 'white',
                            },
                          },
                        }}
                      />
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Snackbar for messages */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbarSeverity}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>

      {/* Login Popup */}
      <LoginPopup
        open={loginPopupOpen}
        onClose={handleCloseLoginPopup}
        onLogin={handleLogin}
        showLoginButton={true}
      />
    </Box>
  );
};

export default Home;