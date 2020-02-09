import {Command, flags} from '@oclif/command'
import * as fs from "fs-extra";
import * as yaml from "js-yaml";
import * as fuzzy from "fuzzy";

import {map as __map,
  random as __random,
  concat as __concat,
  pickBy as __pickBy,
  get as __get
} from "lodash";

import {editServicesQ, services} from "../questions";
import * as inquirer from "inquirer";
import * as autocompletePrompt from "inquirer-autocomplete-prompt";
import * as path from "path";
import {build, servicesTemplate, setServiceSate} from "../services/sandbox.conf";
import {buildServicesListQ} from "../common/service";

/*export const getStackTemplate = () => {
  const stackTemplate = fs.readFileSync(path.join(global.config.appConf.configDir, 'services', 'frank', 'services.default.yml'), 'utf-8');
  return yaml.safeLoad(stackTemplate);
};*/

export const getServicesMeta = () => {
  const stackTemplate = fs.readFileSync(path.join(global.config.appConf.configDir, 'services', 'frank', 'services.meta.yml'), 'utf-8');
  return yaml.safeLoad(stackTemplate);
};

/*
export const buildServicesListQ = (services: any[]) => {
  return {
    // todo: make it as autocomplete
    type: 'checkbox',
    name: 'serviceList',
    message: 'Choose which services to use',
    choices: services,
    // todo: get default service from stack provider.
    //default: ['none']
  }
};
*/

export const buildEditServicesQ = (services) => {
  services = __concat(['none'], services);

  return {
    type: 'autocomplete',
    name: 'editService',
    message: 'Choose service to edit, or use None to skip',
    source: function(answers, input: string) {
      input = input || '';
      return new Promise((resolve, reject) => {
        setTimeout(function() {
          const filtered = fuzzy.filter(input, services);
          resolve(
            filtered.map(function(el) {
              return el.original;
            })
          );
        }, __random(30, 500));
      });
    },
    default: ['none']
  };
};

export default class Sr extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
  }

  static args = [{name: 'stack'}];

  async run() {
    inquirer.registerPrompt('autocomplete', autocompletePrompt);
    //console.log(global.config);

    let template = getStackTemplate();
    let services = __get(template, 'services', []);

    const {serviceList: enabledServices} = await inquirer.prompt(
      buildServicesListQ(Object.keys(services))
    );
    console.log(enabledServices);

    if (enabledServices.length > 0) {
      const question = buildEditServicesQ(enabledServices);
      const results = await promptQuestioninLoop(question);
    }
    else {
      return;
    }

    this.prepareConfFile(template, enabledServices);
    this.prepareConfOverrideFile(enabledServices);

  }

  prepareConfFile(template, serviceList) {
    //const overrides = build();
    const AppConfigDir = global.config.appConf.configDir;
    //template.services = {};

    template.services = __pickBy(template.services, (key, index) => serviceList.indexOf(index) !== -1 ) || [];

    console.log(template);
    //fs.writeFileSync(path.join(configDir, 'docker-compose.override.yml'), overrides);
  }

  prepareConfOverrideFile(serviceList) {
    let tpl = yaml.safeLoad(servicesTemplate);
    tpl.services = {};
    serviceList.forEach((serviceId) => {
      tpl.services[serviceId] = {
        labels: ['sandbox.managed=true']
      };
      setServiceSate(tpl.services[serviceId], true);
    });

    console.log(yaml.dump(tpl));
  }
}



async function promptQuestioninLoop(questions) {
  const results = await inquirer.prompt(questions);

  if (results.editService !== 'none') {
    console.log(`We need to edit service ${results.editService}`);
    promptQuestioninLoop(questions);
  }
  else {
    return true;
  }
}

const buildServiceStateQuestion = () => {};
