import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function ManagePayslips() {
  const [payslips, setPayslips] = useState([]);
  const [search, setSearch] = useState("");

  const fetchPayslips = async () => {
    try {
      const res = await api.get("/payslips");
      setPayslips(res.data);
    } catch (err) {
      console.error("Failed to load payslips", err);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, []);

  const removePayslip = async (id) => {
    const confirmDelete = window.confirm("Delete this payslip?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/payslips/${id}`);
      fetchPayslips();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const formatMonth = (month, year) => {
    const date = new Date(year, month - 1);
    return date.toLocaleString("default", {
      month: "long",
      year: "numeric"
    });
  };

  const filteredPayslips = payslips.filter((p) =>
    p.employeeName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">

        <div>
          <h2 className="text-2xl font-semibold">
            Manage Payslips
          </h2>

          <p className="text-gray-500 text-sm">
            Total Payslips: {payslips.length}
          </p>
        </div>

        <input
          type="text"
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg p-2 w-64 focus:ring-2 focus:ring-blue-500 outline-none"
        />

      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left p-4">Employee</th>
              <th className="text-left p-4">Month</th>
              <th className="text-center p-4">View</th>
              <th className="text-center p-4">Remove</th>
            </tr>
          </thead>

          <tbody>

            {filteredPayslips.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-8 text-gray-500">
                  No payslips found
                </td>
              </tr>
            ) : (
              filteredPayslips.map((p) => (
                <tr
                  key={p.id}
                  className="border-t hover:bg-gray-50 transition"
                >

                  {/* Employee */}
                  <td className="p-4 flex items-center gap-3">

                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        p.employeeName
                      )}`}
                      className="w-8 h-8 rounded-full"
                    />

                    <span className="font-medium">
                      {p.employeeName}
                    </span>

                  </td>

                  {/* Month */}
                  <td className="p-4">
                    {formatMonth(p.month, p.year)}
                  </td>

                  {/* View */}
                  <td className="p-4 text-center">

                    <a
                      href={p.fileUrl}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View
                    </a>

                  </td>

                  {/* Delete */}
                  <td className="p-4 text-center">

                    <button
                      onClick={() => removePayslip(p.id)}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove
                    </button>

                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}