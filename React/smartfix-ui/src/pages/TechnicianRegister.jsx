import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";
import apartmentImg from "../assets/apartment.jpg";
import logo from "../assets/logo.png";

function TechnicianRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [departmentId, setDepartmentId] = useState("1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        role: "Technician",
        roomNo: null,
        departmentId: parseInt(departmentId),
        phoneNumber
      });

      alert(res.data.message || res.data.Message || "OTP sent to email");
      navigate("/verify-otp", { state: { email } });
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.Message ||
        "Registration failed";

      const demoOtp =
        error?.response?.data?.demoOtp ||
        error?.response?.data?.DemoOtp;

      if (demoOtp) {
        alert(`${msg}\nDemo OTP: ${demoOtp}`);
        navigate("/verify-otp", { state: { email } });
      } else {
        alert(msg);
      }

      console.error(error);
    }
  };

  return (
    <div className="login-page">
      <div className="centered-card animate-slide-up stagger-1">
        <div className="centered-logo">
          <img src={logo} alt="SmartFix Logo" />
        </div>

        <div className="form-shell">
          <h2 className="login-title" style={{ textAlign: 'center' }}>Register <span>Technician</span></h2>
          <p className="login-subtitle" style={{ textAlign: 'center' }}>Become a part of our expert maintenance team</p>
          
          <form onSubmit={handleRegister} className="register-grid">
            
            <div className="input-block">
              <label className="input-label">Full Name</label>
              <div className="input-group">
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <span className="input-underline"></span>
              </div>
            </div>

            <div className="input-block">
              <label className="input-label">Email Address</label>
              <div className="input-group">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <span className="input-underline"></span>
              </div>
            </div>

            <div className="input-block">
              <label className="input-label">Password</label>
              <div className="input-group">
                <input
                  type="password"
                  required
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span className="input-underline"></span>
              </div>
            </div>

            <div className="input-block">
              <label className="input-label">Specialization / Department</label>
              <div className="input-group">
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  style={{ width: "100%", border: "none", outline: "none", background: "transparent", cursor: 'pointer' }}
                >
                  <option value="1">Electrician</option>
                  <option value="2">Plumber</option>
                  <option value="3">Carpenter</option>
                  <option value="4">Water</option>
                  <option value="5">General</option>
                </select>
                <span className="input-underline"></span>
              </div>
            </div>

            <div className="input-block">
              <label className="input-label">Phone Number</label>
              <div className="input-group">
                <input
                  type="tel"
                  required
                  placeholder="+91 XXXXX XXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <span className="input-underline"></span>
              </div>
            </div>

            <button type="submit" className="login-btn">
              Register as Tech
            </button>
          </form>

          <p className="back-link" onClick={() => navigate("/")} style={{ textAlign: 'center', marginTop: '1.5rem', cursor: 'pointer', color: 'var(--primary-color)' }}>
            Already registered? <strong>Sign In</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default TechnicianRegister;
