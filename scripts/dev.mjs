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
  console.log('🚀 Iniciando entorno de desarrollo Atiende...');

  // 1. Check or start Prisma Postgres
  const dbRunning = await isPortOpen(51214);
  if (!dbRunning) {
    console.log('📦 Arrancando servidor local Prisma Postgres...');
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
        console.log('✅ Base de datos PostgreSQL local lista en puerto 51214');
        break;
      }
      retries--;
    }
  } else {
    console.log('✅ Base de datos PostgreSQL local ya en ejecución.');
  }

  // 2. Start Next.js web application
  console.log('🌐 Arrancando Next.js en http://localhost:3000...');
  const nextProcess = spawn('npx.cmd', ['next', 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  nextProcess.on('exit', (code) => {
    process.exit(code || 0);
  });
}

main().catch(console.error);
