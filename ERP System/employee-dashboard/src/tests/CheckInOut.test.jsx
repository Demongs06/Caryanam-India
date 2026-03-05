import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CheckInOut from "../pages/employee/CheckInOut";
import api from "../api/axios";

vi.mock("../api/axios");

describe("CheckInOut Page", () => {

  it("renders check in and check out buttons", async () => {

    api.get.mockResolvedValue({
      data: []
    });

    render(<CheckInOut />);

    expect(
      screen.getByRole("button", { name: /check in/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /check out/i })
    ).toBeInTheDocument();

  });

});