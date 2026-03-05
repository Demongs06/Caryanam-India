import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function LeaveApplications() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const res = await api.get("/leaves");
      setLeaves(res.data);
    } catch (err) {
      console.error("Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/leaves/${id}`, { status });
      fetchLeaves();
    } catch (err) {
      alert("Failed to update leave");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
  <div className="space-y-6">

    {/* Page Header */}
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-semibold">Leave Applications</h2>
      <p className="text-gray-500 text-sm">
        Total Requests: {leaves.length}
      </p>
    </div>

    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">

      <table className="w-full text-sm">

        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left p-4">Employee</th>
            <th className="text-left p-4">Type</th>
            <th className="text-left p-4">From</th>
            <th className="text-left p-4">To</th>
            <th className="text-left p-4">Reason</th>
            <th className="text-left p-4">Status</th>
            <th className="text-left p-4">Actions</th>
          </tr>
        </thead>

        <tbody>

          {leaves.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center p-6 text-gray-500">
                No leave applications found
              </td>
            </tr>
          )}

          {leaves.map((leave) => (
            <tr key={leave.id} className="border-t hover:bg-gray-50">

              <td className="p-4 font-medium">
                {leave.employeeName}
              </td>

              <td className="p-4">
                {leave.type}
              </td>

              <td className="p-4">
                {leave.startDate}
              </td>

              <td className="p-4">
                {leave.endDate}
              </td>

              <td className="p-4 max-w-xs truncate">
                {leave.reason}
              </td>

              {/* Status */}
              <td className="p-4">
                <span
                  className={`px-2 py-1 text-xs rounded-full
                    ${
                      leave.status === "Approved"
                        ? "bg-green-100 text-green-600"
                        : leave.status === "Rejected"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                >
                  {leave.status}
                </span>
              </td>

              {/* Actions */}
              <td className="p-4">

                {leave.status === "Pending" ? (
                  <div className="flex gap-2">

                    <button
                      onClick={() =>
                        updateStatus(leave.id, "Approved")
                      }
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(leave.id, "Rejected")
                      }
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                    >
                      Reject
                    </button>

                  </div>
                ) : (
                  <span className="text-gray-400 text-xs">
                    Completed
                  </span>
                )}

              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>

  </div>
);
}