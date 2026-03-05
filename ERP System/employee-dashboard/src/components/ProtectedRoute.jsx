import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";

export default function ProtectedRoute({ children, allowedRole }) {
  const { auth } = useContext(AuthContext);

  // Not logged in
  if (!auth) {
    return <Navigate to="/login" />;
  }

  // Wrong role
  if (auth.role !== allowedRole) {
    if (auth.role === "admin") {
      return <Navigate to="/admin" />;
    } else {
      return <Navigate to="/employee" />;
    }
  }

  return children;
}