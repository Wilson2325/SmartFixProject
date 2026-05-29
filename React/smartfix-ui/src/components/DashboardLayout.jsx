import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import "./DashboardLayout.css";
import logo from "../assets/logo.png";
import SettingsModal from "./SettingsModal";
import NotificationDropdown from "./NotificationDropdown";

function DashboardLayout({ children, role }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("profile");
  const [notifications, setNotifications] = useState([]);

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { name: "User" };

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
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isNotificationsOpen) {
      loadNotifications();
    }
  }, [isNotificationsOpen]);

  const hasUnread =
    Array.isArray(notifications) && notifications.some((n) => n && !n.isRead);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const openSettings = (tab) => {
    setSettingsTab(tab);
    setIsSettingsModalOpen(true);
    setIsSettingsOpen(false);
  };

  const handleNavClick = (sectionId) => {
    if (location.pathname !== `/${role.toLowerCase()}`) {
      navigate(`/${role.toLowerCase()}`);
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      if (sectionId === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={logo} alt="SmartFix Logo" className="sidebar-logo-img" />
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            <li>
              <button
                className={`nav-link ${location.pathname === `/${role.toLowerCase()}` ? "active" : ""}`}
                onClick={() => handleNavClick("top")}
              >
                <span className="nav-icon">📊</span>
                Dashboard
              </button>
            </li>
            <li>
              <button className="nav-link" onClick={() => handleNavClick("complaints")}>
                <span className="nav-icon">📋</span>
                Complaints
              </button>
            </li>
          </ul>

          <div className="sidebar-footer">
            <button className="nav-link logout-btn" onClick={handleLogout}>
              <span className="nav-icon">🚪</span>
              Logout
            </button>
          </div>
        </nav>
      </aside>

      <div className="main-layout">
        <header className="top-navbar">
          <div className="nav-left">
            <h2 className="page-title">{role} Dashboard</h2>
          </div>

          <div className="nav-right">
            <div className="settings-container" style={{ position: "relative" }}>
              <button
                className={`icon-btn notification-toggle-btn ${isNotificationsOpen ? "active" : ""}`}
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsSettingsOpen(false);
                }}
                title="Notifications"
              >
                <span className="icon">🔔</span>
                {hasUnread && <span className="notification-dot"></span>}
              </button>

              <NotificationDropdown
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                role={role}
              />
            </div>

            <div className="settings-container" style={{ position: "relative" }}>
              <button
                className={`icon-btn ${isSettingsOpen ? "active" : ""}`}
                onClick={() => {
                  setIsSettingsOpen(!isSettingsOpen);
                  setIsNotificationsOpen(false);
                }}
                title="Settings"
              >
                <span className="icon">⚙️</span>
              </button>

              {isSettingsOpen && (
                <div className="settings-dropdown">
                  <div className="dropdown-header">
                    <h4>System Settings</h4>
                  </div>

                  <ul className="dropdown-list">
                    <li>
                      <button className="dropdown-item" onClick={() => openSettings("profile")}>
                        <div className="dropdown-icon-wrapper">👤</div>
                        Account Profile
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={() => openSettings("appearance")}>
                        <div className="dropdown-icon-wrapper">🎨</div>
                        Appearance
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={() => openSettings("security")}>
                        <div className="dropdown-icon-wrapper">🔒</div>
                        Security & Privacy
                      </button>
                    </li>

                    <li className="dropdown-divider"></li>

                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <div className="dropdown-icon-wrapper">🚪</div>
                        Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="user-profile">
              <div className="profile-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{role}</span>
              </div>
              <div className="profile-circle">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            </div>
          </div>
        </header>

        <main className="main-content" id="top">
          {children}
        </main>
      </div>

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        initialTab={settingsTab}
      />
    </div>
  );
}

export default DashboardLayout;