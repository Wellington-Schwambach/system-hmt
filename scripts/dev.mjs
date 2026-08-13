import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const backend = spawn(process.execPath, [path.join(scriptDirectory, 'start-backend.mjs')], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: false,
});

const frontend = spawn(npmCommand, ['run', 'dev:frontend'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: false,
});

const children = [backend, frontend];
let finishing = false;

function stopAll(exitCode = 0) {
  if (finishing) return;
  finishing = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }

  setTimeout(() => process.exit(exitCode), 150).unref();
}

for (const child of children) {
  child.on('error', (error) => {
    console.error(`Não foi possível iniciar o ambiente: ${error.message}`);
    stopAll(1);
  });

  child.on('exit', (code, signal) => {
    if (!finishing && !signal && code !== 0) {
      stopAll(code ?? 1);
    }
  });
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => stopAll(0));
}
