import {Command} from "@oclif/command";


export abstract class BasicTask {
  abstract do(...args:any[]): void;
}
