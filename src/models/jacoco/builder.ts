import * as fs from 'fs';
import * as xml2js from 'xml2js';
import { Result } from '../test/json/Result';
import { SfdxProject } from '../project/json/sfdxProject';
import { Options } from './Options';
import { Package } from './package';

export default class Builder {
  build(testReport: Result, project: SfdxProject, options: Options): void {
    const packages = [];
    const packageMap = new Map<string, Package>();
    const filesToPackageMap = new Map<string, string>();
    const filesToPathMap = new Map<string, string>();

    for (const dir of project.packageDirectories) {
      const classFiles = this.getClassFiles('./' + dir.path, null);
      packageMap.set(dir.path, {
        name: dir.path,
        path: dir.path,
        classFiles,
        classes: [],
        sourceFiles: [],
      });

      for (const classFile of classFiles) {
        filesToPackageMap.set(classFile.substring(classFile.lastIndexOf('/') + 1), dir.path);
        filesToPathMap.set(classFile.substring(classFile.lastIndexOf('/') + 1), classFile);
      }
    }

    for (const coverageItem of testReport.coverage.coverage) {
      const coverageResult = coverageItem;
      const lines = [];
      const className = coverageResult.name;
      const fileName = className + '.cls';
      const filePath = filesToPathMap.get(fileName);
      // @ts-ignore
      for (const line in coverageResult.lines) {
        lines.push({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
          $: { nr: line, mi: coverageResult.lines[line] ? '0' : '1', ci: coverageResult.lines[line], mb: '0', cb: '0' },
        });
      }

      if (!(filesToPackageMap.get(fileName) && packageMap.get(filesToPackageMap.get(fileName)))) {
        // eslint-disable-next-line no-console
        console.log('not found');
        continue;
      }

      const packageFromMap = packageMap.get(filesToPackageMap.get(fileName));
      packageFromMap.classes.push({
        $: { name: coverageResult.name, sourcefilename: filePath },
      });

      packageFromMap.sourceFiles.push({
        $: { name: filePath },
        line: lines,
        counter: [
          {
            $: {
              type: 'LINE',
              missed: coverageResult.totalLines - coverageResult.totalCovered,
              covered: coverageResult.totalCovered,
            },
          },
          { $: { type: 'CLASS', missed: '0', covered: '1' } },
        ],
      });

      packageFromMap.classFiles.splice(packageFromMap.classFiles.indexOf(fileName), 1);
    }

    for (const pack of packageMap.keys()) {
      for (const classFile of packageMap.get(pack).classFiles) {
        packageMap.get(pack).classes.push({
          $: {
            name: classFile.substring(classFile.lastIndexOf('/') + 1, classFile.length - 4),
            sourcefilename: classFile,
          },
        });
        packageMap.get(pack).sourceFiles.push({
          $: { name: classFile },
          counter: [{ $: { type: 'CLASS', missed: '1', covered: '0' } }],
        });
      }

      packages.push({
        $: { name: packageMap.get(pack).name },
        sourcefile: packageMap.get(pack).sourceFiles,
        class: packageMap.get(pack).classes,
      });
    }

    const builder = new xml2js.Builder();

    const xml = builder.buildObject({
      report: {
        $: { name: testReport.summary.testRunId },
        package: packages,
        counter: [{ $: { type: 'line', missed: testReport.coverage.summary.totalLines - testReport.coverage.summary.coveredLines, covered: testReport.coverage.summary.coveredLines } }],
      },
    });

    fs.writeFileSync(options.outputFile, xml);
  }

  private getClassFiles(dir: string, filesIn: string[]): string[] {
    let files: string[] = [];
    if (filesIn !== null) {
      files = filesIn;
    }
    const currentDirectoryFiles = fs.readdirSync(dir);
    for (const file of currentDirectoryFiles) {
      const name = dir + '/' + file;
      if (fs.statSync(name).isDirectory()) {
        this.getClassFiles(name, files);
      } else if (
        name.toLowerCase().indexOf('/classes/') >= 0 &&
        name.toLowerCase().indexOf('/test/') === -1 &&
        name.toLowerCase().indexOf('/tests/') === -1 &&
        name.toLowerCase().indexOf('.cls') >= 0 &&
        name.toLowerCase().indexOf('.cls-meta.xml') === -1
      ) {
        files.push(name);
      }
    }
    return files;
  }
}
