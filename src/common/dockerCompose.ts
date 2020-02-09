import {getStackTemplate} from "./service";
import {pickBy as __pickBy} from "lodash";
import * as fs from "fs-extra";
import * as path from "path";
import * as yaml from "js-yaml";
import {PathLike} from "fs";
import {getConfigDir} from "./utils";
import * as replaceInFile from "replace-in-file";

function validateFile() {
  // docker-compose config -q
  // docker-compose -f docker-compose.test.yml config -q
}

export async function createDockerComposeFile(sandboxPath:string, templateNamespace:string, services:string[]) {
  // todo: validate docker file
  // dockerCompose.validateFile()
  let template = getStackTemplate(templateNamespace)();
  template.services = __pickBy(template.services, (key, index) => services.indexOf(index) !== -1 ) || [];
  fs.writeFileSync(path.join(sandboxPath, 'docker-compose.yml'), yaml.dump(template));
  //await execa('open', [sandboxPath]);
}

export async function createDockerComposeEnvFile(sandboxPath:string, templateNamespace:string, variables: any[]) {
  const [stack, template] = templateNamespace.split(':', 2);
  const tplPath = path.join(getConfigDir(), 'services', stack, template, '.env.template');
  let envTemplate = fs.readFileSync(tplPath, 'utf-8');

  variables.forEach(el => {
    const re = new RegExp(`^([^\\#\\s]?${el.id})(=)(.+)?$`, 'm');
    envTemplate = envTemplate.replace(re, '$1=' + el.value);
  });
  fs.writeFileSync(path.join(sandboxPath, '.env'), envTemplate, 'utf-8');
}
