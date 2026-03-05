import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function GeneratePayslip() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState("");
  const [file, setFile] = useState(null);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/employees");
        setEmployees(res.data);
      } catch (err) {
        console.error("Failed to load employees", err);
      }
    };

    fetchEmployees();
  }, []);

  const handleUpload = async () => {
    if (!selectedEmp || !month || !year || !file) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("employeeId", selectedEmp);
      formData.append("month", month);
      formData.append("year", year);
      formData.append("file", file);

      await api.post("/payslips", formData);

      alert("Payslip Uploaded Successfully");

      setSelectedEmp("");
      setMonth("");
      setYear("");
      setFile(null);
    } catch (err) {
      alert(
        err.response?.data?.message ||
        err.message ||
        "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedEmployee = employees.find(
    (e) => e.id === Number(selectedEmp)
  );

  return (
    <div className="flex justify-center">

    <div className="space-y-6 w-full max-w-xl">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">
          Generate Payslip
        </h2>
        <p className="text-gray-500 text-sm">
          Upload employee payslips for payroll records
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white border shadow-sm rounded-xl p-8 max-w-xl">

        {/* Employee */}
        <div className="mb-5">
          <label className="text-sm text-gray-600">
            Employee
          </label>

          <select
            value={selectedEmp}
            onChange={(e) => setSelectedEmp(e.target.value)}
            className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select Employee</option>

            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>

          {/* Selected Employee Preview */}
          {selectedEmployee && (
            <div className="flex items-center gap-3 mt-3 bg-gray-50 p-3 rounded">

              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  selectedEmployee.name
                )}`}
                className="w-10 h-10 rounded-full"
              />

              <div>
                <p className="font-medium">
                  {selectedEmployee.name}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedEmployee.email}
                </p>
              </div>

            </div>
          )}
        </div>

        {/* Month */}
        <div className="mb-5">
          <label className="text-sm text-gray-600">
            Payslip Month
          </label>

          <input
            type="month"
            onChange={(e) => {
              const [y, m] = e.target.value.split("-");
              setYear(y);
              setMonth(m);
            }}
            className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="text-sm text-gray-600">
            Upload Payslip (PDF)
          </label>

          <div className="border-dashed border-2 border-gray-300 rounded-lg p-6 text-center mt-2 hover:border-blue-400 transition">

            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
              id="payslipUpload"
            />

            <label
              htmlFor="payslipUpload"
              className="cursor-pointer text-gray-600"
            >
              Click to upload PDF
            </label>

            {file && (
              <p className="text-sm text-green-600 mt-2">
                {file.name}
              </p>
            )}

          </div>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Payslip"}
        </button>

      </div>
    </div>
    </div>
  );
}