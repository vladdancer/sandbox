import {Command, flags} from '@oclif/command'
import {buildSandboxesListQ, Sandbox, SandboxManager} from "../common/sandbox";
import {map as __map, get as __get, find as __find, concat as __concat} from "lodash";

import to from "await-to-js";
import {askSingleQ, getConfigDir, promptQuestionInLoop} from "../common/utils";
import {execDockerMakeCmd} from "../common/dockerMake";
import * as path from "path";
import * as fs from "fs-extra";
import * as yaml from "js-yaml";
import {buildEditServicesQ} from "./sr";
import * as inquirer from "inquirer";
import * as autocompletePrompt from "inquirer-autocomplete-prompt";
import {Inquirer} from "inquirer";



export default class Manage extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'n', description: 'name to print'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  }

  static args = [{name: 'command'}]

  async run() {
    const {args, flags} = this.parse(Manage)
    let sandbox;

    console.log(args);

    inquirer.registerPrompt('autocomplete', autocompletePrompt);




    const sandboxes = SandboxManager.getSandboxes();

    const paths = __map(sandboxes, 'path');
    let question = buildSandboxesListQ(paths);
    question.choices = __concat(['current'], question.choices);
    const [ err, answer ] = await to(askSingleQ(question));
    let path = answer[question.name];

    if (path === 'current') {
      const cwd = process.cwd();
      const snd = __map(paths, (el => {
        return cwd.indexOf(el) !== -1 ? el : false;
      })).filter(Boolean);
      path = snd[0] || false;
    }

    if (path) {
      sandbox = __find(sandboxes, ['path', path]);
    }
    else {
      this.error('No sandbox was found');
      return;
    }

    const doc = this.parseDockerComposeFile(sandbox);
    const list = Object.keys(doc.services);
    const cc = buildEditServicesQ(list);
    const servicesConf = {};
    const results = await promptQuestionInLoop(buildEditServicesQ(list), 'none', servicesConf, async (ctx, serviceId) => {
      await this.askServiceConfiguration('sassa', serviceId, ctx);
    });


  }

  parseDockerComposeFile(sandbox) {
    const tplPath = path.join(sandbox.path, 'docker-compose.yml');
    const file = fs.readFileSync(tplPath, 'utf-8');
    const doc = yaml.safeLoad(file);
    return doc;
  }

  async askServiceConfiguration(sandbox, serviceId, config) {
    this.log(`Configuring ${serviceId.toUpperCase()} service`);
    const configQuestions = this.buildServiceConfigQuestions(`frank:cake4:${serviceId}`);
    config[serviceId] = await inquirer.prompt(configQuestions);
  }

  buildServiceConfigQuestions(namespace:string) {
    const [stack, template, serviceId] = namespace.split(':', 3);

    const questionsSet = {
      frank: {
        cake4: {
          php: [
            stateQuestion(),
            versionQuestion(['7.4', '7.3', '7.2'], 'Select php version'),
            volumeMapQuestion('projectDir', `./code:/var/www/html`, 'Edit path to project dir')
          ],
          nginx: [
            stateQuestion(),
            webAccessQuestion(true),
          ]
        }
      }
    };
    return questionsSet[stack][template][serviceId];
  }
}

const stateQuestion = () => {
  return {
    type: 'confirm',
    name: 'state',
    message: 'Disable service',
    default: true,
  }
};

const versionQuestion = (versions, message) => {
  return {
    type: 'list',
    name: 'version',
    message: message,
    choices: versions
  }
};

const webAccessQuestion = (state?:boolean) => {
  return {
    type: 'confirm',
    name: 'web_access',
    message: 'Allow web access to this service by URL',
    default: state || false,
  }
}

const volumeMapQuestion = (key, map, message) => {
  return {
    type: 'input',
    name: key,
    message: message,
    default: map
  }
};

export function getServices(namespace: string) {
  let cache:any = {};

  return () => {
    let cached = __get(cache, namespace, false);
    if (cached) {
      console.log('template from cache');
      return cached;
    }
    const [stack, template] = namespace.split(':', 2);
    const tplPath = path.join(getConfigDir(), 'services', stack, template, 'docker-compose.template.yml');
    const stackTemplate = fs.readFileSync(tplPath, 'utf-8');
    cache[namespace] = yaml.safeLoad(stackTemplate);

    return cache[namespace];
  }
}
