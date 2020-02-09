import * as child_process from "child_process";
import * as inquirer from "inquirer";
import {sandBoxNameQuestion} from "./sandbox";
import {DistinctQuestion, Inquirer} from "inquirer";
import {QuestionMap} from "inquirer";
import {get as __get, set as __set} from "lodash";
import * as path from "path";

export interface InquirerPrompt {
  name: string,
  type: string
    & {
    [prop: string]: any
  }
}
export const isNotEmpty = async (input: string, failMsg?: 'string') => {
  return new Promise((resolve, reject) => {
    input === ''
      ? reject(failMsg || 'Parameter can not be empty')
      : resolve(true);
  });
};

export function askSingleQ(question: any) {
  return inquirer.prompt([question]);
}



// TODO: make it configurable;
export const getSandboxesDir = () => {
  return 'sandboxes';
};

export const promptQuestionInLoop = async (question:any, exitKey:string, ctx:any, configurator?:Function): Promise<any> => {
  exitKey = exitKey || 'none';
  const results:inquirer.Answers = await inquirer.prompt([question]);
  const answer = __get(results, question.name, false);

  if (answer !== exitKey) {
    //__set(ctx, answer, 23);
    if (configurator) {
      await configurator(ctx, answer);
    }
    await promptQuestionInLoop(question, exitKey, ctx, configurator);
  }
};



async function renderTemplate(test) {
  //console.log(process.cwd());
  //console.log(swig);
  const tplPath = path.join(process.cwd(), 'templates', 'test.njk').toString();
  const tpl     = await swig.compileFile(tplPath);

  const compiled = tpl({externalVar: test});
  this.log(compiled);
}

export function getConfigDir() {
  // todo: provide defaults;
  return global.config.appConf.configDir;
}

export function logError(error: Error) {

}
