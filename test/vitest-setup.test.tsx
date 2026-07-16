import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Vitest setup", () => {
  it("loads jest-dom matchers globally", () => {
    render(<div>Configured matcher</div>);

    expect(screen.getByText("Configured matcher")).toBeInTheDocument();
  });
});
