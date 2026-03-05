import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AdminLayout() {
  const links = [
    { to: "dashboard", label: "Dashboard" },
    { to: "employees", label: "Employees" },
    { to: "leave-apps", label: "Leave Applications" },
    { to: "payslips", label: "Generate Payslips" },
    { to: "manage-payslips", label: "Manage Payslips" },
    { to: "holidays", label: "Manage Holidays" },
    { to: "register", label: "Register Employee" }
  ];

  return (
    <div className="flex">
      <Sidebar links={links} />
      <div className="ml-64 flex-1 p-6 bg-gray-100 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}