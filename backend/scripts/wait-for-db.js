#!/usr/bin/env node
/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const MAX_ATTEMPTS = 30;
const DELAY_MS = 2000;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tryConnect() {
  const prisma = new PrismaClient();

  try {
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    await prisma.$disconnect();
    return false;
  }
}

(async () => {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const connected = await tryConnect();

    if (connected) {
      console.log('Database connection established.');
      process.exit(0);
    }

    console.log(`Retrying in ${DELAY_MS}ms... (attempt ${attempt}/${MAX_ATTEMPTS})`);
    await sleep(DELAY_MS);
  }

  console.error('Unable to connect to the database within the allotted attempts.');
  process.exit(1);
})();
