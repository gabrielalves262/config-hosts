#!/usr/bin/env bun

import packageJson from '../package.json' with { type: "json" };
import isAdmin from "is-admin";
import { Command } from "commander";
import { addHosts } from "./helpers/add-hosts.js";
import { deleteHosts } from "./helpers/delete-hosts.js";
import { listHosts } from "./helpers/list-hosts.js";


const program = new Command();

program
  .name(packageJson.name)
  .description(packageJson.description)
  .version(packageJson.version, '-v, --version', 'Mostra a versão do programa')
  .helpOption('-h, --help', 'Mostra esta mensagem de ajuda')

program
  .command('add')
  .summary('Configura aliases no arquivo de hosts do sistema.')
  .description('Configura aliases no arquivo de hosts do sistema.\nSe nenhum argumento for fornecido, será iniciado o modo interativo.')
  .argument('[ip]', 'O endereço IP a ser associado aos aliases.')
  .argument('[aliases...]', 'Uma lista de aliases (nomes de host) a serem associados ao IP.')
  .action(async (ip?: string, aliases?: string[]) => {
    // Verificar se está sendo executado como administrador
    if (!(await isAdmin())) {
      console.error('Por favor, execute este script com privilégios de administrador.');
      process.exit(1);
    }

    console.clear();
    await addHosts(ip, aliases);
  });

program
  .command('remove')
  .alias('rm')
  .description('Remove aliases do arquivo de hosts do sistema.')
  .argument('[aliases...]', 'Uma lista de aliases (nomes de host) a serem removidos do arquivo de hosts.')
  .action(async (aliases: string[]) => {
    // Verificar se está sendo executado como administrador
    if (!(await isAdmin())) {
      console.error('Por favor, execute este script com privilégios de administrador.');
      process.exit(1);
    }

    console.clear();
    await deleteHosts(aliases);
  });

program
  .command('list')
  .alias('ls')
  .description('Lista as entradas do arquivo de hosts do sistema.')
  .action(async () => {
    console.clear();
    await listHosts();
  });

program.parse(process.argv);


