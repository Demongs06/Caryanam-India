import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ApplyLeave from "../pages/employee/ApplyLeave";

describe("ApplyLeave Page", () => {

  it("renders leave application form", () => {

    render(<ApplyLeave />);

    expect(screen.getByText(/apply for leave/i)).toBeInTheDocument();

    // leave type dropdown
    expect(screen.getByRole("combobox")).toBeInTheDocument();

    // date inputs
    expect(screen.getAllByDisplayValue("").length).toBeGreaterThanOrEqual(2);

    // reason textarea
    expect(screen.getByRole("textbox")).toBeInTheDocument();

    // submit button
    expect(screen.getByRole("button")).toBeInTheDocument();

  });

});