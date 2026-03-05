import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Dashboard from "../pages/admin/Dashboard";

describe("Admin Dashboard", () => {

  it("renders admin dashboard", () => {

    render(<Dashboard />);

    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();

  });

});