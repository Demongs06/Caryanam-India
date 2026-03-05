import { useState } from "react";
import api from "../../api/axios";

export default function RegisterEmployee() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !phone || !address || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await api.post("/register", {
        name,
        email,
        phone,
        address,
        password
      });

      alert("Employee Registered Successfully");

      setName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setPassword("");

    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">

      <div className="space-y-6 w-full max-w-xl">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold">
            Register Employee
          </h2>

          <p className="text-gray-500 text-sm">
            Add a new employee to the system
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border shadow-sm rounded-xl p-6 space-y-4"
        >

          {/* Full Name */}
          <div>
            <label className="text-sm text-gray-600">
              Full Name
            </label>

            <input
              placeholder="Enter full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-600">
              Email
            </label>

            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm text-gray-600">
              Phone
            </label>

            <input
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, ""))
              }
              maxLength="10"
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Address */}
          <div>
            <label className="text-sm text-gray-600">
              Address
            </label>

            <input
              placeholder="Enter address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-600">
              Password
            </label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none pr-10"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-3 top-3 text-gray-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading
              ? "Registering..."
              : "Register Employee"}
          </button>

        </form>

      </div>

    </div>
  );
}