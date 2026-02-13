import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await notificationAPI.getNotifications(1); // Replace with actual user ID
      setNotifications(response.data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
    setLoading(false);
  };

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      loadNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  if (loading) return <div className="loading">Loading notifications...</div>;

  return (
    <div className="container">
      <h1 className="page-title">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="card">
          <p>No notifications</p>
        </div>
      ) : (
        <div>
          {notifications.map((notif) => (
            <div key={notif.id} className="card" style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h4>{notif.title}</h4>
                  <p>{notif.message}</p>
                  <small style={{ color: '#999' }}>
                    {new Date(notif.createdAt).toLocaleString()}
                  </small>
                </div>
                {!notif.read && (
                  <button 
                    onClick={() => markAsRead(notif.id)} 
                    className="btn btn-primary"
                    style={{ fontSize: '12px', padding: '5px 10px' }}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
