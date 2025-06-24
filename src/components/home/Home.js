import React, { useEffect, useState, useCallback } from 'react';
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
  Grid,
  Collapse
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
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

  // Two-level filter expansion state - FIXED: Ensure all start as FALSE
  const [expandedFilters, setExpandedFilters] = useState({
    brands: false,
    categories: false,
    manufacturers: false,
    ingredients: false
  });

  const [showMoreFilters, setShowMoreFilters] = useState({
    brands: false,
    categories: false,
    manufacturers: false,
    ingredients: false
  });

  // Track how many times "Show More" has been clicked for each filter
  const [showMoreCount, setShowMoreCount] = useState({
    brands: 0,
    categories: 0,
    manufacturers: 0,
    ingredients: 0
  });

  // Add state for Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Configuration for how many items to show when collapsed
  const COLLAPSED_ITEMS_COUNT = 5;
  const SHOW_MORE_INCREMENT = 50; // Number of items to show when "Show More" is clicked

  // Helper function to clean and validate filter items
  const cleanAndValidateFilterItems = (items) => {
    if (!Array.isArray(items)) return [];
    
    const cleaned = items
      .filter(item => {
        // Remove null, undefined, empty strings, and strings with only whitespace
        if (!item || typeof item !== 'string' || item.trim() === '') {
          return false;
        }
        
        const trimmed = item.trim();
        
        // Skip very short items (less than 3 characters)
        if (trimmed.length < 3) {
          return false;
        }
        
        // Skip items that are just punctuation, numbers, or symbols
        if (/^[.,*()#\-+\s\d:;!@$%^&]+$/.test(trimmed)) {
          return false;
        }
        
        // Skip items that start with any punctuation or symbol
        if (/^[.,*()#\-+:;!@$%^&\s]/.test(trimmed)) {
          return false;
        }
        
        // Skip items that are just "and" or start with "and" (sentence fragments)
        if (/^and$/i.test(trimmed) || /^and\s/i.test(trimmed) || /^and\/or/i.test(trimmed)) {
          return false;
        }
        
        // Skip items that are just parentheses with content
        if (/^\([^)]*\)$/.test(trimmed)) {
          return false;
        }
        
        // Skip items containing colons (usually labels or categories)
        if (trimmed.includes(':')) {
          return false;
        }
        
        // Skip incomplete entries (ending with incomplete words or punctuation)
        if (/\s(water|oil|acid|extract|powder|flavor|salt)$/i.test(trimmed) && trimmed.length > 30) {
          return false;
        }
        
        // Skip very long manufacturing/processing statements
        if (trimmed.length > 50 && (/manufactured|processed|facility|contains/i.test(trimmed))) {
          return false;
        }
        
        // Skip common connecting words and phrases that are not ingredients
        const nonIngredientWords = [
          /^and$/i,
          /^or$/i,
          /^the$/i,
          /^of$/i,
          /^in$/i,
          /^with$/i,
          /^from$/i,
          /^by$/i,
          /^for$/i,
          /^as$/i,
          /^at$/i,
          /^on$/i,
          /^to$/i
        ];
        
        for (const pattern of nonIngredientWords) {
          if (pattern.test(trimmed)) {
            return false;
          }
        }
        
        // Skip nutritional disclaimers and common non-ingredient text
        const nonIngredientPatterns = [
          /not a source of/i,
          /contains.*fat/i,
          /serving.*contains/i,
          /\d+ml/i,
          /ingredients not in/i,
          /^organic\.?$/i,
          /trans fat/i,
          /per serving/i,
          /bht added/i,
          /preserve freshness/i,
          /packaging material/i,
          /contains milk/i,
          /contains.*ingredients/i,
          /dietary.*amount/i,
          /cholesterol/i,
          /soy ingredients/i,
          /tomato paste/i,
          /^contains:/i,
          /^contains\s/i,
          /add food enhancer/i,
          /manufactured in.*facility/i,
          /processes products/i,
          /tree nuts/i,
          /to protect taste/i,
          /as a preservative/i
        ];
        
        for (const pattern of nonIngredientPatterns) {
          if (pattern.test(trimmed)) {
            return false;
          }
        }
        
        // Skip items that are mostly punctuation (more than 30% punctuation)
        const punctuationCount = (trimmed.match(/[.,*()#\-+:;!@$%^&]/g) || []).length;
        const punctuationRatio = punctuationCount / trimmed.length;
        if (punctuationRatio > 0.3) {
          return false;
        }
        
        // Only keep items that look like actual ingredient names
        // Must contain at least one letter and be reasonably long
        if (!/[a-zA-Z]/.test(trimmed) || trimmed.length < 2) {
          return false;
        }
        
        return true;
      })
      .map(item => {
        let cleaned = item.trim();
        
        // Remove trailing special characters, asterisks, periods, etc.
        cleaned = cleaned.replace(/[.,;!*#+\-_^&%$@()]+$/, '');
        
        // Remove leading special characters
        cleaned = cleaned.replace(/^[.,;!*#+\-_^&%$@()]+/, '');
        
        // Clean up extra spaces
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        
        // Convert to proper case (first letter uppercase, rest lowercase for comparison)
        // But keep the original casing for display
        return cleaned;
      })
      .filter(item => item.length > 0) // Remove empty strings after cleaning
      .filter((item, index, array) => {
        // Remove duplicates with case-insensitive comparison and special character normalization
        const normalize = (str) => {
          return str
            .toLowerCase()
            .replace(/[.,;!*#+\-_^&%$@()]/g, '') // Remove all special characters
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();
        };
        
        const normalizedCurrent = normalize(item);
        
        // Skip if normalized item is too short or is just a common word
        if (normalizedCurrent.length < 3 || /^(and|or|the|of|in|with|from|by|for|as|at|on|to)$/i.test(normalizedCurrent)) {
          return false;
        }
        
        // Find the first occurrence of this normalized item
        const firstIndex = array.findIndex(el => 
          normalize(el) === normalizedCurrent
        );
        
        // Keep only the first occurrence
        return firstIndex === index;
      });
    
    // Sort: alphabetical first (case-insensitive), then items starting with numbers
    const alphabetical = cleaned
      .filter(item => /^[a-zA-Z]/.test(item))
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    
    const withNumbers = cleaned
      .filter(item => /^[0-9]/.test(item))
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    
    return [...alphabetical, ...withNumbers];
  };

  // Get items to display based on show more state
  const getItemsToDisplay = (filterType, items) => {
    const showMore = showMoreFilters[filterType];
    const clickCount = showMoreCount[filterType];
    
    if (showMore) {
      // Calculate total items to show: initial 5 + (click count * 50)
      const totalToShow = COLLAPSED_ITEMS_COUNT + (clickCount * SHOW_MORE_INCREMENT);
      return items.slice(0, Math.min(totalToShow, items.length));
    }
    return items.slice(0, COLLAPSED_ITEMS_COUNT);
  };

  // Get show more button text
  const getShowMoreButtonText = (filterType, items) => {
    const showMore = showMoreFilters[filterType];
    const clickCount = showMoreCount[filterType];
    const totalItems = items.length;
    const currentlyShowing = showMore 
      ? Math.min(COLLAPSED_ITEMS_COUNT + (clickCount * SHOW_MORE_INCREMENT), totalItems)
      : COLLAPSED_ITEMS_COUNT;
    
    if (showMore) {
      // If showing more, check if there are still more items to show
      const remaining = totalItems - currentlyShowing;
      if (remaining > 0) {
        return `Show ${Math.min(remaining, SHOW_MORE_INCREMENT)} More`;
      } else {
        return 'Show Less';
      }
    } else {
      // If collapsed, show how many more can be shown (max 50)
      const remaining = totalItems - COLLAPSED_ITEMS_COUNT;
      return `Show ${Math.min(remaining, SHOW_MORE_INCREMENT)} More`;
    }
  };

  // Check if show more button should be displayed
  const shouldShowMoreButton = (filterType, items) => {
    const totalItems = items.length;
    
    if (totalItems <= COLLAPSED_ITEMS_COUNT) {
      return false; // No need for button if total items <= collapsed count
    }
    
    return true; // Always show if there are more than COLLAPSED_ITEMS_COUNT items
  };

  // Toggle main filter section expansion
  const toggleFilterExpansion = (filterType) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
    
    // Reset show more when collapsing
    if (expandedFilters[filterType]) {
      setShowMoreFilters(prev => ({
        ...prev,
        [filterType]: false
      }));
    }
  };

  // Toggle show more items within a filter
  const toggleShowMore = (filterType) => {
    const totalItems = availableFilters[filterType].length;
    const currentClickCount = showMoreCount[filterType];
    const currentlyShowing = COLLAPSED_ITEMS_COUNT + (currentClickCount * SHOW_MORE_INCREMENT);
    
    setShowMoreFilters(prev => {
      const newState = { ...prev };
      const isCurrentlyExpanded = prev[filterType];
      
      if (isCurrentlyExpanded && currentlyShowing >= totalItems) {
        // If we're showing all items, collapse back to initial state
        newState[filterType] = false;
        setShowMoreCount(prevCount => ({
          ...prevCount,
          [filterType]: 0
        }));
      } else if (isCurrentlyExpanded) {
        // If expanded but not showing all, show 50 more
        setShowMoreCount(prevCount => ({
          ...prevCount,
          [filterType]: prevCount[filterType] + 1
        }));
      } else {
        // If collapsed, start showing more
        newState[filterType] = true;
        setShowMoreCount(prevCount => ({
          ...prevCount,
          [filterType]: 1
        }));
      }
      
      return newState;
    });
  };

  // Use effect to check login status
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token); // Convert to boolean
      console.log('Login status checked - isLoggedIn:', !!token);
    };

    const fetchUserProfile = async () => {
      if (isLoggedIn) {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            console.log('Fetching user profile...');
            const response = await fetch('http://localhost:8083/profile', {
              headers: {
                'Authorization': `Bearer ${token}`,
              }
            });
            if (response.ok) {
              const profileData = await response.json();
              setUserProfile(profileData);
              console.log('User profile loaded:', profileData);
            } else {
              console.error('Failed to fetch profile data, status:', response.status);
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

  // Fetch available filters
  const fetchFilters = useCallback(async () => {
    console.log('=== FETCH FILTERS DEBUG START ===');
    try {
      const response = await fetch('http://localhost:8084/items/filters');
      console.log('Filters response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Raw filters data:', data);

      // Process the filters data based on the API structure
      const processedFilters = {
        brands: [],
        categories: [],
        manufacturers: [],
        ingredients: []
      };

      // Process filters based on the API response structure
      if (data && data.filters) {
        console.log('Processing filters from data.filters');
        data.filters.forEach(filter => {
          console.log('Processing filter:', filter.filterType, 'with', filter.filters?.length || 0, 'items');
          
          if (filter.filterType === 'BRAND') {
            const cleaned = cleanAndValidateFilterItems(filter.filters || []);
            processedFilters.brands = cleaned;
            console.log('Processed brands:', cleaned.length, 'items');
          } else if (filter.filterType === 'CATEGORY') {
            const cleaned = cleanAndValidateFilterItems(filter.filters || []);
            processedFilters.categories = cleaned;
            console.log('Processed categories:', cleaned.length, 'items');
          } else if (filter.filterType === 'MANUFACTURER') {
            const cleaned = cleanAndValidateFilterItems(filter.filters || []);
            processedFilters.manufacturers = cleaned;
            console.log('Processed manufacturers:', cleaned.length, 'items');
          } else if (filter.filterType === 'INGREDIENTS') {
            const cleaned = cleanAndValidateFilterItems(filter.filters || []);
            processedFilters.ingredients = cleaned;
            console.log('Processed ingredients:', cleaned.length, 'items');
            console.log('Sample ingredients:', cleaned.slice(0, 10));
          }
        });
      } else {
        console.log('No data.filters found in response');
      }

      console.log('Final processed filters:', processedFilters);
      setAvailableFilters(processedFilters);
      console.log('=== FETCH FILTERS DEBUG END ===');
    } catch (error) {
      console.error('=== FETCH FILTERS ERROR ===');
      console.error('Error fetching filters:', error);
    }
  }, []);

  useEffect(() => {
    console.log('=== MAIN FETCH ITEMS DEBUG START ===');
    console.log('isLoggedIn changed to:', isLoggedIn);
    
    // Fetch items from the JSON server
    const fetchItems = async () => {
      setLoading(true);
      console.log('Fetching all items...');
      
      try {
        const response = await fetch('http://localhost:8084/items/all');
        console.log('Items response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched items count:', data.length);
        console.log('Sample items:', data.slice(0, 3));
        
        setItems(data);
        setFilteredItems(data);
        // Calculate total pages
        setTotalPages(Math.ceil(data.length / itemsPerPage));
        setError(null);

        // Fetch filters if user is logged in
        if (isLoggedIn) {
          console.log('User is logged in, fetching filters...');
          fetchFilters();
        } else {
          console.log('User not logged in, skipping filter fetch');
        }
      } catch (error) {
        console.error('=== FETCH ITEMS ERROR ===');
        console.error('Error fetching items:', error);
        setError('Failed to load items. Please try again later.');
      } finally {
        setLoading(false);
        console.log('=== MAIN FETCH ITEMS DEBUG END ===');
      }
    };

    fetchItems();
  }, [isLoggedIn, fetchFilters]);

  // Enhanced Search function with better authentication handling
  const handleSearch = async () => {
    setHasSearched(true);
    console.log('=== SEARCH DEBUG START ===');
    console.log('Search term:', searchTerm);
    console.log('Selected filters:', selectedFilters);
    console.log('Is logged in:', isLoggedIn);

    // Check if there are any active filters
    const hasAnyFilters =
      selectedFilters.brands.length > 0 ||
      selectedFilters.categories.length > 0 ||
      selectedFilters.manufacturers.length > 0 ||
      selectedFilters.ingredients.length > 0;

    console.log('Has any filters:', hasAnyFilters);

    // If search term is empty and no filters are selected, show all items
    if (!searchTerm.trim() && !hasAnyFilters) {
      console.log('No search term or filters, showing all items');
      setFilteredItems(items);
      setTotalPages(Math.ceil(items.length / itemsPerPage));
      setPage(1);
      console.log('Set filtered items to all items:', items.length);
      return;
    }

    setLoading(true);
    console.log('Starting API search...');

    try {
      let url;
      let queryParams = new URLSearchParams();

      // IMPORTANT: Always include searchTerm parameter, even if empty
      queryParams.append('searchTerm', searchTerm.trim() || "");

      // Check token validity before making request
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      if (token) {
        console.log('Token preview:', token.substring(0, 20) + '...');
        // Decode JWT to check expiration (basic check)
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          console.log('Token exp:', tokenPayload.exp, 'Current time:', currentTime, 'Expired:', tokenPayload.exp < currentTime);
          
          if (tokenPayload.exp < currentTime) {
            console.warn('Token is expired, switching to guest mode');
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            setSnackbarMessage('Session expired. Searching as guest.');
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
          }
        } catch (e) {
          console.warn('Could not decode token:', e);
        }
      }

      // Re-check login status after token validation
      const currentToken = localStorage.getItem('token');
      const isCurrentlyLoggedIn = !!currentToken && isLoggedIn;

      // If user is logged in, use the advanced search endpoint with filters
      if (isCurrentlyLoggedIn) {
        url = 'http://localhost:8084/items/search';
        console.log('Using logged-in search endpoint');

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
        console.log('Using guest search endpoint (user not logged in or token invalid)');
      }

      // Add query params to URL
      const fullUrl = `${url}?${queryParams.toString()}`;
      console.log('Full search URL:', fullUrl);

      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      // If logged in, add authorization header
      if (isCurrentlyLoggedIn && currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
        console.log('Added authorization header');
      }

      console.log('Request headers:', headers);

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: headers,
        credentials: 'include' // Include cookies
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        
        // Special handling for authentication errors
        if (response.status === 401 || response.status === 403) {
          console.error('Authentication error - token might be expired or invalid');
          
          // Clear token and retry as guest
          localStorage.removeItem('token');
          setIsLoggedIn(false);
          setSnackbarMessage('Session expired. Retrying as guest...');
          setSnackbarSeverity('warning');
          setSnackbarOpen(true);
          
          // Retry the search as guest user
          console.log('Retrying search as guest user...');
          const guestUrl = `http://localhost:8084/items/searchForGuest?searchTerm=${encodeURIComponent(searchTerm.trim() || "")}`;
          const guestResponse = await fetch(guestUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          if (guestResponse.ok) {
            const guestData = await guestResponse.json();
            console.log('Guest search successful:', guestData.length, 'items');
            setFilteredItems(guestData);
            setTotalPages(Math.ceil(guestData.length / itemsPerPage));
            setPage(1);
            setLoading(false);
            console.log('=== SEARCH DEBUG END (recovered as guest) ===');
            return;
          } else {
            throw new Error(`Guest search also failed with status: ${guestResponse.status}`);
          }
        }
        
        throw new Error(`Server responded with status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Search results received:', data.length, 'items');
      console.log('First few items:', data.slice(0, 3));

      setFilteredItems(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      setPage(1); // Reset to first page

      console.log('Updated state - filteredItems length:', data.length);
      console.log('Updated state - totalPages:', Math.ceil(data.length / itemsPerPage));

    } catch (error) {
      console.error('=== SEARCH ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      setError(`Failed to search items: ${error.message}`);
      setSnackbarMessage('Search failed. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setFilteredItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
      console.log('=== SEARCH DEBUG END ===');
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

  // Reset filters - FIXED: Explicitly reset all states
  const handleResetFilters = () => {
    console.log('Resetting all filters');
    setSelectedFilters({
      brands: [],
      categories: [],
      manufacturers: [],
      ingredients: []
    });
    
    // IMPORTANT: Force all filters to collapsed state
    setExpandedFilters({
      brands: false,
      categories: false,
      manufacturers: false,
      ingredients: false
    });
    
    setShowMoreFilters({
      brands: false,
      categories: false,
      manufacturers: false,
      ingredients: false
    });

    // Reset show more counts
    setShowMoreCount({
      brands: 0,
      categories: 0,
      manufacturers: 0,
      ingredients: 0
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

  // Render filter section with two-level expand/collapse functionality
  const renderFilterSection = (title, filterType, items) => {
    const isExpanded = expandedFilters[filterType];
    const showMore = showMoreFilters[filterType];
    const cleanedItems = cleanAndValidateFilterItems(items || []);
    const itemsToDisplay = getItemsToDisplay(filterType, cleanedItems);
    const shouldShowMore = shouldShowMoreButton(filterType, cleanedItems);

    return (
      <Box key={filterType} sx={{ mb: 2 }}>
        {/* Filter Category Header - Always Visible */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 1,
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)'
          }
        }}
        onClick={() => toggleFilterExpansion(filterType)}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {title} ({cleanedItems.length})
          </Typography>
          <IconButton
            size="small"
            sx={{ color: 'primary.main' }}
          >
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 1 }} />
        
        {/* Collapsible Filter Options */}
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ maxHeight: '200px', overflow: 'auto', mb: 1 }}>
            <FormGroup>
              {itemsToDisplay.map((item, index) => (
                <FormControlLabel
                  key={`${item}-${index}`}
                  control={
                    <Checkbox
                      checked={selectedFilters[filterType].includes(item)}
                      onChange={() => handleFilterChange(filterType, item)}
                      size="small"
                    />
                  }
                  label={<Typography variant="body2">{item}</Typography>}
                />
              ))}
            </FormGroup>
          </Box>

          {/* Show More/Less Button */}
          {shouldShowMore && (
            <Box sx={{ textAlign: 'center', mt: 1, mb: 2 }}>
              <Button
                size="small"
                variant="text"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering parent collapse
                  toggleShowMore(filterType);
                }}
                endIcon={showMore ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ 
                  fontSize: '0.75rem',
                  color: 'primary.main',
                  textTransform: 'none'
                }}
              >
                {getShowMoreButtonText(filterType, cleanedItems)}
              </Button>
            </Box>
          )}
        </Collapse>
      </Box>
    );
  };

  // FIXED: Add effect to ensure filters are reset when drawer opens
  useEffect(() => {
    if (openFilters) {
      // Ensure all filters start collapsed when drawer opens
      setExpandedFilters({
        brands: false,
        categories: false,
        manufacturers: false,
        ingredients: false
      });
      setShowMoreFilters({
        brands: false,
        categories: false,
        manufacturers: false,
        ingredients: false
      });
      setShowMoreCount({
        brands: 0,
        categories: 0,
        manufacturers: 0,
        ingredients: 0
      });
    }
  }, [openFilters]);

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
          width: 350, // Increased width for better spacing
          boxSizing: 'border-box',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        },
      }}
    >
      <Box sx={{ padding: 2 }}>
        <Typography variant="h6" component="div" sx={{ mb: 2, fontWeight: 'bold' }}>
          Filters
        </Typography>

        <Button
          variant="outlined"
          sx={{ mb: 3 }}
          size="small"
          onClick={handleResetFilters}
          fullWidth
        >
          Reset All Filters
        </Button>

        {/* Render each filter section with two-level expand/collapse */}
        {renderFilterSection('Brands', 'brands', availableFilters.brands)}
        {renderFilterSection('Categories', 'categories', availableFilters.categories)}
        {renderFilterSection('Manufacturers', 'manufacturers', availableFilters.manufacturers)}
        {renderFilterSection('Ingredients', 'ingredients', availableFilters.ingredients)}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleApplyFilters}
            fullWidth
            size="large"
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