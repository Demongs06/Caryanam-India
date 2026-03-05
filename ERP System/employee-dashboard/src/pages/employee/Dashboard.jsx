import { useEffect, useState } from "react";
import api from "../../api/axios";
import Card from "../../components/Card";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    attended: 0,
    avgHours: "0h 0m",
    late: "0h 0m",
    early: "0h 0m",
    overtime: "0h 0m",
    earlyLogout: "0h 0m"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const loggedUser = JSON.parse(localStorage.getItem("user"));
        setUser(loggedUser);

        const attRes = await api.get("/attendance");
        const holRes = await api.get("/holidays");

        const attendance = attRes.data.filter(
          (a) => a.employeeId === loggedUser.id
        );

        const holidays = holRes.data;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const firstDayOfWeek = new Date();
        firstDayOfWeek.setDate(now.getDate() - now.getDay());
        firstDayOfWeek.setHours(0, 0, 0, 0);

        let monthlyAttendance = [];
        let weeklyAttendance = [];

        attendance.forEach((rec) => {
          const recDate = new Date(rec.date);

          const isHoliday = holidays.find(
            (h) => h.date === rec.date
          );

          if (
            recDate.getMonth() === currentMonth &&
            recDate.getFullYear() === currentYear &&
            !isHoliday
          ) {
            monthlyAttendance.push(rec);
          }

          if (recDate >= firstDayOfWeek) {
            weeklyAttendance.push(rec);
          }
        });

        const attended = monthlyAttendance.length;

        let totalMinutes = 0;

        let lateMinutes = 0;
        let earlyMinutes = 0;
        let overtimeMinutes = 0;
        let earlyLogoutMinutes = 0;

        const expectedLogin = 10 * 60;
        const expectedLogout = 19 * 60;

        monthlyAttendance.forEach((rec) => {
          if (!rec.login || !rec.logout) return;

          const [lh, lm] = rec.login.split(":").map(Number);
          const [oh, om] = rec.logout.split(":").map(Number);

          const loginMinutes = lh * 60 + lm;
          const logoutMinutes = oh * 60 + om;

          totalMinutes += logoutMinutes - loginMinutes;
        });

        weeklyAttendance.forEach((rec) => {
          if (!rec.login || !rec.logout) return;

          const [lh, lm] = rec.login.split(":").map(Number);
          const [oh, om] = rec.logout.split(":").map(Number);

          const loginMinutes = lh * 60 + lm;
          const logoutMinutes = oh * 60 + om;

          lateMinutes += Math.max(0, loginMinutes - expectedLogin);

          earlyMinutes += Math.max(0, expectedLogin - loginMinutes);

          overtimeMinutes += Math.max(0, logoutMinutes - expectedLogout);

          earlyLogoutMinutes += Math.max(0, expectedLogout - logoutMinutes);
        });

        const avgMinutes =
          attended > 0 ? Math.floor(totalMinutes / attended) : 0;

        const formatTime = (minutes) => {
          const h = Math.floor(minutes / 60);
          const m = minutes % 60;
          return `${h}h ${m}m`;
        };

        setStats({
          attended,
          avgHours: formatTime(avgMinutes),
          late: formatTime(lateMinutes),
          early: formatTime(earlyMinutes),
          overtime: formatTime(overtimeMinutes),
          earlyLogout: formatTime(earlyLogoutMinutes)
        });
      } catch (err) {
        console.error("Failed to load employee dashboard");
      }
    };

    fetchData();
  }, []);

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">

      <div className="bg-white p-5 rounded-xl shadow flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">
            Welcome, {user.name}
          </h2>

          <p className="text-gray-500 text-sm">
            Employee Dashboard
          </p>
        </div>

        <p className="text-sm text-gray-500">
          {user.email}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        <Card title="Attended Days (Month)" value={stats.attended} />

        <Card title="Avg Login Hours (Month)" value={stats.avgHours} />

        <Card title="Overtime (Week)" value={stats.overtime} />

        <Card title="Early Login (Week)" value={stats.early} />

        <Card title="Late Login (Week)" value={stats.late} />

        <Card title="Early Logout (Week)" value={stats.earlyLogout} />

      </div>

    </div>
  );
}