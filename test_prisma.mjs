import { prisma } from './src/lib/prisma.js';

async function main() {
  try {
    const res = await prisma.user.count();
    console.log('User count:', res);
  } catch (err) {
    console.error('Prisma error detail:', err);
  }
}

main();
