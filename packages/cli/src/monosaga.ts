#!/usr/bin/env node

import { Command } from 'commander';
import 'dotenv/config';
import { migrate } from './migration';
import version from './version';

async function main() {
  const program = new Command().name('monosaga').description('MonoSaga CLI tools.').version(version);

  program.command('migrate').description('Run migrations').action(async () => await migrate());

  await program.parseAsync();
}

await main();
