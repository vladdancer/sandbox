import {Command, flags} from '@oclif/command'
import * as yaml from "js-yaml";
import * as fs from "fs";
import {build} from "../services/sandbox.conf";

export default class Hello extends Command {
  static description = 'describe the command here'

  static examples = [
    `$ sandbox hello
hello world from ./src/hello.ts!
`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'n', description: 'name to print'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  }

  static args = [{name: 'file'}]

  async run() {
    const {args, flags} = this.parse(Hello);
    let doc;

    /*try {
      doc = yaml.safeLoad(fs.readFileSync('./docker-compose.test.yml', 'utf8'));
    } catch (e) {
      console.log(e);
    }*/
    build();

  }
}
