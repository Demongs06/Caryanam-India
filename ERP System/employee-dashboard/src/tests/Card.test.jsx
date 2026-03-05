import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Card from "../components/Card";

describe("Card Component", () => {

  it("renders card title and value", () => {

    render(<Card title="Employees" value="10" />);

    expect(screen.getByText("Employees")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();

  });

});