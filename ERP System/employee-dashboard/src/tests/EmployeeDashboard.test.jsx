import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Dashboard from "../pages/employee/Dashboard";
import api from "../api/axios";

vi.mock("../api/axios");

describe("Employee Dashboard", () => {

  it("renders employee dashboard stats", async () => {

    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 1,
        name: "John Doe",
        email: "john@test.com"
      })
    );

    api.get.mockResolvedValue({
      data: []
    });

    render(<Dashboard />);

    expect(await screen.findByText(/welcome/i)).toBeInTheDocument();

    expect(screen.getByText(/attended days/i)).toBeInTheDocument();

  });

});