import React, { useState, useEffect, useContext } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  IconButton, 
  Menu,
  MenuItem,
  Avatar,
  Divider,
  CircularProgress,
  Badge
} from '@mui/material';
import { 
  Link, 
  useNavigate, 
  useLocation 
} from 'react-router-dom';
import { 
  Person, 
  AccountCircle,
  Favorite as FavoriteIcon,
  ExitToApp as LogoutIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

// Helper function to extract userId from JWT token
const getUserIdFromToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    return payload.userId || payload.id || payload.sub;
  } catch (error) {
    console.error("Error extracting user ID from token:", error);
    return null;
  }
};

const Header = () => {
  // Use context directly instead of props
  const { isLoggedIn, logout } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for user dropdown menu
  const [anchorEl, setAnchorEl] = useState(null);
  
  const open = Boolean(anchorEl);
  
  // Fetch user data from backend when component mounts or isLoggedIn changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoggedIn) {
        setUserData(null);
        return;
      }
      
      setLoading(true);
      try {
        // Get the auth token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No auth token found');
          return;
        }
        const userName = localStorage.getItem('userName');

        setUserData({ username: userName });
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [isLoggedIn]);
  
  // Fetch favorites when logged in
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isLoggedIn) {
        setFavorites([]);
        return;
      }
      
      setFavoritesLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No auth token found');
          return;
        }

        // Extract userId from token
        const userId = getUserIdFromToken(token);
        if (!userId) {
          console.error('Could not extract user ID from token');
          return;
        }
        
        // Use the correct endpoint with proper URL formatting
        const response = await fetch(`http://localhost:8083/favorite/user/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching favorites: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Raw favorites data:', JSON.stringify(data, null, 2));
        
        // Ensure proper normalization based on actual field names
        const normalizedFavorites = Array.isArray(data) ? data.map(item => ({
          favoriteId: item.favoriteId,
          id: item.itemId || item.id, 
          productId: item.itemId || item.id,
          itemId: item.itemId || item.id,
          name: item.itemName || item.name,
          brand: item.brand,
          manufacturer: item.manufacturer
        })) : [];
        
        console.log('Normalized favorites:', normalizedFavorites);
        setFavorites(normalizedFavorites);
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
        setFavorites([]);
      } finally {
        setFavoritesLoading(false);
      }
    };
    
    fetchFavorites();
  }, [isLoggedIn, location.pathname]); // Re-fetch when route changes
  
  // User menu handlers
  const handleUserMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Favorites direct navigation handler
  const handleFavoritesClick = (event) => {
    event.preventDefault(); // Prevent default action
    // Navigate directly to favorites page
    navigate('/favorites');
  };
  
  const handleLogout = () => {
    handleUserMenuClose();
    logout(); // This now just calls the context's logout function
    navigate('/'); // Ensure navigation happens after logout
  };
  
  const handleNavigate = (path) => {
    handleUserMenuClose();
    navigate(path);
  };

  // Handle logo click - Reset search state and navigate home
  const handleLogoClick = (e) => {
    e.preventDefault(); // Prevent the default Link behavior
    
    // Reset the search state
    if (location.pathname === '/') {
      // If we're already on home page, reload to clear search state
      window.location.href = '/';
    } else {
      // Otherwise just navigate to home
      navigate('/');
    }
  };

  // Display name logic
  const displayName = userData?.username || 
                     userData?.name || 
                     (userData?.email ? userData.email.split('@')[0] : 'Guest');

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backgroundColor: '#69359C', // Updated to specified purple color
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)' // Subtle shadow for depth
      }}
    >
      <Toolbar>
        {/* Left side: Logo and App Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          {/* Modified to use onClick handler instead of just Link */}
          <Box 
            component="a" 
            href="/" 
            onClick={handleLogoClick}
            sx={{
              textDecoration: 'none', 
              color: 'inherit', 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <img
              src={'/logo.png'}
              alt="Culinary Mart"
              style={{ width: '50px', height: 'auto', marginRight: '10px' }}
            />
            <Typography variant="h6" component="div" style={{ fontWeight: 'bold' }}>
              Culinary Mart
            </Typography>
          </Box>
        </Box>
        
        {/* Right side: Login/Signup or User Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isLoggedIn ? (
            <>
              {/* Favorites Icon with Badge - Direct navigation to favorites page */}
              <IconButton 
                color="inherit" 
                onClick={handleFavoritesClick}
                sx={{ mr: 1 }}
                aria-label="favorites"
              >
                <Badge 
                  badgeContent={favoritesLoading ? '...' : favorites.length} 
                  color="error"
                  max={99}
                >
                  <FavoriteIcon />
                </Badge>
              </IconButton>
              
              {/* User menu */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                onClick={handleUserMenuClick}
                aria-controls={open ? "user-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <>
                    {userData?.profileImage ? (
                      <Avatar 
                        src={userData.profileImage} 
                        alt={displayName}
                        sx={{ width: 32, height: 32 }}
                      />
                    ) : (
                      <AccountCircle sx={{ fontSize: 32 }} />
                    )}
                    <Typography variant="body1" sx={{ ml: 1, fontWeight: 'medium' }}>
                      {displayName}
                    </Typography>
                    <ExpandMoreIcon sx={{ ml: 0.5 }} />
                  </>
                )}
              </Box>
              
              {/* User dropdown menu */}
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleUserMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'user-button',
                }}
              >
                <MenuItem onClick={() => handleNavigate('/profile')}>
                  <Box display="flex" alignItems="center">
                    <AccountCircle sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="body2">Profile</Typography>
                      {userData?.email && (
                        <Typography variant="caption" color="text.secondary">
                          {userData.email}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </MenuItem>
                
                <MenuItem onClick={() => handleNavigate('/favorites')}>
                  <FavoriteIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">My Favorites</Typography>
                </MenuItem>
                
                <Divider />
                
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">Logout</Typography>
                </MenuItem>
              </Menu>
            </>
          ) : (
            /* Login/Signup Button with Icon */
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                <Person />
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  LOGIN / SIGN UP
                </Typography>
              </Box>
            </Link>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;