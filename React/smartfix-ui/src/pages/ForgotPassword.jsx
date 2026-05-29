import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";
import logo from "../assets/logo.png";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/forgot-password", { email });
      alert(res.data.message || "Password reset OTP sent");
      setStep(2);
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to send OTP";
      const demoOtp = error?.response?.data?.demoOtp;

      if (demoOtp) {
        alert(`${msg}\nDemo OTP: ${demoOtp}`);
        setStep(2);
      } else {
        alert(msg);
      }

      console.error(error);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/reset-password", {
        email,
        otpCode,
        newPassword
      });

      alert(res.data.message || "Password reset successful");
      navigate("/");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to reset password");
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
            Forgot <span>Password</span>
          </h2>

          <p className="login-subtitle" style={{ textAlign: "center" }}>
            {step === 1
              ? "Enter your email to receive reset OTP"
              : "Enter OTP and your new password"}
          </p>

          {step === 1 ? (
            <form onSubmit={sendOtp} className="register-grid">
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

              <button type="submit" className="login-btn">
                Send Reset OTP
              </button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="register-grid">
              <div className="input-block">
                <label className="input-label">Email Address</label>
                <div className="input-group">
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="read-only-input"
                  />
                  <span className="input-underline"></span>
                </div>
              </div>

              <div className="input-block">
                <label className="input-label">OTP Code</label>
                <div className="input-group">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                  />
                  <span className="input-underline"></span>
                </div>
              </div>

              <div className="input-block">
                <label className="input-label">New Password</label>
                <div className="input-group">
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <span className="input-underline"></span>
                </div>
              </div>

              <button type="submit" className="login-btn">
                Reset Password
              </button>
            </form>
          )}

          <p
            className="back-link"
            onClick={() => navigate("/")}
            style={{ textAlign: "center", marginTop: "1.5rem" }}
          >
            Back to Login
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;