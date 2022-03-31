import * as os from 'os';
import * as fs from 'fs';
import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { Result } from '../../models/test/json/result';
import Builder from '../../models/jacoco/builder';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('sfdx-test-results-jacoco', 'convert');

export default class Convert extends SfdxCommand {
  public static description = messages.getMessage('commandDescription');

  public static examples = messages.getMessage('examples').split(os.EOL);

  // public static args = [{ input: 'file', output: 'file' }];

  protected static flagsConfig = {
    // flag with a value (-i, --input=VALUE)
    input: flags.string({
      char: 'i',
      description: messages.getMessage('inputFlagDescription'),
    }),
    // flag with a value (-o, --output=VALUE)
    output: flags.string({
      char: 'o',
      description: messages.getMessage('outputFlagDescription'),
    }),
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = false;

  // Comment this out if your command does not support a hub org username
  protected static supportsDevhubUsername = false;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  // eslint-disable-next-line @typescript-eslint/require-await
  public async run(): Promise<any> {
    const testReport = fs.readFileSync(this.flags.input, { encoding: 'utf-8' });
    const report: Result = JSON.parse(testReport);
    new Builder().build(report, { outputFile : this.flags.output });
  }
}
