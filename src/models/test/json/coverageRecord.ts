import { ApexTestClass } from './apexTestClass';
import { CoverageLocations } from './coverageLocations';
import { ApexClass } from './apexClass';

export interface CoverageRecord {
  apexTestClass: ApexTestClass;
  coverage: CoverageLocations;
  TestMethodName: string;
  NumLinesCovered: number;
  ApexClassOrTrigger: ApexClass;
  NumLinesUncovered: number;
}
