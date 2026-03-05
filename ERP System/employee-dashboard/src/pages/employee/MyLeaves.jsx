import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await api.get("/leaves");
      setLeaves(res.data);
    } catch (err) {
      console.error("Error fetching leaves", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow text-center">
        <p className="text-gray-500">Loading leave applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">
          My Leave Applications
        </h2>
        <p className="text-gray-500 text-sm">
          Track your leave requests and approval status
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100 text-left text-sm">
            <tr>
              <th className="p-4">From</th>
              <th className="p-4">To</th>
              <th className="p-4">Type</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>

          <tbody>

            {leaves.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-6 text-gray-500">
                  No leave applications found
                </td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <tr
                  key={leave.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-4">
                    {formatDate(leave.startDate)}
                  </td>

                  <td className="p-4">
                    {formatDate(leave.endDate)}
                  </td>

                  <td className="p-4 font-medium">
                    {leave.type}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium
                        ${
                          leave.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : leave.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }
                      `}
                    >
                      {leave.status || "Pending"}
                    </span>
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