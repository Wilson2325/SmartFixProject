import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import NotificationPanel from "../components/NotificationPanel";
import "./TechnicianDashboard.css";

function TechnicianDashboard() {
  const [complaints, setComplaints] = useState([]);

  // ✅ NEW: Stats state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0
  });

  // ✅ Load complaints + calculate stats
  const loadComplaints = async () => {
    try {
      const res = await api.get("/complaints/my");
      const data = res.data;

      setComplaints(data);

      // ✅ Calculate stats
      const total = data.length;

      const pending = data.filter(
        (c) => c.status === "ASSIGNED" || c.status === "ESCALATED"
      ).length;

      const resolved = data.filter(
        (c) => c.status === "CLOSED"
      ).length;

      setStats({ total, pending, resolved });

    } catch (error) {
      alert("Failed to load complaints");
      console.error(error);
    }
  };

  useEffect(() => {
    loadComplaints();

    // You can keep this OR increase interval
    const interval = setInterval(() => {
      loadComplaints();
    }, 10000); // ✅ 10 sec better

    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (id) => {
    try {
      await api.post(`/complaints/${id}/resolve`);
      loadComplaints();
    } catch (error) {
      alert("Resolve failed");
      console.error(error);
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === "ASSIGNED") return "badge-orange";
    if (status === "USER_CONFIRM_PENDING") return "badge-blue";
    if (status === "CLOSED") return "badge-green";
    if (status === "ESCALATED") return "badge-red";
    return "";
  };

  return (
    <DashboardLayout role="Technician">
      <div className="dashboard-content">

        {/* 🔝 TOP SECTION */}
        <div className="top-section" id="notifications">
          <div className="welcome-banner card technician-banner">
            <div>
              <h3>Welcome back, Technician!</h3>
              <p>Check your assigned tasks and update their resolution status.</p>
            </div>
            <div className="banner-icon">🔧</div>
          </div>

          <NotificationPanel />
        </div>

        {/* ✅ NEW: STATS SECTION */}
        <div className="stats-grid">
          <div className="card stat-card">
            <h4>Total Complaints</h4>
            <p>{stats.total}</p>
          </div>

          <div className="card stat-card pending">
            <h4>Pending</h4>
            <p>{stats.pending}</p>
          </div>

          <div className="card stat-card resolved">
            <h4>Resolved</h4>
            <p>{stats.resolved}</p>
          </div>
        </div>

        {/* 📋 COMPLAINTS */}
        <div className="dashboard-section" id="complaints">
          <h3 className="section-title">Assigned Complaints</h3>

          {complaints.length === 0 ? (
            <div className="empty-state card">
              <span className="empty-icon">✅</span>
              <p>No complaints assigned. Great job!</p>
            </div>
          ) : (
            <div className="complaints-grid">
              {complaints.map((c) => (
                <div key={c.id} className="card complaint-card">

                  <div className="card-header">
                    <span className="complaint-id">
                      #{typeof c.id === "string" ? c.id.substring(0, 6) : c.id}
                    </span>

                    <span className={`badge ${getStatusBadgeClass(c.status)}`}>
                      {c.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <h4 className="complaint-title">{c.title}</h4>
                  <p className="complaint-desc">{c.description}</p>

                  <div className="complaint-details">
                    <div className="detail-item">
                      <strong>Resident:</strong> {c.residentName}
                    </div>
                    <div className="detail-item">
                      <strong>Room:</strong> {c.roomNo}
                    </div>
                    <div className="detail-item">
                      <strong>Dept:</strong> {c.department}
                    </div>
                    <div className="detail-item">
                      <strong>Priority:</strong> {c.priority || "Medium"}
                    </div>
                  </div>

                  <div className="card-footer">
                    <span className="priority-label">
                      <span className={`priority-dot ${(c.priority || "medium").toLowerCase()}`}></span>
                      {c.priority || "Medium"}
                    </span>

                    {c.status === "ASSIGNED" && (
                      <button
                        className="btn-primary"
                        onClick={() => handleResolve(c.id)}
                      >
                        Mark as Resolved
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}

export default TechnicianDashboard;