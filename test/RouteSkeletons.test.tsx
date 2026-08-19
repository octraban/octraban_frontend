import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  DashboardRouteSkeleton,
  GraphRouteSkeleton,
  TableRouteSkeleton,
} from "../src/components/RouteSkeletons";

describe("route loading skeletons", () => {
  it("provides a stable table-shaped loading state", () => {
    render(<TableRouteSkeleton />);

    expect(screen.getByRole("status", { name: "Loading table" })).toBeVisible();
    expect(screen.getByRole("status").querySelectorAll("[aria-hidden='true']")).toHaveLength(9);
  });

  it("matches dashboard and graph route layouts", () => {
    const { rerender } = render(<DashboardRouteSkeleton />);
    expect(screen.getByRole("status", { name: "Loading dashboard" })).toBeVisible();

    rerender(<GraphRouteSkeleton />);
    expect(screen.getByRole("status", { name: "Loading graph" })).toBeVisible();
  });
});
