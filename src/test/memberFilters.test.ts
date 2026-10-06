import { describe, expect, it } from "vitest";
import { matchesMemberFilter } from "@/lib/memberFilters";

const member = { id: "a", status: "pending" };
const today = new Date(2026, 9, 6);
describe("Members filters", () => {
  it("separates current-month collection from active membership", () => {
    const payments = [{ admission_id: "a", payment_date: "2026-09-20" }];
    expect(matchesMemberFilter(member, payments, "active", today)).toBe(true);
    expect(matchesMemberFilter(member, payments, "paid", today)).toBe(false);
    expect(matchesMemberFilter(member, payments, "unpaid", today)).toBe(true);
  });
  it("does not activate future advance payments", () => {
    const payments = [{ admission_id: "a", payment_date: "2026-10-15" }];
    expect(matchesMemberFilter(member, payments, "active", today)).toBe(false);
    expect(matchesMemberFilter(member, payments, "paid", today)).toBe(false);
  });
  it("expires after 30 days", () => {
    const payments = [{ admission_id: "a", payment_date: "2026-09-06" }];
    expect(matchesMemberFilter(member, payments, "inactive", today)).toBe(true);
  });
  it("includes no-payment members and more status filters", () => {
    expect(matchesMemberFilter(member, [], "all", today)).toBe(true);
    expect(matchesMemberFilter(member, [], "inactive", today)).toBe(true);
    expect(matchesMemberFilter(member, [], "pending", today)).toBe(true);
    expect(matchesMemberFilter(member, [], "rejected", today)).toBe(false);
  });
});