import React, { useEffect, useState } from 'react';
import { Grid, Container } from '@mui/material';
import ItemCard from './components/items/ItemCard ';  // Import ItemCard component
import { getItems } from '../api/itemService';  // API service to fetch items

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const itemsData = await getItems();  // Fetch items from the API
      setItems(itemsData);
    };
    fetchItems();
  }, []);

  // Handle adding item to favorites
  const handleAddToFavorites = (item) => {
    setFavorites((prevFavorites) => [...prevFavorites, item]);
  };

  return (
    <Container>
      <h2>Items List</h2>
      <Grid container spacing={3}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <ItemCard item={item} onAddToFavorites={handleAddToFavorites} />
          </Grid>
        ))}
      </Grid>

      <h3>Favorites</h3>
      <ul>
        {favorites.map((favorite, index) => (
          <li key={index}>{favorite.itemName}</li>
        ))}
      </ul>
    </Container>
  );
};

export default ItemList;
