import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const today = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empRes = await api.get("/employees");
        const attRes = await api.get("/attendance");
        const leaveRes = await api.get("/leaves");

        setEmployees(empRes.data);
        setAttendance(attRes.data);
        setLeaves(leaveRes.data);
      } catch (err) {
        console.error("Failed to load employees", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const calculateStats = (empId) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthRecords = attendance.filter((record) => {
      const recordDate = new Date(record.date);
      return (
        record.employeeId === empId &&
        record.logout &&
        recordDate.getMonth() === currentMonth &&
        recordDate.getFullYear() === currentYear
      );
    });

    const loginDays = monthRecords.length;

    let totalMinutes = 0;

    monthRecords.forEach((record) => {
      const [lh, lm] = record.login.split(":").map(Number);
      const [oh, om] = record.logout.split(":").map(Number);

      const worked = (oh * 60 + om) - (lh * 60 + lm);
      totalMinutes += worked;
    });

    const avgMinutes =
      loginDays > 0 ? Math.floor(totalMinutes / loginDays) : 0;

    const firstDayOfWeek = new Date();
    firstDayOfWeek.setDate(now.getDate() - now.getDay());

    const weeklyRecords = attendance.filter((record) => {
      const recordDate = new Date(record.date);
      return (
        record.employeeId === empId &&
        record.logout &&
        recordDate >= firstDayOfWeek
      );
    });

    let weeklyMinutes = 0;

    weeklyRecords.forEach((record) => {
      const [lh, lm] = record.login.split(":").map(Number);
      const [oh, om] = record.logout.split(":").map(Number);

      weeklyMinutes += (oh * 60 + om) - (lh * 60 + lm);
    });

    return {
      loginDays,
      avgHours: formatTime(avgMinutes),
      weeklyTotal: formatTime(weeklyMinutes)
    };
  };

  const getEmployeeStatus = (empId) => {
    const todayDate = new Date(today);

    const onLeave = leaves.find((leave) => {
      if (leave.status !== "Approved") return false;

      const from = new Date(leave.startDate);
      const to = new Date(leave.endDate);

      return (
        leave.employeeId === empId &&
        todayDate >= from &&
        todayDate <= to
      );
    });

    if (onLeave) return "On Leave";

    const present = attendance.find(
      (record) =>
        record.employeeId === empId &&
        record.date === today &&
        record.login
    );

    if (present) return "Active";

    return "Inactive";
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = search.toLowerCase();

    return (
      emp.name.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q) ||
      emp.phone.includes(q)
    );
  });

  if (loading) {
    return <div className="p-6">Loading employees...</div>;
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">

        <div>
          <h2 className="text-2xl font-semibold">Employees</h2>

          <p className="text-gray-500 text-sm">
            Showing {filteredEmployees.length} of {employees.length} employees
          </p>
        </div>

        <input
          type="text"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg p-2 w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

      </div>

      {/* Employees Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">

        {filteredEmployees.length === 0 && (
          <p className="text-gray-500">
            No employees found
          </p>
        )}

        {filteredEmployees.map((emp) => {
          const status = getEmployeeStatus(emp.id);
          const stats = calculateStats(emp.id);

          return (
            <div
              key={emp.id}
              className="bg-white border rounded-xl p-5 text-center hover:shadow-lg transition relative group"
            >

              <img
                src={`https://ui-avatars.com/api/?background=0D8ABC&color=fff&size=128&name=${encodeURIComponent(emp.name)}`}
                alt={emp.name}
                className="w-20 h-20 rounded-full mx-auto border"
              />

              <h3 className="font-semibold mt-3">
                {emp.name}
              </h3>

              <span
                className={`text-xs px-2 py-1 rounded-full mt-1 inline-block
                ${
                  status === "Active"
                    ? "bg-green-100 text-green-600"
                    : status === "On Leave"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {status}
              </span>

              <div className="absolute opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition bg-white border shadow-xl p-4 rounded-xl top-full left-1/2 -translate-x-1/2 w-64 z-20 mt-3 text-left text-sm">

                <p><strong>Email:</strong> {emp.email}</p>
                <p><strong>Phone:</strong> {emp.phone}</p>
                <p><strong>Address:</strong> {emp.address}</p>

                <hr className="my-2" />

                <p><strong>Login Days:</strong> {stats.loginDays}</p>
                <p><strong>Avg Login Hours:</strong> {stats.avgHours}</p>
                <p><strong>Weekly Total:</strong> {stats.weeklyTotal}</p>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}