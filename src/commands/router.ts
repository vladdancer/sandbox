import {Command, flags} from '@oclif/command'
import * as path from "path";
import * as execa from "execa";

export default class Router extends Command {
  static description = '$sandbox router start|stop|restart'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = [{name: 'command'}];

  async run() {
    const {args, flags} = this.parse(Router)

    const cmd = args.command;

    const routerDockerComposeFile = path.join(global.config.appConf.configDir, 'services', 'sandbox', 'traefik.yml');

    // docker-compose -f traefik.yml -f traefik.override.yml up
    await execa(`docker-compose -f ${routerDockerComposeFile}`, ['up', '-d'], {shell:true, stdin: 'inherit'});
  }
}
