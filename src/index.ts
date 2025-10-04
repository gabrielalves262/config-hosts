#!/usr/bin/env bun

import packageJson from '../package.json' with { type: "json" };
import isAdmin from "is-admin";
import { Command } from "commander";
import { addHosts } from "./helpers/add-hosts.js";
// import { deleteHosts } from "./helpers/delete-hosts.js";
import { listHosts } from "./helpers/list-hosts.js";
import { rmHosts } from './helpers/remove-hosts.js';


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
  .option('--comment <comment>', 'Comentário a ser adicionado ao final de cada linha no arquivo de hosts.', 'Adicionado com config-hosts')
  .option('--no-comment', 'Nenhum comentário será adicionado ao final das linhas no arquivo de hosts.', false)
  .option('--oneline', 'Adiciona todos os hostnames na mesma linha', false)
  .action(async (ip?: string, aliases?: string[], options?: { comment?: string, noComment: boolean, oneline?: boolean }) => {
    // Verificar se está sendo executado como administrador
    if (!(await isAdmin())) {
      console.error('Por favor, execute este script com privilégios de administrador.');
      process.exit(1);
    }

    await addHosts(ip, aliases, {
      comment: options?.noComment ? null : options?.comment,
      oneline: options?.oneline
    });
  });

program
  .command('remove')
  .alias('rm')
  .description('Remove hosts do arquivo de hosts do sistema.')
  .argument('[hostnames...]', 'Uma lista de hostnames a serem removidos do arquivo de hosts. (Pode usar curingas, ex: *.test.com)')
  .option('--ignore-disabled-hosts', 'Ignora hosts que estão desabilitados (comentados) no arquivo de hosts.', false)
  .action(async (hostnames: string[], options: { ignoreDisabledHosts?: boolean }) => {
    // Verificar se está sendo executado como administrador
    if (!(await isAdmin())) {
      console.error('Por favor, execute este script com privilégios de administrador.');
      process.exit(1);
    }

    await rmHosts(hostnames, options);
  });

program
  .command('list')
  .alias('ls')
  .option('--format <type>', 'Define o formato de saída (table ou json)', 'table')
  .option('--only-enabled', 'Mostra apenas as entradas habilitadas', false)
  .option('--hide-comments', 'Oculta as linhas de comentário na saída (Somente para format=table)', false)
  .description('Lista as entradas do arquivo de hosts do sistema.')
  .action(async (options) => {
    await listHosts(options);
  });

program.parse(process.argv);


