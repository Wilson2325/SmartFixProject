import { useEffect, useState } from "react";
import api from "../services/api";
import "./NotificationPanel.css";

function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load notifications", error);
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      loadNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post("/notifications/read-all");
      loadNotifications();
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="card notifications-card">
      <div className="notifications-header">
        <h3 className="section-title">
          <span className="icon">🔔</span> Notifications
        </h3>

        {unreadCount > 0 && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span className="badge badge-red">{unreadCount} New</span>
            <button
              className="btn-primary"
              onClick={markAllAsRead}
              style={{ padding: "6px 12px", fontSize: "12px" }}
            >
              Mark All Read
            </button>
          </div>
        )}
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-notifications">
            <span className="empty-icon-sm">📭</span>
            <p>You're all caught up!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`notification-item ${n.isRead ? "read" : "unread"}`}>
              <div className="notification-content">
                <p className="notification-message">{n.message}</p>
                <small className="notification-time">
                  {new Date(n.createdAt || n.CreatedAt).toLocaleString()}
                </small>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="btn-mark-read"
                  title="Mark as Read"
                >
                  ✓
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationPanel;