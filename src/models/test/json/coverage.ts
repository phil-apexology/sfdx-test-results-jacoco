import { CoverageResult } from './coverageResult';
import { CoverageRecord } from './coverageRecord';
import { CoverageSummary } from './coverageSummary';

export interface Coverage {
  coverage: CoverageResult[];
  records: CoverageRecord[];
  summary: CoverageSummary;
}
