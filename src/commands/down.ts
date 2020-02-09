import {Command, flags} from '@oclif/command'
import {buildSandboxesListQ, SandboxManager} from "../common/sandbox";
import to from "await-to-js";
import {askSingleQ} from "../common/utils";
import {execDockerMakeCmd} from "../common/dockerMake";
import {map as __map, get as __get, find as __find, concat as __concat} from "lodash";

export default class Down extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  async run() {
    const sandboxes = SandboxManager.getSandboxes();

    const paths = __map(sandboxes, 'path');
    let question = buildSandboxesListQ(paths);
    question.choices = __concat(['current'], question.choices);
    const [ err, answer ] = await to(askSingleQ(question));
    let path = answer[question.name];

    if (path === 'current') {
      path = this.useCurrentSandbox(paths);
    }

    if (path) {
      const sandbox = __find(sandboxes, ['path', path]);
      execDockerMakeCmd('down', sandbox);
    }
    else {
      this.error('No sandbox was found');
    }

  }

  useCurrentSandbox(paths) {
    // - cmd?  sudo -u anya cd /Users/VladDancer/projects/UW/frank/web_app && make up
    const cwd = process.cwd();
    const snd = __map(paths, (el => {
      return cwd.indexOf(el) !== -1 ? el : false;
    })).filter(Boolean);
    return snd[0] || false;
  }
}
