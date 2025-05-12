import React, { useState, useEffect, useContext } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  IconButton, 
  TextField, 
  InputAdornment,
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
  Search, 
  Person, 
  AccountCircle,
  Favorite as FavoriteIcon,
  ExitToApp as LogoutIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  // Use context directly instead of props
  const { isLoggedIn, logout } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for user dropdown menu
  const [anchorEl, setAnchorEl] = useState(null);
  // State for favorites menu
  const [favAnchorEl, setFavAnchorEl] = useState(null);
  
  const open = Boolean(anchorEl);
  const favOpen = Boolean(favAnchorEl);
  
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
        
        const response = await fetch('http://localhost:8083/favorite/list', {
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
        console.log('Fetched favorites:', data);
        setFavorites(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
        setFavorites([]);
      } finally {
        setFavoritesLoading(false);
      }
    };
    
    fetchFavorites();
  }, [isLoggedIn, location.pathname]); // Re-fetch when route changes
  
  // Get current location (path) to check if we're on login/register page
  const isLoginOrRegisterPage = location.pathname === '/login' || location.pathname === '/register';
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleSearch();
    }
  };

  // User menu handlers
  const handleUserMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Favorites menu handlers
  const handleFavoritesClick = (event) => {
    event.preventDefault(); // Prevent immediate navigation
    
    if (favorites.length > 0) {
      setFavAnchorEl(event.currentTarget);
    } else {
      // If no favorites, just navigate to favorites page
      navigate('/favorites');
    }
  };
  
  const handleFavoritesClose = () => {
    setFavAnchorEl(null);
  };
  
  const handleFavoriteItemClick = (favorite) => {
    handleFavoritesClose();
    // Navigate to the product detail page for the selected favorite
    navigate(`/product/${favorite.productId || favorite.id}`);
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

  // Display name logic
  const displayName = userData?.username || 
                     userData?.name || 
                     (userData?.email ? userData.email.split('@')[0] : 'Guest');

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backgroundColor: '#69359C', // Deep purple with a blue undertone.
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)' // Subtle shadow for depth
      }}
    >
      <Toolbar>
        {/* Left side: Logo and App Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
            <img
              src={'/logo.png'}
              alt="Culinary Mart"
              style={{ width: '50px', height: 'auto', marginRight: '10px' }}
            />
            <Typography variant="h6" component="div" style={{ fontWeight: 'bold' }}>
              Culinary Mart
            </Typography>
          </Link>
        </Box>
        
        {/* Center: Search Bar - Only visible if not on login/register page */}
        {!isLoginOrRegisterPage && (
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 5, justifyContent: 'center' }}>
            <TextField
              variant="outlined"
              placeholder="Search"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch} edge="end">
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: 'white',
                borderRadius: '20px',
                width: '50%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                  paddingRight: '8px',
                  '& fieldset': {
                    border: 'none',
                  },
                },
                '& input': {
                  color: 'black',
                }
              }}
            />
          </Box>
        )}
        
        {/* Right side: Login/Signup or User Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isLoggedIn ? (
            <>
              {/* Favorites Icon with Badge for logged-in users */}
              <IconButton 
                color="inherit" 
                onClick={handleFavoritesClick}
                sx={{ mr: 1 }}
                aria-label="favorites"
                aria-controls={favOpen ? "favorites-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={favOpen ? "true" : undefined}
              >
                <Badge 
                  badgeContent={favoritesLoading ? '...' : favorites.length} 
                  color="error"
                  max={99}
                >
                  <FavoriteIcon />
                </Badge>
              </IconButton>
              
              {/* Favorites dropdown menu */}
              <Menu
                id="favorites-menu"
                anchorEl={favAnchorEl}
                open={favOpen}
                onClose={handleFavoritesClose}
                MenuListProps={{
                  'aria-labelledby': 'favorites-button',
                }}
                PaperProps={{
                  style: {
                    maxHeight: 300,
                    width: '300px',
                  },
                }}
              >
                <Box p={1}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    My Favorites ({favorites.length})
                  </Typography>
                </Box>
                <Divider />
                
                {favoritesLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : favorites.length > 0 ? (
                  <>
                    {favorites.slice(0, 5).map((favorite) => (
                      <MenuItem 
                        key={favorite.id || favorite.productId} 
                        onClick={() => handleFavoriteItemClick(favorite)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          {favorite.image && (
                            <img 
                              src={favorite.image} 
                              alt={favorite.name || favorite.title || 'Product'} 
                              style={{ width: 40, height: 40, marginRight: 10, objectFit: 'contain' }}
                            />
                          )}
                          <Typography variant="body2" noWrap sx={{ flexGrow: 1 }}>
                            {favorite.name || favorite.title || 'Product Item'}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                    
                    {favorites.length > 5 && (
                      <Box p={1} textAlign="center">
                        <Typography 
                          variant="body2" 
                          color="primary" 
                          onClick={() => {
                            handleFavoritesClose();
                            navigate('/favorites');
                          }}
                          sx={{ cursor: 'pointer' }}
                        >
                          View all {favorites.length} favorites
                        </Typography>
                      </Box>
                    )}
                  </>
                ) : (
                  <Box p={2} textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                      You haven't added any favorites yet.
                    </Typography>
                  </Box>
                )}
                
                <Divider />
                <MenuItem onClick={() => {
                  handleFavoritesClose();
                  navigate('/favorites');
                }}>
                  <Typography variant="body2" color="primary" fontWeight="medium">
                    Manage All Favorites
                  </Typography>
                </MenuItem>
              </Menu>
              
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