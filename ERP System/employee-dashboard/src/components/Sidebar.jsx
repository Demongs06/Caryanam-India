import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

export default function Sidebar({ links }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="w-64 bg-gray-900 text-gray-200 h-screen fixed top-0 left-0 flex flex-col">

      {/* Logo + Company */}
      <div className="p-5 flex items-center gap-3 border-b border-gray-700">
        <img
          src="https://media.licdn.com/dms/image/v2/D4D0BAQGYAw7ryBgtNw/company-logo_200_200/B4DZVBIwFeHAAM-/0/1740554568952?e=2147483647&v=beta&t=aF_T19dojI9GPkYK-Ldm8CqHRDLA0o_2f4vLJH4A_QE"
          className="w-8 h-8 rounded-full"
        />
        <h2 className="text-lg font-semibold">CaryanamIndia</h2>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-4">
        {links.map((link) => {
          const active = location.pathname === link.to;

          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 py-2 px-3 mb-2 rounded transition
                ${
                  active
                    ? "bg-gray-800 text-white"
                    : "hover:bg-gray-800 hover:text-white"
                }`}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-2 rounded transition"
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
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>

          Logout
        </button>
      </div>

    </div>
  );
}