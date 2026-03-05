import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function EmployeeLayout() {
  const links = [
    { to: "dashboard", label: "Dashboard" },
    { to: "checkin", label: "Check In/Out" },
    { to: "payslips", label: "Payslips" },
    { to: "leave", label: "Apply Leave" },
    {  to: "my-leaves", label: "My Leaves"}
  ];

  return (
    <div className="flex">
      <Sidebar links={links} />
      <div className="ml-64 flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}