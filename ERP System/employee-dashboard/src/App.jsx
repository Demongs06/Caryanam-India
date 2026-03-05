import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

import EmployeeLayout from "./layouts/EmployeeLayout";
import AdminLayout from "./layouts/AdminLayout";

// Employee Pages
import EmployeeDashboard from "./pages/employee/Dashboard";
import CheckInOut from "./pages/employee/CheckInOut";
import Payslips from "./pages/employee/Payslips";
import ApplyLeave from "./pages/employee/ApplyLeave";
import MyLeaves from "./pages/employee/MyLeaves";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import Employees from "./pages/admin/Employees";
import LeaveApplications from "./pages/admin/LeaveApplications";
import GeneratePayslip from "./pages/admin/GeneratePayslip";
import ManagePayslips from "./pages/admin/ManagePayslips";
import Holidays from "./pages/admin/Holidays";
import RegisterEmployee from "./pages/admin/RegisterEmployee";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Root → Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* ================= EMPLOYEE ROUTES ================= */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRole="employee">
              <EmployeeLayout />
            </ProtectedRoute>
          }
        >
          {/* Auto redirect /employee → /employee/dashboard */}
          <Route index element={<Navigate to="dashboard" />} />

          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="checkin" element={<CheckInOut />} />
          <Route path="payslips" element={<Payslips />} />
          <Route path="leave" element={<ApplyLeave />} />
          <Route path="my-leaves" element={<MyLeaves />} />
        </Route>

        {/* ================= ADMIN ROUTES ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Auto redirect /admin → /admin/dashboard */}
          <Route index element={<Navigate to="dashboard" />} />

          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="leave-apps" element={<LeaveApplications />} />
          <Route path="payslips" element={<GeneratePayslip />} />
          <Route path="manage-payslips" element={<ManagePayslips />} />
          <Route path="holidays" element={<Holidays />} />
          <Route path="register" element={<RegisterEmployee />} />
        </Route>

        {/* Catch All → Login */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;