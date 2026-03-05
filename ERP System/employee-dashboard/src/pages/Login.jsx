import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const success = await login(email, password);

    setLoading(false);

    if (!success) {
      setError("Invalid email or password");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));

    if (user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/employee");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">

      <div className="bg-white p-8 rounded-xl shadow-lg w-96">

        {/* Logo + Company */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="https://media.licdn.com/dms/image/v2/D4D0BAQGYAw7ryBgtNw/company-logo_200_200/B4DZVBIwFeHAAM-/0/1740554568952?e=2147483647&v=beta&t=aF_T19dojI9GPkYK-Ldm8CqHRDLA0o_2f4vLJH4A_QE"
            alt="Company Logo"
            className="w-14 h-14 rounded-full mb-2"
          />

          <h1 className="text-xl font-semibold">
            CaryanamIndia
          </h1>

          <p className="text-gray-500 text-sm">
            HRMS Login
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            className="w-full border p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* Password Field */}
          <div className="relative mb-4">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              className="w-full border p-2 rounded pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-gray-500"
            >
              {showPassword ? (

                /* Eye Off SVG */

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.73-1.73 1.9-3.29 3.3-4.56" />
                  <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8-1 2.37-2.7 4.47-4.9 6" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>

              ) : (

                /* Eye SVG */

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>

              )}
            </button>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>

    </div>
  );
}