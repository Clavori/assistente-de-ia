import { spawn } from 'child_process';

async function main() {
  console.log('🚀 Iniciando ambiente Atende AI (AndradeStudio)...');

  // 1. Start Worker process (Baileys WhatsApp & background jobs)
  console.log('🤖 Inicializando processo Worker (WhatsApp & Tarefas em Segundo Plano)...');
  const workerProcess = spawn('node', ['node_modules/tsx/dist/cli.mjs', 'src/worker.ts'], {
    stdio: 'inherit'
  });

  workerProcess.on('error', (err) => {
    console.warn('Aviso no worker:', err.message);
  });

  // 2. Start Next.js web application
  console.log('🌐 Inicializando Next.js em http://localhost:3000...');
  const nextProcess = spawn('node', ['node_modules/next/dist/bin/next', 'dev'], {
    stdio: 'inherit'
  });

  nextProcess.on('exit', (code) => {
    try { workerProcess.kill(); } catch {}
    process.exit(code || 0);
  });
}

main().catch(console.error);
