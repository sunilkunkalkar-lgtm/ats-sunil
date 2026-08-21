import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeEmail, normalizePhone, isValidPhone } from "./identity";
import { computeOfferJoinFunnel, pct } from "./pipeline";
import { daysRemaining, slaTone } from "./sla";

describe("identity normalization", () => {
  it("lowercases email", () => {
    assert.equal(normalizeEmail("  Alex@Firm.COM "), "alex@firm.com");
  });

  it("strips US country code and punctuation from phone", () => {
    assert.equal(normalizePhone("+1 (415) 555-0100"), "4155550100");
    assert.equal(normalizePhone("415-555-0100"), "4155550100");
  });

  it("accepts 10-digit phones", () => {
    assert.equal(isValidPhone("4155550100"), true);
    assert.equal(isValidPhone("555"), false);
  });
});

describe("offer-to-join funnel", () => {
  it("treats offered + accepted + joined + dropoff as the offer cohort", () => {
    const funnel = computeOfferJoinFunnel({
      offered: 2,
      accepted: 1,
      joined: 4,
      dropoff: 3,
    });
    assert.equal(funnel.offered, 10);
    assert.equal(funnel.offerToJoinRate, 0.4);
    assert.equal(funnel.offerDropoffRate, 0.3);
    assert.equal(pct(funnel.offerToJoinRate), "40%");
  });

  it("returns null rates when nobody has been offered", () => {
    const funnel = computeOfferJoinFunnel({
      offered: 0,
      accepted: 0,
      joined: 0,
      dropoff: 0,
    });
    assert.equal(funnel.offerToJoinRate, null);
  });
});

describe("SLA countdown", () => {
  it("flags overdue requisitions", () => {
    const opened = new Date("2026-07-01T00:00:00.000Z");
    const now = new Date("2026-08-01T00:00:00.000Z");
    const left = daysRemaining(opened, 21, now);
    assert.ok(left < 0);
    assert.equal(slaTone(left), "breach");
  });
});
