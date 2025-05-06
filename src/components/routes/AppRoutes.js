import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/home/Home';
import ProductDetail from './components/product/ProductDetail';  // Assuming you have this component
import Login from './components/auth/Login'; 
import RegisterPage from '../register/RegisterPage'; // Assuming you have this component
import ProfileEdit from './components/profileedit/ProfileEdit'; // Assuming you have this component

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="product/:id" element={<ProductDetail />} />  {/* Product detail page */}
    <Route path="login" element={<Login />} />
    <Route path="register" element={<RegisterPage />} />  {/* Register page */}
    <Route path="/profile" element={<ProfileEdit />} />
    

  </Routes>
);

export default AppRoutes;
