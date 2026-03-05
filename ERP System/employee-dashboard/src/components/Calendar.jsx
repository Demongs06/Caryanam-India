import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function CustomCalendar() {
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    api.get("/holidays")
      .then(res => setHolidays(res.data));
  }, []);

  const isSunday = (date) => date.getDay() === 0;

  const isFirstOrThirdSaturday = (date) => {
    if (date.getDay() !== 6) return false;
    const day = date.getDate();
    return day <= 7 || (day > 14 && day <= 21);
  };

  const isAdminHoliday = (date) => {
    return holidays.some(
      h => new Date(h.date).toDateString() === date.toDateString()
    );
  };

  return (
    <Calendar
      tileClassName={({ date }) => {
        if (
          isSunday(date) ||
          isFirstOrThirdSaturday(date) ||
          isAdminHoliday(date)
        ) {
          return "bg-red-500 text-white rounded";
        }
      }}
    />
  );
}