import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { PollResults } from "@/components/poll-results";

test("renders vote counts and percentages", () => {
  render(
    <PollResults
      total={4}
      selectedOptionId="a"
      options={[
        { id: "a", artistId: "1", label: "Bicep", votes: 3 },
        { id: "b", artistId: "2", label: "Overmono", votes: 1 },
      ]}
    />,
  );

  expect(screen.getByRole("button", { name: /Bicep/ })).toHaveTextContent(
    "3 · 75%",
  );
  expect(screen.getByRole("button", { name: /Overmono/ })).toHaveTextContent(
    "1 · 25%",
  );
});
