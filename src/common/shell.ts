import * as child_process from "child_process";


const result = child_process.spawnSync('make', ['up'], {
  shell: true
});

let err = result.stderr.toString() || false;
if (err) {
  throw new Error(err);
}
console.log(result.stdout.toString());


// https://medium.com/redbubble/running-a-docker-container-as-a-non-root-user-7d2e00f8ee15
