import * as fs from 'fs';
import * as xml2js from 'xml2js';
import { Result } from '../test/json/Result';
import { Options } from './Options';

export default class Builder {
  build(testReport: Result, options: Options): void {
    const sourceFiles = [];
    const classes = [];

    for (const coverageItem of testReport.coverage.coverage) {
      const coverageResult = coverageItem;

      const lines = [];

      // @ts-ignore
      for (const line in coverageResult.lines) {
        lines.push({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
          $: { nr: line, mi: coverageResult.lines[line], ci: coverageResult.lines[line], mb: '0', cb: '0' },
        });
      }

      classes.push({
        $: { name: coverageResult.name, sourcefilename: coverageResult.name + '.cls' },
      });

      sourceFiles.push({
        $: { name: coverageResult.name + '.cls' },
        line: lines,
        counter: [
          {
            $: {
              type: 'LINE',
              missed: coverageResult.totalLines - coverageResult.totalCovered,
              covered: coverageResult.totalCovered,
            },
          },
          { $: { type: 'class', missed: '0', covered: '1' } },
        ],
      });
    }

    const builder = new xml2js.Builder();

    const xml = builder.buildObject({
      report: {
        $: { name: testReport.summary.testRunId },
        package: {
          $: { name: 'salesforce' },
          sourcefile: sourceFiles,
          class: classes,
          counter: [{ $: { type: 'line', missed: testReport.coverage.summary.totalLines - testReport.coverage.summary.coveredLines, covered: testReport.coverage.summary.coveredLines } }],
        },
        counter: [{ $: { type: 'line', missed: testReport.coverage.summary.totalLines - testReport.coverage.summary.coveredLines, covered: testReport.coverage.summary.coveredLines } }],
      },
    });

    fs.writeFileSync(options.outputFile, xml);
  }
}
