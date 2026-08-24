import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { PollWinner } from "@/components/poll-winner";

test("shows the winning name with a trophy", () => {
  render(
    <PollWinner
      total={3}
      options={[
        { id: "a", artistId: "1", label: "Bicep", votes: 3 },
        { id: "b", artistId: "2", label: "Overmono", votes: 0 },
      ]}
    />,
  );
  expect(screen.getByText("Bicep")).toBeInTheDocument();
  expect(screen.getByText("Winner")).toBeInTheDocument();
});
