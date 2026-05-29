import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import "./Login.css";
import logo from "../assets/logo.png";

function OtpVerify() {
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await api.post("/auth/verify-otp", { email, otpCode });
      alert("Email OTP verified successfully");
      navigate("/");
    } catch (error) {
      alert(error?.response?.data?.message || "OTP verification failed");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await api.post("/auth/resend-otp", { email });
      alert(res.data.message || "OTP resent successfully");
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to resend OTP";
      const demoOtp = error?.response?.data?.demoOtp;

      if (demoOtp) {
        alert(`${msg}\nDemo OTP: ${demoOtp}`);
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
            Verify <span>Email OTP</span>
          </h2>

          <p className="login-subtitle" style={{ textAlign: "center" }}>
            Almost there! One last step
          </p>

          <form onSubmit={handleVerify} className="register-grid">
            <div className="input-block">
              <label className="input-label">Registered Email</label>
              <div className="input-group">
                <input type="email" value={email} readOnly className="read-only-input" />
                <span className="input-underline"></span>
              </div>
            </div>

            <div className="input-block">
              <label className="input-label">Enter 6-Digit OTP</label>
              <div className="input-group">
                <input
                  type="text"
                  required
                  placeholder="X X X X X X"
                  value={otpCode}
                  maxLength={6}
                  onChange={(e) => setOtpCode(e.target.value)}
                  style={{ letterSpacing: "0.5rem", fontWeight: "bold" }}
                />
                <span className="input-underline"></span>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Finish"}
            </button>
          </form>

          <p
            className="back-link"
            onClick={handleResend}
            style={{
              textAlign: "center",
              marginTop: "1.5rem",
              cursor: "pointer",
              color: "var(--primary-color)"
            }}
          >
            Didn't receive a code? <strong>Resend OTP</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default OtpVerify;