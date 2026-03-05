import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LeaveApplications from "../pages/admin/LeaveApplications";
import api from "../api/axios";

vi.mock("../api/axios");

describe("Leave Applications Page", () => {

  it("renders leave applications list", async () => {

    api.get.mockResolvedValue({
      data: [
        {
          id: 1,
          employeeName: "John Doe",
          type: "PL",
          startDate: "2026-03-01",
          endDate: "2026-03-02",
          reason: "Vacation",
          status: "Pending"
        }
      ]
    });

    render(<LeaveApplications />);

    expect(await screen.findByText("John Doe")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /approve/i })
    ).toBeInTheDocument();

  });

});