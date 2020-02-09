import {Signale} from "signale";
import * as child_process from "child_process";

const getUserHomeDir = (username: string) => {
  //userName = userName || child_process.spawnSync('id', ['-u', '-n'], {shell:true});

  const custom = new Signale({scope: 'tasks'});
  let userHome: false | string = false;

  try {
    const result = child_process.spawnSync(`echo ~${username}`, {shell:true});
    userHome = result.stdout.toString().replace(/\n$/, '');
  }
  catch (e) {
    custom.fatal(e);
  }
  return userHome;
};

export const checkUserQuestion = {
  type: 'input',
  name: 'user_name',
  message: 'Enter User name',
  async validate(input: string) {
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

export interface OsUser {
  name: string,
  id: number | false
  groupId: number | false,
  home?:string,
}

export const userExists = (userName:string) => {
  if (userName === undefined || userName.trim() === '') {
    return false;
  }

  try {
    execIdCmd(userName, 'userId');
    return true;
  }
  catch (e) {
    return false;
  }
};

const execIdCmd = (userName:string, idName:string): number => {
  const cliFlag = idName === 'userId' ? '-u' : '-g';
  const result = child_process.spawnSync('id', [cliFlag, userName], {
    shell: true
  });
  let err = result.stderr.toString() || false;
  if (err) {
    throw new Error(err);
  }
  return parseInt(result.stdout.toString());
};

export const getUser = (userName:string): OsUser => {
  let user:OsUser = {
    name: userName,
    id: false,
    groupId: false,
    home: getUserHomeDir(userName) || ''
  };

  try {
    user.id = execIdCmd(userName, 'userId');
  }
  catch (e) {
    return user;
  }
  if (user.id) {
    user.groupId = execIdCmd(userName, 'groupId');
  }
  return user;
};
