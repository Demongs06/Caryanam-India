import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RegisterEmployee from "../pages/admin/RegisterEmployee";

describe("RegisterEmployee Page", () => {

  it("renders registration form inputs", () => {

    render(<RegisterEmployee />);

    expect(screen.getByPlaceholderText(/enter full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter phone number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();

  });

});