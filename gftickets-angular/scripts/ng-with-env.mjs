import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadEnvFile } from 'node:process';

const ENVIRONMENT_VARIABLES = [
  'VITE_API_URL',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const environmentFile = fileURLToPath(new URL('../.env', import.meta.url));
if (existsSync(environmentFile)) {
  loadEnvFile(environmentFile);
}

const missingVariables = ENVIRONMENT_VARIABLES.filter(
  (variableName) => !process.env[variableName]?.trim(),
);
if (missingVariables.length > 0) {
  console.error(
    `Faltan variables de entorno requeridas: ${missingVariables.join(', ')}. ` +
      'Crea gftickets-angular/.env a partir de .env.example o configúralas en el despliegue.',
  );
  process.exit(1);
}

const [command, ...commandArguments] = process.argv.slice(2);
if (!command) {
  console.error('Debes indicar un comando de Angular, por ejemplo: serve, build o test.');
  process.exit(1);
}

const angularCli = fileURLToPath(
  new URL('../node_modules/@angular/cli/bin/ng.js', import.meta.url),
);
const environmentDefinitions =
  command === 'test'
    ? []
    : ENVIRONMENT_VARIABLES.map(
        (variableName) =>
          `--define=import.meta.env.${variableName}=${JSON.stringify(process.env[variableName])}`,
      );
const result = spawnSync(
  process.execPath,
  [angularCli, command, ...environmentDefinitions, ...commandArguments],
  { stdio: 'inherit' },
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
