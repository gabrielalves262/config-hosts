import inquirer from 'inquirer';
import fs from 'fs';
import { isIPv4 } from 'net';
import { getHostsFile } from './get-hosts-file.js';
import { isValidDomain } from '../utils.js';

type Definitions = {
  ip: string;
  aliases: string[];
}

/** 
 * Adiciona entradas ao arquivo de hosts do sistema.
 * Requer privilégios de administrador.
 * @param ip O endereço IP a ser associado aos aliases.
 * @param aliases Uma lista de aliases (nomes de host) a serem associados ao IP.
 */
const setHosts = async (ip: string, aliases: string[]) => {
  const hostsFile = getHostsFile();

  console.info(`Modificando o arquivo de hosts em: ${hostsFile}`);

  let content = aliases.map(alias => `${ip} ${alias}`).join('\n');

  await fs.promises.appendFile(hostsFile, `\n${content}`);

  console.info('Hosts configurados com sucesso!');
}


/** 
 * Configura o arquivo de hosts do sistema, interativamente se necessário.
 * Requer privilégios de administrador.
 * @param ip O endereço IP a ser associado aos aliases. Se não fornecido, será solicitado ao usuário.
 * @param aliases Uma lista de aliases (nomes de host) a serem associados ao IP. Se não fornecido, será solicitado ao usuário.
 */
export const addHosts = async (ip?: string, aliases?: string[]) => {

  console.info("");

  if (!ip) {
    const getIp = await inquirer.prompt([
      {
        type: 'input',
        message: 'Digite o IP que deseja usar',
        default: '127.0.0.1',
        name: 'ip',
        required: true,
        validate: (input: string) => isIPv4(input) ? true : 'Por favor, insira um endereço IPv4 válido.'
      }
    ]);

    ip = getIp.ip.trim() as string;
  } else {
    if (!isIPv4(ip))
      throw new Error('Por favor, insira um endereço IPv4 válido.');
  }

  if (!aliases || aliases.length === 0) {
    const getAliases = await inquirer.prompt([
      {
        type: 'input',
        message: 'Digite os aliases que deseja usar (separe-os por espaços ou vírgulas)',
        name: 'aliases',
        required: true,
        validate: (input: string) => {
          input = input.trim();
          if (!input) return 'Por favor, insira pelo menos um alias.';

          for (let alias of input.split(/\s+|,/)) {
            alias = alias.trim();
            if (alias.length === 0)
              return 'Aliases não podem ser vazios.';

            if (!isValidDomain(alias))
              return 'Aliases só podem conter letras, números, pontos e hífens.';
          }

          return true;
        }
      },
    ])
      .then(answers => ({
        aliases: answers.aliases
          .trim()
          .split(/\s+|,/)
          .map((alias: string) => alias.trim()).filter(Boolean)
      }) satisfies Omit<Definitions, 'ip'>)
      .catch((error) => {
        console.error('Erro ao obter entradas do usuário:', error.message);
        process.exit(1);
      })

    aliases = getAliases.aliases as string[];
  } else {
    aliases = aliases.map(alias => alias.trim()).filter(Boolean);
    if (aliases.length === 0)
      throw new Error('Por favor, insira pelo menos um alias.');

    for (let alias of aliases) {
      if (!/^[a-zA-Z0-9-.]+$/.test(alias))
        throw new Error('Aliases só podem conter letras, números, pontos e hífens.');
    }

  }

  const def: Definitions = {
    ip,
    aliases
  }

  await setHosts(def.ip, def.aliases);
}