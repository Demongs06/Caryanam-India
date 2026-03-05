import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import api from "../../api/axios";

export default function CheckInOut() {
  const [holidays, setHolidays] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  const formatDate = (date) => date.toLocaleDateString("en-CA");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hol = await api.get("/holidays");
        const att = await api.get("/attendance");
        const lev = await api.get("/leaves");

        setHolidays(hol.data);
        setAttendance(att.data);
        setLeaves(lev.data);
      } catch (err) {
        console.error("Failed to load data");
      }
    };

    fetchData();
  }, []);

  const isHoliday = (date) =>
    holidays.find((h) => h.date === formatDate(date));

  const isPresent = (date) =>
    attendance.find(
      (a) =>
        a.employeeId === user.id &&
        a.date === formatDate(date) &&
        a.login
    );

  const isLeave = (date) =>
    leaves.find((l) => {
      if (l.employeeId !== user.id) return false;
      if (l.status !== "Approved") return false;

      const d = new Date(formatDate(date));
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);

      return d >= start && d <= end;
    });

  const isPast = (date) => date < new Date();

  const handleCheckIn = async () => {
    try {
      await api.post("/checkin");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Check-in failed");
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.post("/checkout");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Check-out failed");
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">
          Attendance Calendar
        </h2>
        <p className="text-gray-500 text-sm">
          Track your daily attendance
        </p>
      </div>

      {/* Calendar */}
      <div className="bg-white p-5 rounded-xl shadow">

        <Calendar
          tileClassName={({ date, view }) => {
            if (view !== "month") return;

            if (isHoliday(date)) return "bg-purple-200";
            if (isLeave(date)) return "bg-yellow-200";
            if (isPresent(date)) return "bg-green-200";
            if (isPast(date)) return "bg-red-200";
          }}

          tileContent={({ date, view }) => {
            if (view !== "month") return;

            const holiday = isHoliday(date);

            if (holiday) {
              return (
                <p className="text-xs text-purple-700 font-semibold">
                  {holiday.name}
                </p>
              );
            }
          }}
        />

      </div>

      {/* Legend */}
      <div className="flex gap-6 text-sm">

        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-green-200 rounded"></span>
          Present
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-red-200 rounded"></span>
          Absent
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-yellow-200 rounded"></span>
          Leave
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-purple-200 rounded"></span>
          Holiday
        </div>

      </div>

      {/* Check In / Check Out */}
      <div className="bg-white p-5 rounded-xl shadow flex gap-4">

        <button
          onClick={handleCheckIn}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
        >
          Check In
        </button>

        <button
          onClick={handleCheckOut}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
        >
          Check Out
        </button>

      </div>

    </div>
  );
}