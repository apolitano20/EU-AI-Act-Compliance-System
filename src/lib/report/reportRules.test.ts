// Module 15 self-check. Run with: npx tsx src/lib/report/reportRules.test.ts
// Aggregation-only tests over synthetic register rows + system reports.

import assert from "node:assert";
import {
  buildFinalReport,
  collectNonFinalGuidance,
  parseReportOptions,
  rollUpOrganisation,
  type RegisterRow,
  type SystemReport,
} from "./reportRules";

const registerRow = (overrides: Partial<RegisterRow>): RegisterRow => ({
  systemId: "s1",
  systemName: "System 1",
  riskTier: "likely_high_risk",
  roles: ["Provider"],
  obligationId: "OBL-ART9-RMS",
  obligationName: "Risk management",
  dutyHolder: ["Provider"],
  legalBasisCitation: "Art 9; Recital 47",
  applicableFromDate: "2027-12-02",
  guidanceStatus: "provisional",
  obligationStatus: "likely_applies",
  readinessStatus: "evidence_gap",
  remediationStatus: null,
  owner: null,
  dueDate: null,
  ...overrides,
});

const systemReport = (overrides: Partial<SystemReport>): SystemReport => ({
  systemId: "s1",
  systemName: "System 1",
  shortDescription: "",
  riskTier: "likely_high_risk",
  roles: ["Provider"],
  promotedByReclassification: false,
  moduleStatuses: [],
  register: [registerRow({})],
  readinessScore: 50,
  applicableObligations: 1,
  remediation: { total: 1, closed: 0, open: 1, unassigned: 1, recurringActive: 0 },
  registrationRequired: true,
  standardsConformityRoute: "route",
  notHighRiskDocumentationFlag: false,
  consistencyWarnings: [],
  minUpstreamConfidence: 90,
  missingUpstream: [],
  ...overrides,
});

// Portfolio with one high-risk + one prohibited + one out-of-scope → correct tier counts.
{
  const reports = [
    systemReport({ systemId: "s1", riskTier: "likely_high_risk" }),
    systemReport({ systemId: "s2", systemName: "System 2", riskTier: "prohibited_flag", register: [] , applicableObligations: 0}),
    systemReport({ systemId: "s3", systemName: "System 3", riskTier: "out_of_scope_or_excluded", register: [], applicableObligations: 0 }),
  ];
  const rollUp = rollUpOrganisation(reports);
  assert.strictEqual(rollUp.systemsCovered, 3);
  assert.strictEqual(rollUp.countsByTier.likely_high_risk, 1);
  assert.strictEqual(rollUp.countsByTier.prohibited_flag, 1);
  assert.strictEqual(rollUp.countsByTier.out_of_scope_or_excluded, 1);
  assert(rollUp.headline.includes("3 systems assessed"));
  assert(rollUp.headline.includes("1 prohibited-practice flags"));
}

// Every provisional/draft obligation appears in the appendix with its source named.
{
  const register = [
    registerRow({ obligationId: "OBL-ART9-RMS", guidanceStatus: "provisional" }),
    registerRow({ obligationId: "OBL-ART6-3-NOTHR-DOC", guidanceStatus: "draft" }),
    registerRow({ obligationId: "OBL-ART4-LITERACY", guidanceStatus: "final" }),
  ];
  const appendix = collectNonFinalGuidance(register);
  assert.strictEqual(appendix.length, 2, "final rules must not appear in the appendix");
  assert(appendix.find((e) => e.obligationId === "OBL-ART6-3-NOTHR-DOC")?.source.includes("2026-05-19"));
  assert(appendix.find((e) => e.obligationId === "OBL-ART9-RMS")?.source.includes("Digital Omnibus"));
}

// Excluding non-final rules still keeps the appendix (never silently dropped).
{
  const reports = [systemReport({})];
  const report = buildFinalReport(reports, { scope: "all", badgeMode: "exclude_non_final", audience: "internal", remediationDetail: "full" });
  assert.strictEqual(report.register.length, 0, "provisional row excluded from the register");
  assert.strictEqual(report.nonFinalAppendix.length, 1, "appendix must still list the excluded duty");
  assert(report.assumptions.some((a) => a.includes("under-stating")));
}

// A system missing upstream modules is flagged incomplete, not dropped.
{
  const reports = [systemReport({ missingUpstream: ["Module 13 evidence states not answered"] })];
  const report = buildFinalReport(reports, parseReportOptions({}));
  assert.strictEqual(report.reports.length, 1);
  assert(report.reports[0].missingUpstream.length > 0);
}

// Org confidence drops when systems carry 'needs review' statuses.
{
  const clean = rollUpOrganisation([systemReport({})]);
  const withReview = rollUpOrganisation([systemReport({}), systemReport({ systemId: "s2", riskTier: "possibly_high_risk", minUpstreamConfidence: 40 })]);
  assert(withReview.confidenceScore < clean.confidenceScore);
}

// Scoping: high-risk only.
{
  const reports = [
    systemReport({ systemId: "s1", riskTier: "likely_high_risk" }),
    systemReport({ systemId: "s2", riskTier: "not_high_risk" }),
  ];
  const report = buildFinalReport(reports, parseReportOptions({ scope: "high-risk" }));
  assert.strictEqual(report.reports.length, 1);
  assert.strictEqual(report.rollUp.systemsCovered, 1);
}

// Option parsing defaults are conservative.
{
  const options = parseReportOptions({});
  assert.strictEqual(options.badgeMode, "include_and_badge");
  assert.strictEqual(options.scope, "all");
}

console.log("reportRules.test.ts: all assertions passed");
