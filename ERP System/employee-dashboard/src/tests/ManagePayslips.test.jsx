import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ManagePayslips from "../pages/admin/ManagePayslips";
import api from "../api/axios";

vi.mock("../api/axios");

describe("Manage Payslips", () => {

  it("renders payslip table", async () => {

    api.get.mockResolvedValue({
      data: [
        {
          id: 1,
          employeeName: "John Doe",
          month: "03",
          year: "2026"
        }
      ]
    });

    render(<ManagePayslips />);

    expect(await screen.findByText("John Doe")).toBeInTheDocument();

  });

});