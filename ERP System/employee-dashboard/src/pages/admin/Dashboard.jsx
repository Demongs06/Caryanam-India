import { useEffect, useState } from "react";
import api from "../../api/axios";
import Card from "../../components/Card";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const loggedUser = JSON.parse(localStorage.getItem("user"));
        setAdmin(loggedUser);

        const empRes = await api.get("/employees");
        const attRes = await api.get("/attendance");
        const leaveRes = await api.get("/leaves");

        const employees = empRes.data;
        const attendance = attRes.data;
        const leaves = leaveRes.data;

        const today = new Date().toISOString().split("T")[0];
        const todayDate = new Date(today);

        const totalEmployees = employees.length;

        const presentToday = attendance.filter(
          (record) => record.date === today && record.login
        ).length;

        const onLeaveToday = leaves.filter((leave) => {
          if (leave.status !== "Approved") return false;

          const from = new Date(leave.startDate);
          const to = new Date(leave.endDate);

          return todayDate >= from && todayDate <= to;
        }).length;

        const absentToday =
          totalEmployees - presentToday - onLeaveToday;

        setData({
          totalEmployees,
          present: presentToday,
          absent: absentToday < 0 ? 0 : absentToday,
          onLeave: onLeaveToday
        });
      } catch (err) {
        console.error("Failed to load admin data", err);
      }
    };

    fetchData();
  }, []);

  if (!data)
    return (
      <div className="text-center text-gray-500">
        Loading dashboard...
      </div>
    );

  return (
    <div className="space-y-6 bg-gray-100 p-6 h-full">

      {/* Welcome Section */}
      {admin && (
        <div className="bg-white p-5 rounded-xl shadow flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Welcome, {admin.name}
            </h2>

            <p className="text-gray-500 text-sm">
              Admin Dashboard
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500">
              Logged in as
            </p>

            <p className="font-medium text-gray-700">
              {admin.email}
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        <Card
  title="Total Employees"
  value={data.totalEmployees}
  color="bg-blue-100 text-blue-600"
  icon={
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M16 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M8 21v-2a4 4 0 0 1 3-3.87"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  }
/>

<Card
  title="Present Today"
  value={data.present}
  color="bg-green-100 text-green-600"
  icon={
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  }
/>

<Card
  title="Absent Today"
  value={data.absent}
  color="bg-red-100 text-red-600"
  icon={
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  }
/>

<Card
  title="On Leave Today"
  value={data.onLeave}
  color="bg-yellow-100 text-yellow-600"
  icon={
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
    </svg>
  }
/>

      </div>
    </div>
  );
}