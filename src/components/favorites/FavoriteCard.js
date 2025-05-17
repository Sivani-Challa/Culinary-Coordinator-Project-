import React from 'react';
import { Card, CardContent, CardActions, Typography, IconButton, Tooltip } from '@mui/material';
import { Visibility, Delete } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const FavoriteCard = ({ item, onRemoveFromFavorites }) => {
  // Handle case where the item structure might vary
  const productId = item.id;
  const name = item.name || item.itemname || 'Unknown Product';
  const brand = item.brand || item.manufacturer || '';
  const favoriteId = item.favoriteId || item.id;

  return (
    <Card 
      elevation={1} 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative'
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 0 }}>
        {/* Product Name with text wrapping */}
        <Typography 
          variant="h6" 
          component="h2" 
          sx={{ 
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.2,
            height: '2.4em'
          }}
        >
          {name}
        </Typography>
        
        {/* Brand */}
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            mb: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {brand}
        </Typography>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', p: 1 }}>
        <Tooltip title="View Product">
          <IconButton 
            component={Link} 
            to={`/products/${productId}`} 
            size="small" 
            color="primary"
          >
            <Visibility />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Remove from Favorites">
          <IconButton 
            onClick={() => onRemoveFromFavorites(favoriteId)} 
            size="small" 
            color="error"
          >
            <Delete />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default FavoriteCard;