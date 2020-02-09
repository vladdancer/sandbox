import * as execa from "execa";
import {Sandbox} from "./sandbox";
import * as path from "path";
import {getConfigDir} from "./utils";
import * as child_process from "child_process";

export function execDockerMakeCmd(makeCmd, sandbox) {
  if (['up', 'down', 'prune', 'shell'].indexOf(makeCmd) === -1) {
    return;
  }
  const mkFile = path.join(getConfigDir(), 'services', 'docker.mk');
  const envfile = path.join(sandbox.path, '.env');
  const cmd = `cd ${sandbox.path} && make ENVFILE=${envfile} -f ${mkFile} ${makeCmd}`;
  const tt = child_process.execSync(cmd, {stdio: 'inherit'});
}

export function listDockerMakeCommands() {}

function useSudoPrompt() {
  //var sudo = require('sudo-prompt');
  //var options = {
    //name: 'Sandbox',
    //icns: '/Applications/Electron.app/Contents/Resources/Electron.icns', // (optional)
  //};
  /*const tests = sudo.exec(`cd ${sandbox.path} && make ENVFILE=${envfile} -f ${mkFile} ${cmd}`, options,
    function(error, stdout, stderr) {
      if (error) throw error;
      // stdout and stderr are readable streams
      console.log(stdout);
    }
  );*/

  //const mkFile = path.join(getConfigDir(), 'services', 'docker.mk');
  //const envfile = path.join(sandbox.path, '.env');

  /*execa( `/bin/bash`, ['-c', `cd ${sandbox.path} && make ENVFILE=${envfile} -f ${mkFile} ${cmd}`], {
    shell: true,
    stdio: 'inherit',
  });*/
}
