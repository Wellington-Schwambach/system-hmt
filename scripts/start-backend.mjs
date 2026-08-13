import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const backendDirectory = path.join(projectRoot, 'backend');
const publicDirectory = path.join(backendDirectory, 'public');
const routerFile = path.join(
  backendDirectory,
  'vendor',
  'laravel',
  'framework',
  'src',
  'Illuminate',
  'Foundation',
  'resources',
  'server.php',
);

function fail(message) {
  console.error(`\n[BACKEND] ${message}\n`);
  process.exit(1);
}

const phpVersion = spawnSync('php', ['-r', 'echo PHP_VERSION;'], {
  encoding: 'utf8',
  shell: false,
});

if (phpVersion.error || phpVersion.status !== 0) {
  fail('PHP não foi encontrado no PATH. Instale/configure o PHP e abra o terminal novamente.');
}

if (!existsSync(path.join(backendDirectory, '.env'))) {
  fail('O arquivo backend/.env não foi encontrado. Copie backend/.env.example para backend/.env.');
}

if (!existsSync(path.join(backendDirectory, 'vendor', 'autoload.php')) || !existsSync(routerFile)) {
  fail('As dependências do Laravel não foram encontradas. Execute: cd backend && composer install');
}

const pgsqlCheck = spawnSync(
  'php',
  ['-r', "exit(extension_loaded('pdo_pgsql') ? 0 : 1);"],
  { shell: false },
);

if (pgsqlCheck.status !== 0) {
  fail(
    'A extensão pdo_pgsql do PHP está desativada. Ative extension=pdo_pgsql no php.ini e reinicie o terminal.',
  );
}

console.log(`[BACKEND] PHP ${phpVersion.stdout.trim()}`);
console.log('[BACKEND] Laravel disponível em http://127.0.0.1:8000');
console.log('[BACKEND] Uploads: até 12 MB por arquivo / 50 MB por requisição no ambiente local');

const server = spawn(
  'php',
  [
    '-d', 'upload_max_filesize=12M',
    '-d', 'post_max_size=50M',
    '-d', 'max_file_uploads=20',
    '-S', '127.0.0.1:8000', '-t', '.', routerFile,
  ],
  {
    cwd: publicDirectory,
    stdio: 'inherit',
    shell: false,
  },
);

server.on('error', (error) => {
  fail(`Não foi possível iniciar o PHP: ${error.message}`);
});

server.on('exit', (code, signal) => {
  if (signal) {
    process.exit(0);
  }

  process.exit(code ?? 0);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    if (!server.killed) {
      server.kill(signal);
    }
  });
}
