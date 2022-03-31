import { ApexClass } from './apexClass';

export interface Test {
  id: string;
  queueItemId: string;
  stackTrace: string;
  message: string;
  asyncApexJobId: string;
  methodName: string;
  outcome: string;
  apexClass: ApexClass;
  runTime: number;
  fullName: string;
}
