import type { AuditReport } from '@/types/audit';

export type ScoreDiff = {
  field: string;
  label: string;
  previous: number | null;
  current: number | null;
  delta: number;
  direction: 'up' | 'down' | 'same';
};

export type AuditDiffResult = {
  hasChanges: boolean;
  improved: ScoreDiff[];
  regressed: ScoreDiff[];
  unchanged: ScoreDiff[];
  newIssues: string[];
  fixedIssues: string[];
  summary: string;
};

const SCORE_FIELDS: Array<{ field: keyof AuditReport; label: string }> = [
  { field: 'overallScore', label: 'Overall Score' },
  { field: 'onPageScore', label: 'On-Page SEO' },
  { field: 'offPageScore', label: 'Off-Page SEO' },
  { field: 'geoScore', label: 'GEO Score' },
  { field: 'aeoScore', label: 'AEO Score' },
  { field: 'worldwideSeoScore', label: 'Worldwide SEO' },
  { field: 'pageSpeedScore', label: 'PageSpeed' },
  { field: 'securityScore', label: 'Security' },
];

export function computeAuditDiff(
  previous: Partial<AuditReport>,
  current: Partial<AuditReport>
): AuditDiffResult {
  const improved: ScoreDiff[] = [];
  const regressed: ScoreDiff[] = [];
  const unchanged: ScoreDiff[] = [];

  for (const { field, label } of SCORE_FIELDS) {
    const prev = (previous[field] as number | null | undefined) ?? null;
    const curr = (current[field] as number | null | undefined) ?? null;
    const delta = curr !== null && prev !== null ? curr - prev : 0;

    const diff: ScoreDiff = {
      field,
      label,
      previous: prev,
      current: curr,
      delta,
      direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'same',
    };

    if (delta > 0) improved.push(diff);
    else if (delta < 0) regressed.push(diff);
    else unchanged.push(diff);
  }

  // Check for new/fixed issues by comparing check statuses
  const newIssues: string[] = [];
  const fixedIssues: string[] = [];

  const prevChecks = gatherChecks(previous);
  const currChecks = gatherChecks(current);

  for (const [id, status] of Object.entries(currChecks)) {
    const prevStatus = prevChecks[id];
    if (!prevStatus && (status === 'fail' || status === 'warn')) {
      newIssues.push(id);
    } else if ((prevStatus === 'fail' || prevStatus === 'warn') && status === 'pass') {
      fixedIssues.push(id);
    }
  }

  const improveSummary = improved.length > 0
    ? `✅ ${improved.length} score(s) improved (${improved.map((d) => `${d.label} +${d.delta}`).join(', ')}). `
    : '';
  const regressionSummary = regressed.length > 0
    ? `❌ ${regressed.length} score(s) dropped (${regressed.map((d) => `${d.label} ${d.delta}`).join(', ')}). `
    : '';
  const fixedSummary = fixedIssues.length > 0
    ? `✅ ${fixedIssues.length} issue(s) fixed. `
    : '';
  const newSummary = newIssues.length > 0
    ? `⚠️ ${newIssues.length} new issue(s) found.`
    : '';

  const summary = improveSummary + regressionSummary + fixedSummary + newSummary;

  return {
    hasChanges: improved.length > 0 || regressed.length > 0 || newIssues.length > 0 || fixedIssues.length > 0,
    improved,
    regressed,
    unchanged,
    newIssues,
    fixedIssues,
    summary: summary.trim() || 'No significant changes since last audit.',
  };
}

function gatherChecks(report: Partial<AuditReport>): Record<string, string> {
  const result: Record<string, string> = {};
  const modules = [report.onPage?.checks, report.offPage?.checks, report.geo?.checks, report.aeo?.checks, report.ssl?.checks];
  for (const checks of modules) {
    if (!checks) continue;
    for (const check of checks) {
      result[check.id] = check.status;
    }
  }
  return result;
}
