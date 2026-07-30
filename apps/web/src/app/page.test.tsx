// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import Home from "./page";

describe("Home page", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads and displays the Bitcoin price", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            symbol: "BTCUSDT",
            price: 64869.84,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      ),
    );

    render(<Home />);

    expect(
      screen.getByText("Loading live market price..."),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("BTCUSDT")).toBeInTheDocument();
    });

    expect(screen.getByText("$64,869.84")).toBeInTheDocument();
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it("loads Ethereum after the user changes the symbol", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            symbol: "BTCUSDT",
            price: 64869.84,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            symbol: "ETHUSDT",
            price: 3210.5,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          },
        ),
      );

    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();

    render(<Home />);

    await screen.findByText("BTCUSDT");

    await user.selectOptions(
      screen.getByLabelText("Cryptocurrency"),
      "ETHUSDT",
    );

    await waitFor(() => {
      expect(screen.getByText("ETHUSDT")).toBeInTheDocument();
    });

    expect(screen.getByText("$3,210.50")).toBeInTheDocument();
  });
});