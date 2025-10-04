import inquirer from 'inquirer';
import fs from 'fs';
import { isIPv4, isIPv6 } from 'net';
import { getHostsFile } from './get-hosts-file.js';
import { isValidDomain } from '../utils.js';
import { Entry, EntryHost, parseEntries } from './parser.js';
import { writeHosts } from './write-hosts.js';

export type AddOptions = {
  /** 
   * Comentário a ser adicionado ao final de cada linha no arquivo de hosts.
   * Pode ser uma string ou null para nenhum comentário.
   * 
   * @default 'Adicionado com config-hosts'
   * 
   */
  comment?: string | null;

  /** 
   * Adiciona todas as entradas adicionadas em uma única linha.
   * 
   * [group=true]:
   * 
   * 127.0.0.1 example.com test.com demo.com # Adicionado com config-hosts
   * 
   * [group=false]:
   * 
   * 127.0.0.1 example.com # Adicionado com config-hosts
   * 
   * 127.0.0.1 test.com    # Adicionado com config-hosts
   * 
   * 127.0.0.1 demo.com    # Adicionado com config-hosts
   * 
   * @default false
   * 
   */
  oneline?: boolean
}

/** 
 * Solicita ao usuário que insira um endereço IP válido.
 * 
 * @returns Uma Promise que resolve para o endereço IP inserido pelo usuário.
 */
const askForIP = async (): Promise<string> => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'ip',
      message: 'Digite o endereço IP:',
      default: '127.0.0.1',
      validate: (input: string) => {
        if (isIPv4(input) || isIPv6(input)) {
          return true;
        }
        return 'Por favor, insira um endereço IPv4 válido.';
      }
    }
  ]);

  return answers.ip as string;
}

/** 
 * Solicita ao usuário que insira nomes de host válidos.
 * 
 * @returns Uma Promise que resolve para um array de nomes de host inseridos pelo usuário.
 */
const askForHostnames = async (): Promise<string[]> => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'hostnames',
      message: 'Digite os nomes de host:',
      validate: (input: string) => {
        const hostnames = input.split(' ').map(h => h.trim()).filter(Boolean);

        if (hostnames.every(isValidDomain))
          return true;

        return 'Por favor, insira nomes de host válidos, separados por espaço.';
      }
    }
  ]);

  return answers.hostnames.split(' ').map((h: string) => h.trim()).filter(Boolean) as string[];
}

/** 
 * Solicita ao usuário que insira um comentário opcional.
 * 
 * @return Uma Promise que resolve para o comentário inserido pelo usuário, ou null se nenhum comentário for fornecido.
 */
const askForComment = async (): Promise<string | null> => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'comment',
      message: 'Digite o comentário a ser adicionado (ou deixe vazio para nenhum comentário):',
    }
  ]);

  return answers.comment ? answers.comment as string : null;
}

/** 
 * Solicita ao usuário que escolha se deseja adicionar todas as entradas em uma única linha.
 * 
 * @return Uma Promise que resolve para true se o usuário desejar adicionar em uma única linha, ou false caso contrário.
 */
const askForOneline = async (): Promise<boolean> => {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'oneline',
      message: 'Deseja adicionar todas as entradas em uma única linha?',
      default: false,
    }
  ]);

  return answers.oneline as boolean;
}

/** 
 * Adiciona entradas ao arquivo de hosts.
 * 
 * @param ip O endereço IP para o qual os nomes de host serão mapeados. Se não fornecido, o usuário será solicitado a inseri-lo.
 * @param hostnames Uma lista de nomes de host a serem adicionados. Se não fornecido, o usuário será solicitado a inseri-los.
 * @param options Opções adicionais para personalizar o comportamento da adição.
 * 
 * @returns Uma Promise que resolve quando as entradas forem adicionadas com sucesso.
 */
export const addHosts = async (
  ip?: string,
  hostnames?: string[],
  options?: AddOptions
): Promise<void> => {
  let {
    comment = 'Adicionado com config-hosts',
    oneline = false,
  } = options || {};

  if (!ip) {
    ip = await askForIP();
    hostnames = await askForHostnames();
    comment = await askForComment();
    if (hostnames.length > 1)
      oneline = await askForOneline();
  }

  if (!hostnames || hostnames.length === 0) {
    hostnames = await askForHostnames();
  }

  const hostsFile = getHostsFile();
  const content = await fs.promises.readFile(hostsFile, 'utf-8');
  const entries = parseEntries(content)

  const newEntries = oneline
    ? [new EntryHost(ip, hostnames, true, comment || undefined)]
    : hostnames.map(hostname => new EntryHost(ip!, [hostname], true, comment || undefined));

  entries.push(...newEntries);

  await writeHosts(entries);

  console.log(`\nHosts adicionados com sucesso ao arquivo ${hostsFile}!\n`);

  newEntries.forEach(entry => {
    console.info(`  ${entry.toString()}`);
  });
}