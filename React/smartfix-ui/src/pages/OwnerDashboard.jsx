import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import NotificationPanel from "../components/NotificationPanel";
import "./OwnerDashboard.css";

function OwnerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [residents, setResidents] = useState([]);
  const [activeTab, setActiveTab] = useState("employees");
  const [loadingComplaints, setLoadingComplaints] = useState(true);

  const loadComplaints = async () => {
    try {
      setLoadingComplaints(true);
      const res = await api.get("/complaints/escalated");
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to load escalated complaints", error);
      setComplaints([]);
    } finally {
      setLoadingComplaints(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get("/users");

      const techs = res.data.filter(
        (u) => u.role && u.role.toLowerCase() === "technician"
      );

      const resis = res.data.filter(
        (u) => u.role && u.role.toLowerCase() === "resident"
      );

      setEmployees(techs);
      setResidents(resis);
    } catch (error) {
      console.error("Failed to load users", error);
      setEmployees([]);
      setResidents([]);
    }
  };

  useEffect(() => {
    loadComplaints();
    loadUsers();

    const interval = setInterval(() => {
      loadComplaints();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout role="Owner">
      <div className="dashboard-content">
        <div className="top-section" id="notifications">
          <div className="welcome-banner card owner-banner">
            <div>
              <h3>Owner Dashboard Overview</h3>
              <p>Monitor escalated complaints and system notifications.</p>
            </div>
            <div className="banner-icon">🏢</div>
          </div>

          <NotificationPanel />
        </div>

        <div className="stats-section">
          <div className="stat-card card blue-glow">
            <div className="stat-icon">👔</div>
            <div className="stat-info">
              <h4>Total Technicians</h4>
              <span className="stat-value">{employees.length}</span>
            </div>
          </div>

          <div className="stat-card card green-glow">
            <div className="stat-icon">🧑‍🤝‍🧑</div>
            <div className="stat-info">
              <h4>Total Residents</h4>
              <span className="stat-value">{residents.length}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-section card details-card" id="details">
          <div className="details-header flex justify-between align-center border-bottom pb-3 mb-4">
            <h3 className="section-title mb-0 border-0 pb-0">Property Roster</h3>

            <div className="details-tabs toggle-group">
              <button
                className={`toggle-btn ${activeTab === "employees" ? "active" : ""}`}
                onClick={() => setActiveTab("employees")}
              >
                Technicians
              </button>
              <button
                className={`toggle-btn ${activeTab === "residents" ? "active" : ""}`}
                onClick={() => setActiveTab("residents")}
              >
                Residents
              </button>
            </div>
          </div>

          <div className="details-content">
            {activeTab === "employees" && (
              <div className="table-responsive">
                <table className="roster-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">
                          No technicians found.
                        </td>
                      </tr>
                    ) : (
                      employees.map((emp) => (
                        <tr key={emp.id}>
                          <td><strong>{emp.name}</strong></td>
                          <td>{emp.email}</td>
                          <td><span className="badge badge-blue">{emp.role}</span></td>
                          <td>{emp.phoneNumber || "N/A"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "residents" && (
              <div className="table-responsive">
                <table className="roster-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Room No</th>
                      <th>Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {residents.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">
                          No residents found.
                        </td>
                      </tr>
                    ) : (
                      residents.map((res) => (
                        <tr key={res.id}>
                          <td><strong>{res.name}</strong></td>
                          <td>{res.email}</td>
                          <td><span className="room-badge">{res.roomNo || "Unassigned"}</span></td>
                          <td>{res.phoneNumber || "N/A"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-section" id="complaints">
          <h3 className="section-title">Escalated Complaints</h3>

          {loadingComplaints ? (
            <div className="empty-state card">
              <p>Loading escalated complaints...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="empty-state card">
              <span className="empty-icon">✅</span>
              <p>No escalated complaints found.</p>
            </div>
          ) : (
            <div className="owner-complaints-grid">
              {complaints.map((c) => (
                <div key={c.id} className="owner-complaint-card">
                  <div className="owner-complaint-header">
                    <span className="owner-complaint-id">#{c.id}</span>
                    <span className="badge badge-red">{c.status || "ESCALATED"}</span>
                  </div>

                  <h4 className="owner-complaint-title">{c.title}</h4>
                  <p className="owner-complaint-desc">{c.description}</p>

                  <div className="owner-complaint-details">
                    <div><strong>Resident:</strong> {c.residentName || "N/A"}</div>
                    <div><strong>Room:</strong> {c.roomNo || "N/A"}</div>
                    <div><strong>Department:</strong> {c.department || "N/A"}</div>
                    <div><strong>Priority:</strong> {c.priority || "High"}</div>
                    <div><strong>Technician:</strong> {c.technicianName || "Not Assigned"}</div>
                    <div><strong>Tech Email:</strong> {c.technicianEmail || "N/A"}</div>
                    <div><strong>Tech Phone:</strong> {c.technicianPhone || "N/A"}</div>
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

export default OwnerDashboard;