import {BasicTask} from "./basicTask";
import {Command} from "@oclif/command";
import * as fs from "fs-extra";
import * as path from "path";
import {Signale} from "signale";
import * as child_process from "child_process";
import {build} from "../services/sandbox.conf";
import {getSandboxesDir, getUser, OsUser} from "../common/utils";


export class CreateSandbox extends BasicTask {
  private user: OsUser;
  private cli: Command;

  constructor(cli:Command, userName:string) {
    super();
    this.cli = cli;
    this.user = getUser(userName);
  }

  do(folderName:string): string | void {
    if (!Boolean(this.user.id)) {
      const err = `Not valid user with name: ${this.user.name}`;
      this.cli.log(err);
      throw new Error(err);
    }
    folderName = `${folderName}_snd`;
    // todo: add function to build user sandbox path based on current app config.
    const sandboxPath = path.join(this.getUserHomeDir(this.user.name) || global.config.appConf.home, 'sandboxes', folderName);

    this.cli.log('Creating sandbox directory...');
    let dir:string | false = false;

    if (this.checkProjectDir(sandboxPath)) {
      this.cli.warn(`${folderName} is already exists. Skipped`);
      dir = sandboxPath;
    }
    else {
      dir = this.createSandboxDir(sandboxPath);
    }

    if (dir) {
      // todo: catch errors
      this.createConfigs(dir);
    }
    return sandboxPath;
  }

  checkProjectDir(sandboxPath: string) {
    const custom = new Signale({scope: 'tasks'});

    try {
      return fs.existsSync(sandboxPath);
    }
    catch (e) {
      custom.fatal(e);
      return;
    }
  }

  /**
   * Should be based on services definitions.
   * It means that we need some class to retrieve any service here.
   * todo: embed some default services, or on CLI install phase we need to download them from git and store in global dir.
   * @param sandboxPath
   */
  createConfigs(sandboxPath: string) {
    const configDir = path.join(getSandboxesDir(), '.config');
    fs.mkdirpSync(configDir);
    fs.writeFileSync(path.join(configDir, 'docker-compose.yml'), fs.readFileSync(global.config.appConf.configDir + '/services/frank/services.default.yml'));
    //const overrides = build();
    //fs.writeFileSync(path.join(configDir, 'docker-compose.override.yml'), overrides);
  }

  createSandboxDir(path:string) {
    const custom = new Signale({scope: 'tasks'});

    try {
      fs.mkdirpSync(path);
      custom.success('Added sandboxes dir');
      const {id, groupId} = this.user;

      if (id && groupId) {
        // todo: catch error.
        fs.chown(path, id, groupId);
        this.cli.log(`Changed sandbox ownership to ${id}:${groupId}`);
      }
      return path;
    }
    catch (e) {
      custom.fatal(e.toString());
    }
    return false;
  }

  addConfigFile() {
    // put project name and other meta information, maybe services list
  }

  buildDockerComposeFile(servicesList: any[]) {}

}
