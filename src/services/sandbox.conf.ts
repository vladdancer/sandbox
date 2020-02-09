import {set as __set} from "lodash";
import {unset as __unset} from "lodash";
import * as yaml from "js-yaml";
import * as fs from "fs";

export const setServiceSate = (definition: object, state: boolean) => {
  if (state) {
    __unset(definition, 'entrypoint');
    __unset(definition, 'restart');
  }
  else {
    __set(definition, 'entrypoint', ['echo', 'disabled service']);
    __set(definition, 'restart', 'no');
  }
};

const setVolumeDir = (definition, hostDir, containerDir, syncMode?, accessMode?: string) => {
  containerDir = containerDir || '/var/www/html';
  // - .:/var/www/project:cached
  // - .:/var/www/project:consistent
  // - .:/var/www/project:delegated
  //
  const mode = !syncMode ? '' : ':'+syncMode;
  __set(definition, 'volumes.0', `${hostDir}:${containerDir}${mode}`);
};

export const servicesTemplate = `
version: "3"
`;

export const provider = {
  "services": [
    {
      "id": "wodby/php",
      "phpVersion": "7.4",
      "imageTag": "4.14.0", // -dev-macos, -dev, -dev-xdebug
      "image": "${id}:${phpVersion}-${imageTag}",
      "enabled": true,
      "isWebAccessible": false,
      "hasHttps": true,
      "basicAuth": true
    }
  ],
  php: {
    "props": {
      "projectDir": {
        "question": {},
      },
      "volume": {
        "tplFunction": (definition: object, projectDir:string) => {
          setVolumeDir(definition, projectDir, '/var/www/html', 'cached');
        }
      },
      "state": {
        "tplFunction": setServiceSate
      }
    }
  }
};

export const build = () => {
  let doc = yaml.safeLoad(servicesTemplate);

  const service = doc.services.php;
  provider.php.props.volume.tplFunction(service, './code');
  provider.php.props.state.tplFunction(service, false);

  //fs.writeFileSync('./docker-compose.test.managed.yml', yaml.dump(doc));
  return yaml.dump(doc);
};

class Service {
  askState():void {}

  editInstance(): void {}

  // determine visual editor and suggest another
  editEnvInstance(): void {}
}

class WebAccessible {
  configure() {
    askState();
    askHttps();
    askAuth();
  }
}


