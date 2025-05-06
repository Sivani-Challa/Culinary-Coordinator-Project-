import React from 'react';
import { Card, CardContent, Typography, IconButton } from '@mui/material';
import { Favorite } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const ItemCard = ({ item, onAddToFavorites }) => {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardContent>
        <Typography variant="h6" component="div">
          {item.productName} {/* Display full product name */}
        </Typography>
        <Typography color="textSecondary">
          {item.brand} - {item.category}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {item.description}
        </Typography>

        {/* Add to Favorites Button */}
        <IconButton onClick={() => onAddToFavorites(item)} color="primary">
          <Favorite />
        </IconButton>

        {/* Link to product detail page */}
        <Link to={`/product/${item.id}`}>
          <IconButton color="primary">
            {/* Replace with your product logo/icon */}
            <img src="/assets/view-product-logo.png" alt="View Product" style={{ width: '30px', height: 'auto' }} />
          </IconButton>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ItemCard;
