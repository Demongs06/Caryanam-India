import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Holidays from "../pages/admin/Holidays";
import api from "../api/axios";

vi.mock("../api/axios");

describe("Holidays Page", () => {

  it("renders holidays list", async () => {

    api.get.mockResolvedValue({
      data: [
        {
          id: 1,
          date: "2026-03-10",
          name: "Holi"
        }
      ]
    });

    render(<Holidays />);

    expect(await screen.findByText("Holi")).toBeInTheDocument();

  });

});