import {Command, flags} from '@oclif/command'
import * as path from "path";
import * as inquirer from 'inquirer';
import {
  baseUrlQuestion,
  editServicesQ,
} from "../questions";
import * as fs from "fs-extra";
import * as chalk from "chalk";
import {askSingleQ, InquirerPrompt} from "../common/utils";
import {checkUserQuestion as checkUserQ, getUser, OsUser, userExists} from "../common/user";
import to from "await-to-js";
import {
  badSandboxNameMsg,
  hasNoWhitespacesAndLess30chars, initSandboxObject, Sandbox, SandboxManager,
  sandBoxNameQuestion as sandBoxNameQ
} from "../common/sandbox";
import {buildSelectTemplateQuestion, buildServicesListQ} from "../common/service";
//import * as autocompletePrompt from "inquirer-autocomplete-prompt";
//import * as Config from "@oclif/config";

/**
 *  The process:
 *  - gather info
 *  -- path to sandbox
 *  -- id
 *  -- user name
 *  -- app template
 *  -- services list
 *  -- https + password
 *
 *  + create folder in user dir
 *  + generate docker-compose.yml
 *  - generate .env file
 *  - generate hosts template
 *  - suggest to download source code
 *  - add lists of hosts to the hosts file
 *  - register new services in traefik
 *  - run docker stack
 */
export default class New extends Command {
  static description = 'describe the command here';

  static examples = [
    `$ sandbox new dyno dev1`,
    `$ sandbox new workshop11 dev2`,
    `$ sandbox new ${chalk.dim('# you can skip both parameters, we can ask them in wizzard then')}`,
  ];

  static args = [
    {
      name: 'sandbox_name',
      description: chalk`The sandbox name. Used to create a project dir, or to be part of service URL
Fpr example, {green workshop11} becomes:
 -> dir: /home/dev1/sandboxes/{green workshop11}_snd,
 -> url: app.{green workshop11}.dev1.sandboxes-server.loc`
    },
    {
      name: 'user_name'
    }
  ];

  static flags = {
    help: flags.help({char: 'h'}),
  };

  private sandbox: Sandbox;

  /*constructor(argv: string[], config: Config.IConfig) {
    super(argv, config);
  }*/

  // TODO: ADD Params Validations!!!
  async run() {
    const {args, flags} = this.parse(New);
    const {sandbox_name, user_name} = args;

    // generate
    // docker-compose
    // docker-compose.override
    // .config/sandbox.yml

    // add to Registry

    // then checkSandbox health:
    // folder existing
    // ownership

    let sandbox = await this.initSandbox(sandbox_name, user_name);

    await this.promptUserName();
    await this.promptSandboxTemplate();
    await this.promptEnabledServices();
    //await this.promptConfigureServices();
    await this.createSandbox();
    console.log(this.sandbox);
    //this.showSandboxInformation();
    //this.promptNavigateSandbox();

    // just skip base url for the moment, hardcore it
    //questions.push(baseUrlQuestion);
  }

  async initSandbox(sandboxName: string, userName: string) {
    // validation https://github.com/imbrn/v8n
    // snd-trespa_dev-qweAqw ?
    let askForName = sandboxName === undefined;

    if (sandboxName !== undefined && !hasNoWhitespacesAndLess30chars(sandboxName)) {
      askForName = true;
      this.warn(badSandboxNameMsg);
    }

    if (askForName) {
      const [ err, answer ] = await to(askSingleQ(sandBoxNameQ));
      sandboxName = answer[sandBoxNameQ.name];
    }
    this.sandbox = initSandboxObject(sandboxName, userName)
    // todo: check sandbox for existence.
  }

  async promptUserName() {
    let userName = this.sandbox.devUser.name;
    let logMsg = '';

    if (userExists(userName)) {
      return;
    }

    if (userName !== '') {
      this.warn('This user is not exists, try different user name');
    }

    const [ err, answer ] = await to(askSingleQ(checkUserQ));
    this.sandbox.devUser.name = answer[checkUserQ.name];
  }

  async promptSandboxTemplate() {
    const templateQ = await buildSelectTemplateQuestion();
    const [ err, answer ] = await to(askSingleQ(templateQ));
    this.sandbox.template = answer[templateQ.name];
  }

  async promptEnabledServices() {
    const serviceListQ = buildServicesListQ(this.sandbox.template);
    const [ err, answer ] = await to(askSingleQ(serviceListQ));
    this.sandbox.services = answer[serviceListQ.name];
  }

  async createSandbox() {
    this.sandbox.devUser = getUser(this.sandbox.devUser.name);
    await SandboxManager.create(this.sandbox);
  }

  async promptConfigureServices() {
    // en/dis, version, auth, security

    //inquirer.registerPrompt('autocomplete', autocompletePrompt);
    if (__get(values, 'serviceList.length', false)) {
      await this.loopQuestion(editServicesQ);
    }
  }

  results(userName, sandboxDir, codeDir) {
    this.log(`
      devUser: ${userName}
      codeDir: ${codeDir},
      sandboxDir: ${sandboxDir},
    `);
  }
}
