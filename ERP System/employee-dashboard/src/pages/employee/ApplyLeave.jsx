import { useState } from "react";
import api from "../../api/axios";

export default function ApplyLeave() {
  const [type, setType] = useState("PL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate || !reason) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await api.post("/leaves", {
        type,
        startDate,
        endDate,
        reason
      });

      alert("Leave Applied Successfully");

      setType("PL");
      setStartDate("");
      setEndDate("");
      setReason("");
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Failed to apply leave"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow w-full max-w-xl space-y-5"
      >
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold">
            Apply for Leave
          </h2>
          <p className="text-gray-500 text-sm">
            Submit a leave request for approval
          </p>
        </div>

        {/* Leave Type */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Leave Type
          </label>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="PL">Paid Leave (PL)</option>
            <option value="SL">Sick Leave (SL)</option>
            <option value="EL">Emergency Leave (EL)</option>
          </select>
        </div>

        {/* Date Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Start Date
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              End Date
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Reason
          </label>

          <textarea
            rows="4"
            placeholder="Explain the reason for leave..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          ></textarea>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Leave Request"}
        </button>
      </form>
    </div>
  );
}