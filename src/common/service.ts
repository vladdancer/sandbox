
// add this custom service to the global conf
import * as fs from "fs-extra";
import * as path from "path";
import * as yaml from "js-yaml";
import {getConfigDir} from "./utils";
import {get as __get} from "lodash";

function createService() {}

function deleteService() {}

// add service for specific sandbox, or reimport it
function addService() {}

// edit state, volumes, and other basic params
// -mode basic, full
function editService() {}

function removeService() {}

// open service definition as yml in editor and edit it. Store as tmp file and validate it.
function editServiceDefinition() {}

function listServices() {}

function listAllServices() {}

// --------------- //

export const buildSelectTemplateQuestion = async () => {
  return {
    // todo: make it as autocomplete
    type: 'list',
    name: 'template',
    message: 'Choose which stack template to use',
    choices: [
      'frank:cake4',
      'wodby:drupal-php'
    ],
  }
};

export const buildServicesListQ = (namespace: string) => {
  const services = getServicesFromTemplate(namespace)();
  return {
    // todo: make it as autocomplete
    type: 'checkbox',
    name: 'serviceList',
    message: 'Choose which services to use',
    choices: Object.keys(services),
    // todo: get default service from stack provider.
    // Choices marked as {checked: true} will be checked by default.
  }
};

export function getStackTemplate(namespace: string) {
  let cache:any = {};

  return () => {
    let cached = __get(cache, namespace, false);
    if (cached) {
      console.log('template from cache');
      return cached;
    }
    const [stack, template] = namespace.split(':', 2);
    const tplPath = path.join(getConfigDir(), 'services', stack, template, 'docker-compose.template.yml');
    const stackTemplate = fs.readFileSync(tplPath, 'utf-8');
    cache[namespace] = yaml.safeLoad(stackTemplate);

    return cache[namespace];
  }
}

export function getServicesFromTemplate(namespace: string) {
  let cache:any = {};

  return () => {
    let services = __get(cache, namespace, false);
    if (services) {
      console.log('from cache');
      return services;
    }
    const template = getStackTemplate(namespace)();
    cache[namespace] = __get(template, 'services', false);
    return cache[namespace];
  }
}


