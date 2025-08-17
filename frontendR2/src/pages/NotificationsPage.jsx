import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./NotificationsPage.css";
import { Button, Checkbox } from "antd";
import { getSocket} from "../utils/socket";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching notifications", err);
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
     const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?._id;
    // Initialisation de la connexion socket
   const socket = getSocket(token, userId);

    // Gestion des nouvelles notifications en temps réel
    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    // Gestion des mises à jour de notifications
    const handleNotificationUpdate = (data) => {
      switch (data.action) {
        case "mark_as_read":
          setNotifications((prev) =>
            prev.map((n) =>
              n._id === data.notificationId ? { ...n, read: true } : n
            )
          );
          break;
        case "delete":
          setNotifications((prev) =>
            prev.filter((n) => n._id !== data.notificationId)
          );
          setSelectedNotifications((prev) =>
            prev.filter((id) => id !== data.notificationId)
          );
          break;
        case "delete_multiple":
          setNotifications((prev) =>
            prev.filter((n) => !data.notificationIds.includes(n._id))
          );
          setSelectedNotifications((prev) =>
            prev.filter((id) => !data.notificationIds.includes(id))
          );
          break;
        default:
          break;
      }
    };

    socket.on("new_notification", handleNewNotification);
    socket.on("notification_updated", handleNotificationUpdate);

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.off("notification_updated", handleNotificationUpdate);
    };
  }, [token, fetchNotifications]);

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await axios.delete(`http://localhost:5001/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setSelectedNotifications((prev) =>
        prev.filter((selectedId) => selectedId !== id)
      );
    } catch (err) {
      console.error("Error deleting notification", err);
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedNotifications.length === 0) return;

    try {
      await axios.delete(
        "http://localhost:5001/api/notifications/delete/delete-multiple",
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { notificationIds: selectedNotifications },
        }
      );

      setNotifications((prev) =>
        prev.filter((n) => !selectedNotifications.includes(n._id))
      );
      setSelectedNotifications([]);
      setSelectAll(false);
    } catch (err) {
      console.error("Error deleting multiple notifications", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5001/api/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(
        "http://localhost:5001/api/notifications/read-all",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Error marking all notifications as read", err);
    }
  };

  const toggleSelectNotification = (id) => {
    setSelectedNotifications((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map((n) => n._id));
    }
    setSelectAll(!selectAll);
  };

  if (loading) {
    return <div className="notifications-loading">Chargement...</div>;
  }

  return (
    <div
      className="notifications-container"
      style={{
        maxHeight: "100vh",
        overflowY: "auto",
      }}
    >
      <div className="notifications-header">
        <h1>Notifications</h1>
        <div className="notification-actions">
          {notifications.some((n) => !n.read) && (
            <Button
              onClick={markAllAsRead}
              type="link"
              className="mark-all-read"
            >
              Marquer tout comme lu
            </Button>
          )}
          {selectedNotifications.length > 0 && (
            <Button
              danger
              onClick={handleDeleteMultiple}
              className="delete-selected-btn"
            >
              Supprimer les sélectionnées ({selectedNotifications.length})
            </Button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="no-notifications">Vous n'avez aucune notification</div>
      ) : (
        <div className="notifications-list">
          <div className="select-all-container">
            <Checkbox
              checked={selectAll}
              onChange={toggleSelectAll}
              className="select-all-checkbox"
            >
              Tout sélectionner
            </Checkbox>
          </div>

          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${
                !notification.read ? "unread" : ""
              }`}
              onClick={() => markAsRead(notification._id)}
            >
              <Checkbox
                checked={selectedNotifications.includes(notification._id)}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleSelectNotification(notification._id);
                }}
                className="notification-checkbox"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="notification-content">
                <div className="notification-message">
                  {notification.message}
                </div>
                <div className="notification-time">
                  {new Date(notification.createdAt).toLocaleString()}
                </div>
              </div>
              <Button
                type="link"
                danger
                onClick={(e) => handleDelete(notification._id, e)}
                className="delete-notification-btn"
              >
                Supprimer
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
