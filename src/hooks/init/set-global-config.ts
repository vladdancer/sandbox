import {Hook} from '@oclif/config'
import * as fs from "fs-extra";
import * as path from "path";
import to from "await-to-js";

const hook: Hook<'init'> = async function (opts) {
  const [err, userConfig] = await to (fs.readJSON(path.join(opts.config.configDir, 'config.json')));
  const [serr, sandboxes] = await to(fs.readJSON(path.join(opts.config.configDir, 'sandboxes.json')));

  global.config = {
    appConf: opts.config,
    userConf: userConfig || {},
    sandboxes: sandboxes || {}
  };
  // todo: expose log() functions of cli()
};

export default hook
