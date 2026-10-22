import { spawn } from 'child_process';
import net from 'net';

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

async function main() {
  console.log('🚀 Iniciando ambiente de desenvolvimento Atende AI...');

  // 1. Check or start Prisma Postgres
  const dbRunning = await isPortOpen(51214);
  if (!dbRunning) {
    console.log('📦 Inicializando banco de dados PostgreSQL local (Prisma Dev)...');
    const prismaProcess = spawn('npx.cmd', ['prisma', 'dev'], {
      stdio: 'inherit',
      shell: true,
      detached: true
    });
    prismaProcess.unref();

    // Wait until port is ready
    let retries = 15;
    while (retries > 0) {
      await new Promise(r => setTimeout(r, 1000));
      if (await isPortOpen(51214)) {
        console.log('✅ Banco PostgreSQL local pronto na porta 51214');
        break;
      }
      retries--;
    }
  } else {
    console.log('✅ Banco PostgreSQL local já em execução.');
  }

  // 2. Start Worker process (Baileys WhatsApp & background jobs)
  console.log('🤖 Inicializando processo Worker (WhatsApp & Tarefas em Segundo Plano)...');
  const workerProcess = spawn('npx.cmd', ['tsx', 'src/worker.ts'], {
    stdio: 'inherit',
    shell: true
  });

  workerProcess.on('error', (err) => {
    console.warn('Aviso no worker:', err.message);
  });

  // 3. Start Next.js web application
  console.log('🌐 Inicializando Next.js em http://localhost:3000...');
  const nextProcess = spawn('npx.cmd', ['next', 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  nextProcess.on('exit', (code) => {
    try { workerProcess.kill(); } catch {}
    process.exit(code || 0);
  });
}

main().catch(console.error);
