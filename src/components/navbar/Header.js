import React, { useState, useEffect } from 'react';
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
  CircularProgress
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

const Header = ({ isLoggedIn, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
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
  
  const handleLogout = () => {
    handleUserMenuClose();
    if (onLogout) {
      onLogout();
    }
    navigate('/');
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
    <AppBar position="sticky">
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
              {/* Favorites Link for logged-in users */}
              <IconButton 
                color="inherit" 
                component={Link} 
                to="/favorites"
                sx={{ mr: 1 }}
                aria-label="favorites"
              >
                <FavoriteIcon />
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