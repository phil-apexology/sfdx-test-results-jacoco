import { Test } from './test';
import { Summary } from './summary';
import { Coverage } from './coverage';

export interface Result {
  summary: Summary;
  tests: Test[];
  coverage: Coverage;
}
