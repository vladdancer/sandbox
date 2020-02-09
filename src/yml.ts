import * as yaml from "js-yaml";

const services = {
  ide: {
    container_name: 'tets',
    command: "${HOME_PATH}/${PROJECT_NAME}/code:/var/www/html",
    labels: [
      'traefik.enabled=true',
      'traefik.http.routers',
    ],
  }
}

console.log(yaml.dump(services, {
  flowLevel: 3,
  styles: {
    '!!int'  : 'hexadecimal',
    '!!null' : 'camelcase'
  }
}));
