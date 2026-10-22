import { describe, expect, it } from "vitest";
import { DEFAULT_GYM_NAME, getGymRecordScope, resolveActiveGym } from "@/lib/gyms";

describe("gym selection and record isolation", () => {
  it("uses GYM NAME for the initial gym", () => {
    expect(DEFAULT_GYM_NAME).toBe("GYM NAME");
  });

  it("selects the stored gym or falls back to the first available gym", () => {
    const gyms = [{ id: "gym-a" }, { id: "gym-b" }];
    expect(resolveActiveGym(gyms, "gym-b")?.id).toBe("gym-b");
    expect(resolveActiveGym(gyms, "removed-gym")?.id).toBe("gym-a");
  });

  it("keeps records separated by gym", () => {
    const records = [{ gym_id: "gym-a", name: "One" }, { gym_id: "gym-b", name: "Two" }];
    expect(getGymRecordScope(records, "gym-a").map((record) => record.name)).toEqual(["One"]);
  });
});