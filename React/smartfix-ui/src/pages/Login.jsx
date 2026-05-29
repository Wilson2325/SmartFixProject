import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";
import apartmentImg from "../assets/apartment.jpg";
import logo from "../assets/logo.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ownerExists, setOwnerExists] = useState(true);
  const navigate = useNavigate();

  const loadOwnerStatus = async () => {
    try {
      const res = await api.get("/auth/check-owner");
      setOwnerExists(res.data.exists);
    } catch (error) {
      console.error("Failed to check owner status", error);
      setOwnerExists(true);
    }
  };

  useEffect(() => {
    loadOwnerStatus();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const role = res.data.user.role;

      if (role === "Resident") navigate("/resident");
      else if (role === "Technician") navigate("/technician");
      else if (role === "Owner") navigate("/owner");
      else alert("Unknown role");
    } catch (error) {
      alert(error?.response?.data?.message || "Login failed");
      console.error(error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div
          className="login-left"
          style={{ backgroundImage: `url(${apartmentImg})` }}
        >
          <div className="top-logo">
            <img src={logo} alt="SmartFix Logo" />
          </div>

          <div className="left-content-wrapper">
            <div className="brand-block">
              <h1 className="brand-heading">Streamline Your Apartment Maintenance</h1>
              <p className="brand-subtext">
                Report issues, track repairs, and manage your property seamlessly.
                SmartFix is your all-in-one solution for stress-free living.
              </p>
            </div>
          </div>

          <div className="login-left-footer">
            <span>© 2026 SmartFix</span>
          </div>
        </div>

        <div className="login-right">
          <div className="form-shell">
            <h2 className="login-title">Welcome Back to SmartFix!</h2>
            <p className="login-subtitle">Sign in to your account</p>

            <form onSubmit={handleLogin} className="register-grid">
              <div className="input-block">
                <label className="input-label">Your Email</label>
                <div className="input-group">
                  <input
                    type="email"
                    required
                    placeholder="info.smartfix@gmail.com"
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
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="input-icon-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                  <span className="input-underline"></span>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-label">
                  <input type="checkbox" />
                  <span>Remember Me</span>
                </label>

                <span
                  className="forgot-link"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </span>
              </div>

              <button type="submit" className="login-btn">
                Login
              </button>
            </form>

            <div className="divider">Instant Register</div>

            <div className="oauth-group" style={{ flexWrap: "wrap" }}>
              {!ownerExists && (
                <button
                  type="button"
                  className="oauth-btn"
                  onClick={() => navigate("/register/owner")}
                >
                  👑 Register Owner
                </button>
              )}

              <button
                type="button"
                className="oauth-btn"
                onClick={() => navigate("/register/technician")}
              >
                🔧 Sign up Tech
              </button>

              <button
                type="button"
                className="oauth-btn"
                onClick={() => navigate("/register/resident")}
              >
                🏠 Sign up Resident
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;