import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import GeneratePayslip from "../pages/admin/GeneratePayslip";
import api from "../api/axios";

vi.mock("../api/axios");

describe("Generate Payslip", () => {

  it("renders form fields", async () => {

    api.get.mockResolvedValue({
      data: [{ id: 1, name: "John Doe" }]
    });

    render(<GeneratePayslip />);

    expect(await screen.findByText("John Doe")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /upload payslip/i })
    ).toBeInTheDocument();

  });

});