import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PollTimer } from "@/components/poll-timer";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

test("makes the last ten seconds prominent", () => {
  render(<PollTimer closesAt={Date.now() + 5_000} />);
  const timer = screen.getByRole("timer");
  expect(timer).toHaveClass("animate-pulse");
  expect(timer).toHaveClass("text-7xl");
  expect(timer).toHaveClass("text-rose-400");
});

test("stays calm before the last ten seconds", () => {
  render(<PollTimer closesAt={Date.now() + 60_000} />);
  const timer = screen.getByRole("timer");
  expect(timer).not.toHaveClass("animate-pulse");
  expect(timer).toHaveClass("text-5xl");
});
