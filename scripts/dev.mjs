import { spawn } from 'child_process';

async function main() {
  console.log('🚀 Iniciando ambiente Atende AI (AndradeStudio)...');
  console.log('🌐 Inicializando Next.js + Motor WhatsApp Integrado em http://localhost:3000...');

  const nextProcess = spawn('node', ['node_modules/next/dist/bin/next', 'dev'], {
    stdio: 'inherit'
  });

  nextProcess.on('exit', (code) => {
    process.exit(code || 0);
  });
}

main().catch(console.error);
