import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import NotificationPanel from "../components/NotificationPanel";
import "./ResidentDashboard.css";

function ResidentDashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [complaints, setComplaints] = useState([]);

  const loadComplaints = async () => {
    try {
      const res = await api.get("/complaints/my");
      setComplaints(res.data);
    } catch (error) {
      alert("Failed to load complaints");
      console.error(error);
    }
  };

  useEffect(() => {
    loadComplaints();

    const interval = setInterval(() => {
      loadComplaints();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/complaints", { title, description, priority });
      setTitle("");
      setDescription("");
      setPriority("Medium");
      loadComplaints();
    } catch (error) {
      alert("Failed to create complaint");
      console.error(error);
    }
  };

  const handleConfirm = async (id, isFixed) => {
    try {
      await api.post(`/complaints/${id}/confirm`, {
        isFixed,
        note: isFixed ? "Problem solved" : "Still not fixed"
      });
      loadComplaints();
    } catch (error) {
      alert("Confirmation failed");
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
    <DashboardLayout role="Resident">
      <div className="dashboard-content">
        <div className="top-section" id="notifications">
          <div className="welcome-banner card">
            <div>
              <h3>How can we help you today?</h3>
              <p>Submit a new maintenance request or track your existing complaints.</p>
            </div>
            <div className="banner-icon">🛠️</div>
          </div>

          <NotificationPanel />
        </div>

        <div className="dashboard-section">
          <div className="card form-card">
            <h3 className="section-title">Create New Complaint</h3>

            <form onSubmit={handleCreate} className="complaint-form">
              <div className="form-row">
                <div className="form-group flex-2">
                  <label>Title</label>
                  <input
                    required
                    placeholder="E.g., Leaking pipe in bathroom"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="form-group flex-1">
                  <label>Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  required
                  placeholder="Provide details about the issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="dashboard-section" id="complaints">
          <h3 className="section-title">My Complaints</h3>

          {complaints.length === 0 ? (
            <div className="empty-state card">
              <span className="empty-icon">📂</span>
              <p>No complaints found.</p>
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

                  <div className="card-footer">
                    <span className="priority-label">
                      <span className={`priority-dot ${(c.priority || "medium").toLowerCase()}`}></span>
                      {c.priority || "Medium"}
                    </span>

                    {c.status === "USER_CONFIRM_PENDING" && (
                      <div className="action-buttons">
                        <button className="btn-success" onClick={() => handleConfirm(c.id, true)}>
                          Fixed
                        </button>
                        <button className="btn-danger" onClick={() => handleConfirm(c.id, false)}>
                          Not Fixed
                        </button>
                      </div>
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

export default ResidentDashboard;