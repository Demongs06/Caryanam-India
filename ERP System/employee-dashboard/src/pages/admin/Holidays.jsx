import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Holidays() {
  const [holidays, setHolidays] = useState([]);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const res = await api.get("/holidays");
      setHolidays(res.data);
    } catch (err) {
      console.error("Failed to load holidays");
    }
  };

  const addHoliday = async (e) => {
    e.preventDefault();

    if (!date || !name) {
      alert("Please fill all fields");
      return;
    }

    try {
      await api.post("/holidays", { date, name });

      setDate("");
      setName("");

      fetchHolidays();
    } catch (err) {
      alert("Failed to add holiday");
    }
  };

  const deleteHoliday = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this holiday?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/holidays/${id}`);
      fetchHolidays();
    } catch (err) {
      alert("Failed to delete holiday");
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <div className="flex justify-center">

      <div className="space-y-6 w-full max-w-2xl">

        {/* Header */}
        <div className="flex justify-between items-center">

          <div>
            <h2 className="text-2xl font-semibold">
              Company Holidays
            </h2>

            <p className="text-gray-500 text-sm">
              Manage official company holidays
            </p>
          </div>

          <span className="text-sm text-gray-500">
            Total: {holidays.length}
          </span>

        </div>

        {/* Add Holiday */}
        <div className="bg-white border rounded-xl shadow-sm p-6">

          <form
            onSubmit={addHoliday}
            className="grid md:grid-cols-3 gap-4"
          >

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <input
              placeholder="Holiday name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
              Add Holiday
            </button>

          </form>

        </div>

        {/* Holiday List */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">

          <table className="w-full text-sm">

            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Holiday</th>
                <th className="text-center p-4">Action</th>
              </tr>
            </thead>

            <tbody>

              {holidays.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center p-8 text-gray-500"
                  >
                    No holidays added
                  </td>
                </tr>
              ) : (
                holidays.map((h) => (
                  <tr
                    key={h.id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="p-4">
                      {formatDate(h.date)}
                    </td>

                    <td className="p-4 font-medium flex items-center gap-2">

                      <span>🎉</span>
                      {h.name}

                    </td>

                    <td className="p-4 text-center">

                      <button
                        onClick={() => deleteHoliday(h.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>

                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}