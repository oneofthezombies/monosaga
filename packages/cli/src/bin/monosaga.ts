#!/usr/bin/env node

import 'dotenv/config';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

async function main() {
  yargs(hideBin(process.argv))
    .command('serve [port]', 'start the server', (yargs) => {
      return yargs
        .positional('port', {
          describe: 'port to bind on',
          default: 5000,
        });
    }, (argv) => {
      if (argv['verbose']) console.info(`start server on :${argv.port}`);
      console.log(argv.port);
    })
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging',
    })
    .parse();

  // const program = new Command();
  // program.name('monosaga').description('MonoSaga CLI tools.');

  // const migrate = program
  //   .command('migrate')
  //   .description('Migration-related commands');

  // migrate
  //   .command('up')
  //   .description('Run migrations')
  //   .option('--dry', 'Dry run without applying changes')
  //   .action(async (options: { dry?: boolean }) => {
  //     console.log('⬆️  Running migration up...');
  //     if (options.dry) {
  //       console.log('Dry run enabled');
  //     }
  //     // await runMigrations({ dry: options.dry })
  //   });
}

await main();
