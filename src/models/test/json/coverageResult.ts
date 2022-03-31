export interface CoverageResult {
  id: string;
  name: string;
  totalLines: number;
  totalCovered: number;
  coveredPercent: number;
  lines: never;
}
