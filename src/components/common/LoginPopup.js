import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
  Box
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LoginPopup = ({ open, onClose, onLogin, showLoginButton }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  // If not open, don't render the component at all
  if (!open) return null;
  
  const handleLogin = () => {
    // Close the popup first
    onClose(); // Close the popup
    
    // Redirect to login page if no onLogin function is provided
    navigate('/login');
  };

  return (
    <Dialog
      open={true} // Always true when component renders (we return null if open is false)
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="xs"
      fullWidth
      aria-labelledby="login-required-dialog-title"
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle id="login-required-dialog-title" sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="div">
            Login Required
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
      </DialogTitle>
      
      <DialogContent dividers>
        <Typography variant="body1" sx={{ py: 1 }}>
          Please login to add to favorites.
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        {showLoginButton ? (
          <>
            <Button
              onClick={onClose}
              color="inherit"
              variant="outlined"
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogin}
              color="primary"
              variant="contained"
              disableElevation
            >
              Login
            </Button>
          </>
        ) : (
          <Button
            onClick={onClose}
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
