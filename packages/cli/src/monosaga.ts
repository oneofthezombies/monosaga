#!/usr/bin/env node

import { Command } from 'commander';
import 'dotenv/config';
import version from './version';

async function main() {
  const program = new Command().name('monosaga').description('MonoSaga CLI tools.').version(version);

  program.command('migrate').description('Run migrations').action(() => {
    console.log('Run migrations');
  });

  await program.parseAsync();
}

await main();
