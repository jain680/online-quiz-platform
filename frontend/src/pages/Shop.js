import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Shop() {
  const { user, refreshUser } = useAuth();
  const [shopItems, setShopItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/shop').then(res => {
      setShopItems(res.data);
      setLoading(false);
    });
  }, []);

  const buyItem = async (itemId, category) => {
    setBuying(itemId);
    setMessage('');
    try {
      const res = await api.post('/shop/buy', { itemId, category });
      setMessage('✅ ' + res.data.message);
      refreshUser();
    } catch (error) {
      setMessage('❌ ' + (error.response?.data?.message || 'Purchase failed'));
    } finally {
      setBuying(null);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="container fade-in">
      <div className="card glow" style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px' }}>🛒 Power-Up Shop</h2>
        <div className="flex flex-center gap-20">
          <div className="stat-badge coins" style={{ fontSize: '18px', padding: '12px 24px' }}>
            <span>🪙</span>
            <span>{user.coins} Coins</span>
          </div>
          <div className="stat-badge gems" style={{ fontSize: '18px', padding: '12px 24px' }}>
            <span>💎</span>
            <span>{user.gems} Gems</span>
          </div>
        </div>
        {message && (
          <div style={{ marginTop: '20px', padding: '15px', background: 'var(--glass)', borderRadius: '12px' }}>
            {message}
          </div>
        )}
      </div>

      <h3 style={{ marginBottom: '20px' }}>⚡ Power-Ups</h3>
      <div className="grid grid-4 gap-20" style={{ marginBottom: '40px' }}>
        {shopItems.powerUps.map(item => (
          <div key={item.id} className="shop-item">
            <div className="icon">{item.icon}</div>
            <h4>{item.name}</h4>
            <p style={{ fontSize: '12px', opacity: 0.7, margin: '10px 0' }}>{item.description}</p>
            <div className="price">
              <span>{item.currency === 'coins' ? '🪙' : '💎'}</span>
              <span>{item.price}</span>
            </div>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              onClick={() => buyItem(item.id, 'powerUps')}
              disabled={buying === item.id || 
                (item.currency === 'coins' ? user.coins < item.price : user.gems < item.price)}
            >
              {buying === item.id ? 'Buying...' : 'Buy'}
            </button>
          </div>
        ))}
      </div>

      <h3 style={{ marginBottom: '20px' }}>🎁 Bundles</h3>
      <div className="grid grid-2 gap-20" style={{ marginBottom: '40px' }}>
        {shopItems.bundles.map(item => (
          <div key={item.id} className="shop-item glow-pink" style={{ padding: '30px' }}>
            <div className="icon" style={{ fontSize: '64px' }}>{item.icon}</div>
            <h3>{item.name}</h3>
            <p style={{ opacity: 0.8, margin: '15px 0' }}>{item.description}</p>
            <div className="price" style={{ fontSize: '24px' }}>
              <span>💎</span>
              <span>{item.price}</span>
            </div>
            <button 
              className="btn btn-gold" 
              style={{ width: '100%', marginTop: '15px' }}
              onClick={() => buyItem(item.id, 'bundles')}
              disabled={buying === item.id || user.gems < item.price}
            >
              {buying === item.id ? 'Buying...' : 'Buy Bundle'}
            </button>
          </div>
        ))}
      </div>

      <h3 style={{ marginBottom: '20px' }}>💰 Coin Packs</h3>
      <div className="grid grid-3 gap-20">
        {shopItems.coins.map(item => (
          <div key={item.id} className="shop-item">
            <div className="icon">{item.icon}</div>
            <h4>{item.name}</h4>
            <div className="price">
              <span>💎</span>
              <span>{item.price}</span>
            </div>
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%' }}
              onClick={() => buyItem(item.id, 'coins')}
              disabled={buying === item.id || user.gems < item.price}
            >
              {buying === item.id ? 'Buying...' : 'Buy'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Shop;
