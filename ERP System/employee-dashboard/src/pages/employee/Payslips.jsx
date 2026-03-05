import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Payslips() {
  const [myPayslips, setMyPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        setLoading(true);
        const res = await api.get("/payslips");
        setMyPayslips(res.data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to load payslips.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayslips();
  }, []);

  const formatMonth = (month, year) => {
    const date = new Date(year, month - 1);
    return date.toLocaleString("default", {
      month: "long",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow text-center">
        <p className="text-gray-500">Loading payslips...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-xl shadow text-center text-red-600">
        {error}
      </div>
    );
  }

  if (myPayslips.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow text-center">
        <h2 className="text-xl font-semibold mb-2">
          My Payslips
        </h2>
        <p className="text-gray-500">
          No payslips available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">
          My Payslips
        </h2>
        <p className="text-gray-500 text-sm">
          Download your monthly salary slips
        </p>
      </div>

      {/* Payslip Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {myPayslips.map((p) => (
          <div
            key={p.id}
            className="bg-white border rounded-xl p-5 shadow hover:shadow-lg transition flex flex-col justify-between"
          >

            {/* Icon + Month */}
            <div className="flex items-center gap-3 mb-4">

              <div className="bg-blue-100 p-3 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  className="text-blue-600"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>

              <div>
                <p className="font-semibold">
                  {formatMonth(p.month, p.year)}
                </p>
                <p className="text-xs text-gray-500">
                  Salary Slip
                </p>
              </div>

            </div>

            {/* Download Button */}
            <a
              href={p.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>

              Download
            </a>

          </div>
        ))}

      </div>

    </div>
  );
}