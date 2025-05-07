import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
  TextField,
  Alert
} from '@mui/material';
//import { Close as CloseIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPopup = ({ open, onClose, onLogin, showLoginButton }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  // Add state for username/email and password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);

  // If not open, don't render the component at all
  //if (!open) return null;
  
  const redirectToLogin = () => {
    // Close the popup first
    if(onClose)  onClose(); // Close the popup
    
    // Redirect to login page
    navigate('/login');
  };
  
  const handleQuickLogin = async (e) => {
    if (e) e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Make login request
      const response = await fetch('http://localhost:8082/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      
      const data = await response.json();
      
      // Update AuthContext (this is the key part)
      login(data.user || { username: data.username || email.split('@')[0] }, data.token);
      
      // Call the onLogin callback
      if (onLogin) {
        onLogin();
      }
      
      // Close the popup
      if(onClose) onClose();
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={Boolean(open)}
      onClose={onClose || (() => {})}
      fullScreen={fullScreen}
      maxWidth="xs"
      fullWidth
      aria-labelledby="login-required-dialog-title"
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      {/* <DialogTitle id="login-required-dialog-title" sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div">
            {showLoginForm ? 'Quick Login' : 'Login Required'}
          </Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle> */}
      
      <DialogContent dividers>
        {showLoginForm ? (
          <form onSubmit={handleQuickLogin}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </form>
        ) : (
          <Typography variant="body1" sx={{ py: 1 }}>
            Please login to add to favorites.
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        {showLoginForm ? (
          <>
            <Button
              onClick={() => setShowLoginForm(false)}
              color="inherit"
              variant="text"
              disabled={loading}
            >
              Cancel
            </Button>
            {/* <Button
              onClick={handleQuickLogin}
              color="primary"
              variant="contained"
              disableElevation
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button> */}
          </>
        ) : showLoginButton ? (
          <>
            <Button
              onClick={onClose || (() => {})}
              color="inherit"
              variant="outlined"
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            {/* <Button
              onClick={() => setShowLoginForm(true)}
              color="primary"
              variant="contained"
              disableElevation
              sx={{ mr: 1 }}
            >
              Quick Login
            </Button> */}
            <Button
              onClick={redirectToLogin}
              color="secondary"
              variant="contained"
              disableElevation
            >
              Login
            </Button>
          </>
        ) : (
          <Button
            onClick={onClose || (() => {})}
            color="primary"
            variant="contained"
            fullWidth
            disableElevation
          >
            OK
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default LoginPopup;