import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";
import apartmentImg from "../assets/apartment.jpg";
import logo from "../assets/logo.png";

function ResidentRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        role: "Resident",
        roomNo,
        departmentId: null,
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
          <h2 className="login-title" style={{ textAlign: 'center' }}>Register <span>Resident</span></h2>
          <p className="login-subtitle" style={{ textAlign: 'center' }}>Create your personal resident account</p>
          
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
              <label className="input-label">Room Number</label>
              <div className="input-group">
                <input
                  type="text"
                  required
                  placeholder="e.g., A-101"
                  value={roomNo}
                  onChange={(e) => setRoomNo(e.target.value)}
                />
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
              Create Account
            </button>
          </form>

          <p className="back-link" onClick={() => navigate("/")} style={{ textAlign: 'center', marginTop: '1.5rem', cursor: 'pointer', color: 'var(--primary-color)' }}>
            Already have an account? <strong>Sign In</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResidentRegister;
