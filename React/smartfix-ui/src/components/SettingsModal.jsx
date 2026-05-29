import { useState } from 'react';
import './SettingsModal.css';

function SettingsModal({ isOpen, onClose, initialTab = 'profile' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : { name: "User", email: "user@example.com" };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <h3>System Settings</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-modal-content">
          <div className="settings-tabs">
            <button 
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="icon">👤</span> Account Profile
            </button>
            <button 
              className={`tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              <span className="icon">🎨</span> Appearance
            </button>
            <button 
              className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <span className="icon">🔒</span> Security & Privacy
            </button>
          </div>

          <div className="settings-tab-content">
            {activeTab === 'profile' && (
              <div className="tab-pane">
                <h4>Account Profile</h4>
                <div className="settings-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" defaultValue={user.name} className="form-control" />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" defaultValue={user.email} className="form-control" disabled />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" placeholder="+91 XXXX XXX XXX" className="form-control" />
                  </div>
                  <button className="btn-primary" style={{ marginTop: '1rem', alignSelf: 'flex-start' }}>
                    Save Changes
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'appearance' && (
              <div className="tab-pane">
                <h4>Appearance</h4>
                <div className="theme-grid">
                  <div className="theme-option">
                    <div className="theme-preview" style={{ background: '#0f172a' }}></div>
                    <span>Dark Mode</span>
                  </div>
                  <div className="theme-option active">
                    <div className="theme-preview" style={{ background: '#f8fafc' }}></div>
                    <span>Light Mode</span>
                  </div>
                  <div className="theme-option">
                    <div className="theme-preview" style={{ background: 'linear-gradient(135deg, #0f172a 50%, #f8fafc 50%)' }}></div>
                    <span>System Sync</span>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'security' && (
              <div className="tab-pane">
                <h4>Security & Privacy</h4>
                <div className="security-list">
                  <div className="security-item">
                    <div className="security-info">
                      <h5>Change Password</h5>
                      <p>Update your login password regularly to stay secure.</p>
                    </div>
                    <button className="btn-update">Update</button>
                  </div>
                  <div className="security-item">
                    <div className="security-info">
                      <h5>Two-Factor Authentication</h5>
                      <p>Add an extra layer of security to your account.</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
