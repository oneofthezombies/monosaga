#!/usr/bin/env node

import { Command } from "commander";
import "dotenv/config";
import { version } from "../package.json";
import { migrate } from "./migration";

async function main() {
  const program = new Command()
    .name("monosaga")
    .description("MonoSaga CLI tools.")
    .version(version);

  program
    .command("migrate")
    .description("Run migrations")
    .action(async () => await migrate());

  await program.parseAsync();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
