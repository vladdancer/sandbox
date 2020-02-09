import {InquirerPrompt, isNotEmpty} from "./utils";
import * as path from "path";
import * as shortId from "shortid";
import {OsUser} from "./user";
import to from "await-to-js";
import {Signale} from "signale";
import * as fs from "fs-extra";
import {PathLike} from "fs";
import * as Listr from "listr";
import * as execa from "execa";

import {
  pickBy as __pickBy,
  set as __set,
  get as __get,
  map as __map,
} from "lodash";

import {getStackTemplate} from "./service";
import * as yaml from "js-yaml";
import {createDockerComposeEnvFile, createDockerComposeFile} from "./dockerCompose";
import {registerNetwork} from "./router";


export interface Sandbox {
  services: any[],
  devUser: OsUser,
  codeDir: PathLike,
  sandboxName: string,
  sandboxDir: PathLike,
  sandboxDirName: string,
  baseUrl?: string,
  template: string,
  shortId?: string,
}

export enum SandboxMode {
  PER_USER = 'per_user',
  CURRENT_USER = 'current_user',
}

interface SandboxInterface {
  // provides commands to manage current sandbox and other sandboxes from any dir.

  // start sandbox
  up(): void;

  down(): void

  create(): void

  list(): void

  // remove sandbox from registry without deleting folder,
  // optionaly suggest to move folder to the trash.
  // opt, suggest to compile docker-compose and docker-compose.overrides into one file
  eject(): void

  // create sandbox from existing folder?
  import(): void

  // suggest user to navigate to the folder
  info(sandboxId?: string): void
}

export class SandboxManager {
  static async create(sandbox:Sandbox) {
    const userHome = sandbox.devUser.home || global.config.appConf.home;
    console.log(global.config.userConf);
    const baseUrl = global.config.userConf.baseUrl;
    sandbox.shortId = shortId.generate();
    const sandboxPath = SandboxManager.buildSandboxPath(sandbox.sandboxName, sandbox.shortId, userHome);
    sandbox.sandboxDirName = SandboxManager.buildSandboxDirName(sandbox.sandboxName, sandbox.shortId);
    const exists = SandboxManager.checkSandboxDir(sandboxPath);

    if (exists) {
      throw new Error('Folder is already exists');
    }
    //const tasks = SandboxManager.createTasks(sandboxPath, sandbox.devUser);
    //tasks.run();
    sandbox.sandboxDir = SandboxManager.createSandboxDir(sandboxPath, sandbox.devUser);
    sandbox.codeDir = './code';
    await createDockerComposeFile(sandboxPath, sandbox.template, sandbox.services);
    await createDockerComposeEnvFile(sandboxPath, sandbox.template, [
      {id: 'PROJECT_NAME', value: sandbox.sandboxDirName},
      {id: 'PROJECT_BASE_URL', value: `${sandbox.sandboxDirName}.${baseUrl}`}
    ]);
    SandboxManager.registerSandbox(sandbox);
  }

  static buildSandboxDirName(sandboxName:string, shortId: string) {
    return `snd_${sandboxName}_${shortId}`;
  }
  static buildSandboxPath(sandboxName:string, shortId: string, userHome:PathLike) {
    const folderName = SandboxManager.buildSandboxDirName(sandboxName, shortId);
    // todo: add function to build user sandbox path based on current app config.
    return path.join(userHome.toString(), 'sandboxes', folderName);
  };

  static checkSandboxDir(sandboxPath: string) {
    const custom = new Signale({scope: 'tasks'});

    try {
      return fs.existsSync(sandboxPath);
    }
    catch (e) {
      custom.fatal(e);
      return;
    }
  }

  static createSandboxDir(path:string, user:OsUser) {
    const custom = new Signale({scope: 'tasks'});

    try {
      fs.mkdirpSync(path);
      custom.success('Added sandboxes dir');
      const {id, groupId} = user;

      if (id && groupId) {
        // todo: catch error.
        fs.chown(path, id, groupId);
        console.log(`Changed sandbox ownership to ${id}:${groupId}`);
      }
      return path;
    }
    catch (e) {
      custom.fatal(e.toString());
    }
    return false;
  }

  static registerSandbox(sandbox:Sandbox) {
    try {
      let sandboxes = __get(global.config, 'sandboxes', []);
      sandboxes.push({id: sandbox.shortId, name: sandbox.sandboxName, path: sandbox.sandboxDir, user: sandbox.devUser.name});
      __set(global.config, 'sandboxes', sandboxes);
      fs.writeJSONSync(path.join(global.config.appConf.configDir, 'sandboxes.json'), sandboxes);
    }
    catch (e) {
      console.log(e);
      return;
    }

    registerNetwork(sandbox);
    // register in app config
    // - path to dir
    // - cmd?  sudo -u anya cd /Users/VladDancer/projects/UW/frank/web_app && make up
  }

  static getSandboxes() {
    return __get(global.config, 'sandboxes', []);
  }

  static createConfigFile(path) {
    fs.mkdirpSync(path.join(path, '.config', 'sandbox.yml'));
  }

  static findConfigFile(path) {
    const filePath = path.join(path, '.config', 'sandbox.yml');
    // check in root
    fs.existsSync(filePath);
    // else list all sandboxes and compare process.cwd() with sandboxes paths.
  }

}


export const hasNoWhitespacesAndLess30chars = (input:string) => {
  input = input || '';
  return !!input.match(/^[a-zA-Z0-9_-]{3,30}$/g);
};

export const badSandboxNameMsg = 'Sandbox folder name should be alphanumeric,\nand should contains 3 and max 30 chars.\nNo whitespaces allowed';


export const sandBoxNameQuestion = {
  type: 'input',
  name: 'name',
  message: 'Enter project name',
  async validate(input: string) {
    return new Promise((resolve, reject) => {
      hasNoWhitespacesAndLess30chars(input)
        ? resolve(true)
        : reject(badSandboxNameMsg);
    });
  },
};

export const buildSandboxesListQ = (choices: string[]) => {
  return {
    // todo: make it as autocomplete
    type: 'list',
    name: 'sandboxesList',
    message: 'Choose which sandbox to use',
    choices: choices
  }
};

export function initSandboxObject(sandboxName:string, userName:string): Sandbox {
  return {
    devUser: {name: userName || '', id: false, groupId: false},
    sandboxName: sandboxName,
    services: [],
    codeDir: '',
    sandboxDir: '',
    template: '',
    sandboxDirName:'',
  };
}
