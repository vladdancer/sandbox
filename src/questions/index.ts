import * as fuzzy from "fuzzy";
import {map as __map} from "lodash";
import {random as __random} from "lodash";
import {userExists} from "../common/utils";
import * as fs from "fs-extra";
import * as path from "path";
import * as yaml from "js-yaml";


const isNotEmpty = async (input: string, failMsg?: 'string') => {
  return new Promise((resolve, reject) => {
    input === ''
      ? reject(failMsg || 'Parameter can not be empty')
      : resolve(true);
  });
};

export const projectQuestion = {
  type: 'input',
  name: 'name',
  message: 'Enter project name',
  async validate(input) {
    return await isNotEmpty(input);
  },
};
export const userQuestion = {
  type: 'input',
  name: 'user_name',
  message: 'Enter User name',
  async validate(input) {
    return new Promise((resolve, reject) => {
      if (input === '') {
        reject('Parameter can not be empty')
      }
      else if (! userExists(input)) {
        reject('This user is not exists, try different user name')
      }
      resolve(true);
    });
  },
};

export const baseUrlQuestion = {
  type: 'input',
  name: 'server_url',
  message: 'Enter Server base url',
  async validate(input) {
    return await isNotEmpty(input, "Server url can't be empty.");
  },
};

export const servicesQuestion = {
  name: 'serviceList',
  type: 'checkbox',
  message: 'Choose which services to use',
  choices: [
    {
      name: 'PHP',
      value: 'php',
    },
    {
      name: 'IDE',
      value: 'ide',
    }
  ],
  default: ['ide']
};

export const services = [
  {
    name: 'None',
    value: 'none',
  },
  {
    name: 'PHP',
    value: 'php',
  },
  {
    name: 'IDE',
    value: 'ide',
  }
];

export const editServicesQ = {
  type: 'autocomplete',
  name: 'editService',
  message: 'Choose service to edit, or use None to skip',
  source: function(answers, input: string) {
    input = input || '';
    return new Promise((resolve, reject) => {
      setTimeout(function() {
        const filtered = fuzzy.filter(input, __map(services, 'name'));
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

export const testEditor = {
  type: 'editor',
  name: 'test_editor',
  message: 'Edit services'
};

// do you want to add custom service?
// do you want to change service version? N/ServiceId

// -o mem=22 -o cpu=3 -o kk=345

//🍚  Launching new project [toktest] with Drupal template [drupal8-basic]
//⠏   Downloading and unpacking template...
