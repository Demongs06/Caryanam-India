import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { AuthContext } from "../auth/AuthContext";

/* MOCK Navigate */
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    Navigate: ({ to }) => <div>Redirected to {to}</div>
  };
});

describe("ProtectedRoute", () => {

  it("renders children if user is authenticated", () => {

    const mockAuth = {
      auth: {
        role: "employee"
      }
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuth}>
          <ProtectedRoute allowedRole="employee">
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();

  });

});