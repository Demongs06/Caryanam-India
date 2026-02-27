import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="flex justify-between items-center h-16 px-8">

        {/* Logo */}
        <h1 className="text-2xl font-bold text-indigo-600">
          EduPlatform
        </h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 font-medium">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>

          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link
                to="/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="text-gray-600">
                👤 {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Hamburger (Below md) */}
        <div
          className="md:hidden flex flex-col justify-between w-7 h-5 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span
            className={`h-0.5 w-full bg-black transition ${
              isOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`h-0.5 w-full bg-black transition ${
              isOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-0.5 w-full bg-black transition ${
              isOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t shadow-md">
          <div className="flex flex-col px-8 py-6 space-y-4 font-medium">

            {/* Username (if logged in) */}
            {user && (
              <div className="font-semibold text-gray-700">
                👤 {user.username}
              </div>
            )}

            <Link to="/" onClick={() => setIsOpen(false)}>
              Home
            </Link>

            <Link to="/about" onClick={() => setIsOpen(false)}>
              About
            </Link>

            {!user ? (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg w-fit"
                >
                  Register
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg w-fit"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}