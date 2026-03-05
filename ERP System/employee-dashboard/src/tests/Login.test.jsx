import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import { AuthContext } from "../auth/AuthContext";

describe("Login Page", () => {

  it("renders login form inputs and login button", () => {

    const mockAuth = {
      login: vi.fn()
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuth}>
          <Login />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();

    // target specific button
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();

  });

});