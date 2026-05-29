import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./NotificationDropdown.css";

function NotificationDropdown({ isOpen, onClose, role }) {
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (!event.target.closest(".notification-toggle-btn")) {
          onClose();
        }
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const loadNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(Array.isArray(res.data) ? res.data.slice(0, 5) : []);
    } catch (error) {
      console.error("Failed to load notifications", error);
      setNotifications([
        {
          id: 1,
          message: "System maintenance scheduled for tonight.",
          isRead: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          message: "New feature updates available.",
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    }
  };

  const markAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.post(`/notifications/${id}/read`);
      loadNotifications();
    } catch (error) {
      console.error("Failed to mark as read", error);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    }
  };

  const handleViewAll = () => {
    onClose();
    navigate(`/${role.toLowerCase()}`);
    setTimeout(() => {
      document.getElementById("notifications")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <div className="dropdown-header flex justify-between align-center">
        <h4>Notifications</h4>
        {unreadCount > 0 && <span className="badge badge-red">{unreadCount} New</span>}
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <span className="icon">📭</span>
            <p>No new notifications</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className={`notification-item ${!n.isRead ? "unread" : ""}`}>
              <div className="flex justify-between align-start">
                <p className="message">{n.message}</p>
                {!n.isRead && (
                  <button
                    className="mark-read-btn"
                    onClick={(e) => markAsRead(n.id, e)}
                    title="Mark as read"
                  >
                    ●
                  </button>
                )}
              </div>

              <small className="time">
                {new Date(n.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit"
                })}{" "}
                • {new Date(n.createdAt).toLocaleDateString()}
              </small>
            </div>
          ))
        )}
      </div>

      <div className="dropdown-footer">
        <button className="view-all-btn" onClick={handleViewAll}>
          View All Notifications
        </button>
      </div>
    </div>
  );
}

export default NotificationDropdown;