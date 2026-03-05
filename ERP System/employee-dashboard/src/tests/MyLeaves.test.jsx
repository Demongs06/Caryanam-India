import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MyLeaves from "../pages/employee/MyLeaves";
import api from "../api/axios";

vi.mock("../api/axios");

describe("My Leaves", () => {

  it("renders leave records", async () => {

    api.get.mockResolvedValue({
      data: [
        {
          id: 1,
          startDate: "2026-03-01",
          endDate: "2026-03-02",
          type: "PL",
          status: "Approved"
        }
      ]
    });

    render(<MyLeaves />);

    expect(await screen.findByText("PL")).toBeInTheDocument();

  });

});