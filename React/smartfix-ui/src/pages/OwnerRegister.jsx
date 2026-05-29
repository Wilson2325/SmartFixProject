import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";
import logo from "../assets/logo.png";

function OwnerRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        role: "Owner",
        roomNo: null,
        departmentId: null,
        phoneNumber
      });

      alert(res.data.message || "OTP sent to email");
      navigate("/verify-otp", { state: { email } });
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Registration failed";

      const demoOtp = error?.response?.data?.demoOtp;

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
      <div className="centered-card">
        <div className="centered-logo">
          <img src={logo} alt="SmartFix Logo" />
        </div>

        <div className="form-shell">
          <h2 className="login-title" style={{ textAlign: "center" }}>
            Register <span>Owner</span>
          </h2>

          <p className="login-subtitle" style={{ textAlign: "center" }}>
            Only one owner account is allowed in SmartFix
          </p>

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
                  placeholder="owner@example.com"
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
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span className="input-underline"></span>
              </div>
            </div>

            <div className="input-block">
              <label className="input-label">Phone Number</label>
              <div className="input-group">
                <input
                  type="text"
                  required
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <span className="input-underline"></span>
              </div>
            </div>

            <button type="submit" className="login-btn">
              Register Owner
            </button>
          </form>

          <p
            className="back-link"
            onClick={() => navigate("/")}
            style={{ textAlign: "center", marginTop: "1.5rem", cursor: "pointer", color: "var(--primary-color)" }}
          >
            Back to Login
          </p>
        </div>
      </div>
    </div>
  );
}

export default OwnerRegister;