import React, { useState, useEffect, useCallback } from 'react';
import { Badge, Popover, List, Avatar, Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import axios from 'axios';
import { getSocket } from '../../utils/socket';
import { useNavigate } from 'react-router-dom';
import './NotificationBell.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5001/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.read).length);
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
     const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?._id;
    setUserRole(role);

    // Initialisation des notifications
    fetchNotifications();

    // Configuration de la connexion socket
   const socket = getSocket(token, userId);

    // Gestionnaire pour les nouvelles notifications
    const handleNewNotification = (notification) => {
      if (!notification.roles || notification.roles.includes(role)) {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    };

    // Gestionnaire pour les mises à jour de notifications
    // const handleNotificationUpdate = (data) => {
    //   switch (data.action) {
    //     case 'mark_as_read':
    //       setNotifications(prev => 
    //         prev.map(n => n._id === data.notificationId ? { ...n, read: true } : n)
    //       );
    //       setUnreadCount(prev => Math.max(0, prev - 1));
    //       break;
          
    //     case 'mark_all_read':
    //       setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    //       setUnreadCount(0);
    //       break;
          
    //     case 'delete':
    //       setNotifications(prev => prev.filter(n => n._id !== data.notificationId));
    //       setUnreadCount(prev => {
    //         const deletedNotification = notifications.find(n => n._id === data.notificationId);
    //         return deletedNotification && !deletedNotification.read ? Math.max(0, prev - 1) : prev;
    //       });
    //       break;
          
    //     case 'delete_multiple':
    //       setNotifications(prev => prev.filter(n => !data.notificationIds.includes(n._id)));
    //       setUnreadCount(prev => {
    //         const deletedUnreadCount = notifications
    //           .filter(n => data.notificationIds.includes(n._id) && !n.read)
    //           .length;
    //         return Math.max(0, prev - deletedUnreadCount);
    //       });
    //       break;
          
    //     default:
    //       break;
    //   }
    // };



    // Gestionnaire pour les mises à jour de notifications
const handleNotificationUpdate = (data) => {
  switch (data.action) {
    case 'mark_as_read':
      setNotifications(prev =>
        prev.map(n => n._id === data.notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      break;

    case 'mark_all_read':
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      break;

    case 'delete':
      setNotifications(prev => {
        const deletedNotification = prev.find(n => n._id === data.notificationId);
        const isUnread = deletedNotification && !deletedNotification.read;
        if (isUnread) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        return prev.filter(n => n._id !== data.notificationId);
      });
      break;

    case 'delete_multiple':
      setNotifications(prev => {
        const deletedUnreadCount = prev.filter(
          n => data.notificationIds.includes(n._id) && !n.read
        ).length;
        if (deletedUnreadCount > 0) {
          setUnreadCount(count => Math.max(0, count - deletedUnreadCount));
        }
        return prev.filter(n => !data.notificationIds.includes(n._id));
      });
      break;

    default:
      break;
  }
};


    // // Rejoindre la room utilisateur
    // if (userId) {
    //   socket.emit('joinUserRoom', userId);
    // }

    // Écoute des événements
    socket.on('new_notification', handleNewNotification);
    socket.on('notification_updated', handleNotificationUpdate);

    // Nettoyage
    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('notification_updated', handleNotificationUpdate);
    };
  }, [userRole, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await axios.patch(`http://localhost:5001/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch('http://localhost:5001/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleViewAll = () => {
    setVisible(false);
    navigate(`/${userRole}/notifications`);
  };

  const filteredNotifications = notifications.filter(notification => 
    !notification.roles || notification.roles.includes(userRole)
  );

  return (
    <div className="notification-icon-wrapper">
      <Popover
        content={
          <div className="notification-popover">
            <div className="notification-header">
              <strong>Notifications</strong>
              {unreadCount > 0 && (
                <Button 
                  type="link" 
                  size="small" 
                  onClick={markAllAsRead}
                  className="mark-all-btn"
                >
                  Marquer tout comme lu
                </Button>
              )}
            </div>
            <List
              className="notification-list"
              itemLayout="horizontal"
              dataSource={filteredNotifications.slice(0, 5)}
              renderItem={item => (
                <List.Item 
                  onClick={() => markAsRead(item._id)}
                  className={`notification-item ${!item.read ? 'unread' : ''}`}
                >
                  <List.Item.Meta
                    avatar={<Avatar src="/bell-icon.png" />}
                    title={<div className="notification-message">{item.message}</div>}
                    description={
                      <div className="notification-time">
                        {new Date(item.createdAt).toLocaleString()}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            <div className="notification-footer">
              <Button 
                type="link" 
                onClick={handleViewAll}
                className="view-all-btn"
              >
                Voir toutes les notifications
              </Button>
            </div>
          </div>
        }
        trigger="click"
        open={visible}
        onOpenChange={setVisible}
        placement="bottomRight"
        overlayClassName="notification-popover-container"
      >
        <Badge 
          count={unreadCount} 
          className="notification-badge"
          overflowCount={9}
        >
          <BellOutlined className="bell-icon-nav" />
        </Badge>
      </Popover>
    </div>
  );
};

export default NotificationBell;