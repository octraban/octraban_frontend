import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Landing from "../src/pages/Landing";

describe("Landing Page", () => {
  it("renders the landing page and tagline", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );
    expect(screen.getByText("Octraban")).toBeDefined();
    expect(
      screen.getByText(
        /A human-readable block explorer & developer workspace/i,
      ),
    ).toBeDefined();
  });

  it("has a primary CTA that links to /explorer", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: /Launch Explorer/i });
    expect(link.getAttribute("href")).toBe("/explorer");
  });

  it("has exact stellar.expert links for testnet contracts", () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );

    const links = screen.getAllByRole("link");
    const explorerLink = links.find(
      (l) =>
        l.getAttribute("href") ===
        "https://stellar.expert/explorer/testnet/contract/CBKPNRQ4D3KTAAE7MMJ4HL6JNF2J2EBG2PSSRW4YHOMHTRHUU734CFWJ",
    );
    const ticketLink = links.find(
      (l) =>
        l.getAttribute("href") ===
        "https://stellar.expert/explorer/testnet/contract/CDX3V6OE72KUIEEJTBLFCQZFXZCAKOYWYXK2KPRM57M6FLZFAVUSVL42",
    );

    expect(explorerLink).toBeDefined();
    expect(ticketLink).toBeDefined();
  });
});
