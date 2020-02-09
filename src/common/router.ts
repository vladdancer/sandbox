import {getStackTemplate} from "./service";
import * as _ from "lodash";
import * as fs from "fs-extra";
import * as path from "path";
import * as yaml from "js-yaml";
import {Sandbox} from "./sandbox";
import {getConfigDir} from "./utils";
import * as execa from "execa";

interface RouterManager {
  up(): void;

  down(): void;

  restart(): void;

  addNetwork(): void;

  removeNetwork(): void;

  list(): void;

  selfCheck(): void;
}



export function registerNetwork(sandbox:Sandbox) {
  const routerConfFilePath = path.join(getConfigDir(), 'services', 'sandbox', 'traefik.yml');
  let conf = yaml.safeLoad(fs.readFileSync(routerConfFilePath).toString('utf-8'));

  let networks = _.get(conf, 'services.traefik.networks', false);
  const networkName = `${sandbox.sandboxDirName}_default`.toLowerCase();

  if (networks) {
    const exists = networks.indexOf(networkName) !== -1;
    if (exists) {
      return;
    }
  }
  else {
    _.set(conf, 'services.traefik.networks', []);
    _.set(conf, 'networks', {});
  }

  conf.services.traefik.networks.push(networkName);
  _.set(conf, `networks.${networkName}.external.name`, networkName);

  execa('docker', ['network', 'create', networkName], {shell: true, stdin:'inherit', stderr: 'inherit'})

  fs.writeFileSync(routerConfFilePath, yaml.dump(conf));
}
