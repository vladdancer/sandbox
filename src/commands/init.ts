import {Command, flags} from '@oclif/command'
import * as inquirer from "inquirer";
import * as fs from "fs-extra";
import * as path from "path";

export default class Init extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    const {args, flags} = this.parse(Init)

    const answers = await inquirer.prompt([{
      type: 'input',
      name: 'baseUrl',
      message: 'Enter sandboxes server base URL, ex. sandboxes.dev-company.com'
    }]);

    let config = global.config.userConf || {};
    config.baseUrl = answers.baseUrl;
    fs.writeJSONSync(path.join(global.config.appConf.configDir, 'config.json'), config);
  }
}
