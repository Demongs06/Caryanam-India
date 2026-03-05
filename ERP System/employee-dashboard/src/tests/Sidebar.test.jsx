import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../auth/AuthContext";

describe("Sidebar Component", () => {

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/employees", label: "Employees" }
  ];

  it("renders navigation links and logout button", () => {

    const mockAuth = {
      logout: vi.fn()
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuth}>
          <Sidebar links={links} />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Employees")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();

  });

});