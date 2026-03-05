import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Employees from "../pages/admin/Employees";
import api from "../api/axios";

vi.mock("../api/axios");

describe("Employees Page", () => {

  it("renders employees list", async () => {

    api.get
      .mockResolvedValueOnce({
        data: [{ id: 1, name: "John Doe" }]
      })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    render(<Employees />);

    expect(await screen.findByText("John Doe")).toBeInTheDocument();

  });

});