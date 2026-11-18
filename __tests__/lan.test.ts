import { expect, test } from "vitest";
import { crowdFacingHost } from "@/lib/net/lan";

test("rewrites localhost QR hosts to a LAN address phones can open", () => {
  expect(crowdFacingHost("localhost:3001", ["192.168.1.12"])).toBe(
    "192.168.1.12:3001",
  );
  expect(crowdFacingHost("127.0.0.1:3000", ["10.0.0.4"])).toBe("10.0.0.4:3000");
});

test("keeps a LAN host as-is", () => {
  expect(crowdFacingHost("192.168.1.8:3001", ["192.168.1.12"])).toBe(
    "192.168.1.8:3001",
  );
});
