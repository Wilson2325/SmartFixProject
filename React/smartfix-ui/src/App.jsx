import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ResidentRegister from "./pages/ResidentRegister";
import TechnicianRegister from "./pages/TechnicianRegister";
import OwnerRegister from "./pages/OwnerRegister";
import OtpVerify from "./pages/OtpVerify";
import ForgotPassword from "./pages/ForgotPassword";
import ResidentDashboard from "./pages/ResidentDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register/resident" element={<ResidentRegister />} />
        <Route path="/register/technician" element={<TechnicianRegister />} />
        <Route path="/register/owner" element={<OwnerRegister />} />
        <Route path="/verify-otp" element={<OtpVerify />} />

        <Route
          path="/resident"
          element={
            <ProtectedRoute allowedRole="Resident">
              <ResidentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/technician"
          element={
            <ProtectedRoute allowedRole="Technician">
              <TechnicianDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRole="Owner">
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;