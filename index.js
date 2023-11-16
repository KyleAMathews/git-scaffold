#!/usr/bin/env node

const degit = require("degit");
const { spawn } = require("child_process");

const gitRepo = process.argv[2];
const destination = process.argv[3];

async function spawnProcess(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args);
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    child.on("exit", function (code, signal) {
      resolve();
    });

    child.on("error", function (err) {
      reject(err);
    });
  });
}

const emitter = degit(gitRepo, {
  cache: true,
  force: true,
  verbose: true,
});

emitter.on("info", (info) => {
  if (info.message.includes(`cloned`)) {
    console.log(info.message);
  }
});

emitter.clone(destination).then(async () => {
  process.chdir(destination);

  // Run npm install
  try {
    console.log(`\nRunning npm install\n`);
    await spawnProcess(`npm`, [`install`]);

    console.log(`\n`);
    await spawnProcess(`git`, [`init`]);

    console.log(
      `\n-----\n\nSetup done\n\nType "cd ${destination}" to go to your new project`
    );
  } catch (e) {
    console.log(e);
  }
});
