import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Payslips from "../pages/employee/Payslips";
import api from "../api/axios";

vi.mock("../api/axios");

describe("Employee Payslips Page", () => {

  it("renders payslip download list", async () => {

    api.get.mockResolvedValue({
      data: [
        {
          id: 1,
          month: "03",
          year: "2026",
          fileUrl: "test.pdf"
        }
      ]
    });

    render(<Payslips />);

    expect(await screen.findByText("March 2026")).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /download/i })
    ).toBeInTheDocument();

  });

});