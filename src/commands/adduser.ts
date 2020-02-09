import {Command, flags} from '@oclif/command'
import * as inquirer from 'inquirer';
import * as chalk from "chalk";
import {merge as __merge} from "lodash";
import {CreateUser} from "../tasks/createUser";
import {userExists} from "../common/user";

export default class AddUser extends Command {
  static description = 'Adds system user';

  static examples = [
    `$ sandbox adduser dev1`,
    `$ sandbox adduser ${chalk.dim('# you can skip username, we can ask them in wizzard then')}`,
  ];

  static args = [
    {
      name: 'user_name'
    }
  ];

  static flags = {
    help: flags.help({char: 'h'}),
  };

  async run() {
    const {args, flags} = this.parse(AddUser);
    let questions = [];
    let values = __merge({}, args);

    if (args.user_name !== undefined && userExists(args.user_name)) {
      this.warn('Such user is already exists');
    }

    if (args.user_name === undefined) {
      questions.push({
        type: 'input',
        name: 'user_name',
        message: 'Enter User name',
        async validate(input) {
          return new Promise((resolve, reject) => {
            if (input === '') {
              reject('Parameter can not be empty')
            }
            else if (userExists(input)) {
              reject('This user is alredy exists, try different user name')
            }
            resolve(true);
          });
        },
      });
    }

    if (questions.length > 0) {
      await inquirer
        .prompt(questions)
        .then(results => {
          values = __merge(values, results)
        });
    }

    console.log(values);
    const task = new CreateUser();
    task.do(this, values.user_name);
  }
}
