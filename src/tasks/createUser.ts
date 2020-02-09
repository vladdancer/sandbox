import {BasicTask} from "./basicTask";
import {Command} from "@oclif/command";
import {Signale} from "signale";
import * as signale from "signale";
import * as fs from "fs-extra";
import * as path from "path";
import * as child_process from "child_process";



export class CreateUser extends BasicTask {

  do(cli:Command, username:string) {
    const custom = new Signale({scope: 'tasks'});

    cli.log('Creating user...');

    // todo: add config var to detect sandbox server mode: multiple users or single one.
    if (global.config.appConf.platform !== 'linux') {
      //cli.log('Creating user was skipped');
      cli.warn('Skipped, not a linux');
      return;
    }

    try {
      const result = child_process.spawnSync('useradd', [username], {
        shell: true
      });
      console.log(result);
      custom.success('Creating user done');
    }
    catch (e) {
      cli.error(e);
      return false;
    }

    cli.log('Creating user done');
  }
}
