import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCartItems([]); return; }
    setCartLoading(true);
    try {
      const { data } = await api.get('/cart');
      setCartItems(data);
    } catch (err) {
      setCartItems([]);
      // Don't trigger global 401 redirect for cart fetch — silently clear
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Let AuthContext handle re-auth naturally on next action
      }
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    await api.post('/cart', { productId, quantity });
    await fetchCart();
  };

  const updateCartItem = async (id, quantity) => {
    await api.put(`/cart/${id}`, { quantity });
    await fetchCart();
  };

  const removeFromCart = async (id) => {
    await api.delete(`/cart/${id}`);
    await fetchCart();
  };

  const clearCartState = () => setCartItems([]);

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + (i.discountPrice ?? i.price) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, cartLoading, cartCount, cartTotal, addToCart, updateCartItem, removeFromCart, fetchCart, clearCartState }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
