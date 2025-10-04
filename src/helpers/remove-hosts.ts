import inquirer from 'inquirer';
import fs from "fs";
import { getHostsFile } from "./get-hosts-file.js";
import { domainMatched } from "../utils.js";
import { Entry, EntryHost, parseEntries } from './parser.js';
import { writeHosts } from './write-hosts.js';

type RemoveOptions = {
  /** 
   * Ignora hosts que estão desabilitados (comentados) no arquivo de hosts.
   * 
   * @default false
   */
  ignoreDisabledHosts?: boolean;
}

/** 
 * Solicita ao usuário que selecione os hostnames para remoção.
 * 
 * @param entries - Array de objetos EntryHost contendo os hostnames disponíveis.
 * 
 * @returns Uma Promise que resolve para um array de hostnames selecionados pelo usuário.
 */
const askForHostnames = async (entries: EntryHost[]): Promise<string[]> => {
  const hosts = entries.reduce((acc, curr) => {
    curr.hostnames.forEach(hostname => {
      if (!acc.includes(hostname))
        acc.push(hostname);
    });
    return acc;
  }, [] as string[]);

  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'hostnames',
      message: `Selecione os hostnames que deseja remover`,
      choices: hosts.map(hostname => ({
        name: hostname,
        value: hostname.replace(/\./g, '_')
      })),
      required: true,
      loop: false,
    }
  ]);

  return (answers.hostnames as string[]).map(h => h.replace(/_/g, '.'));
}

/** 
 * Solicita ao usuário se deseja ignorar hosts desabilitados.
 * 
 * @returns Uma Promise que resolve para um booleano indicando a escolha do usuário.
 */
const askForIgnoreDisabledHosts = async (): Promise<boolean> => {
  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'ignoreDisabledHosts',
      message: 'Deseja ignorar hosts que estão desabilitados (comentados) no arquivo de hosts?',
      default: false,
    }
  ]);

  return answers.ignoreDisabledHosts as boolean;
}

export const rmHosts = async (
  patterns?: string[],
  options?: RemoveOptions
): Promise<void> => {
  let {
    ignoreDisabledHosts = false
  } = options || {}

  const hostsFile = getHostsFile();
  const content = await fs.promises.readFile(hostsFile, 'utf-8');
  const entries = parseEntries(content)

  if (!patterns || patterns.length <= 0){
    patterns = await askForHostnames(entries.filter(e => e.type === 'entry') as EntryHost[]);
    ignoreDisabledHosts = await askForIgnoreDisabledHosts();
  }

  const newEntries: Entry[] = []

  for (const entry of entries) {
    if (entry.type !== 'entry') {
      newEntries.push(entry);
      continue;
    }

    if (ignoreDisabledHosts && !entry.enabled) {
      newEntries.push(entry);
      continue;
    }

    const entryHost = entry as EntryHost;
    const matchedHostnames = entryHost.hostnames.filter(hostname =>
      domainMatched(hostname, ...patterns)
    );

    if (matchedHostnames.length <= 0) {
      newEntries.push(entry);
      continue;
    }

    const remainingHostnames = entryHost.hostnames.filter(hostname =>
      !domainMatched(hostname, ...patterns!)
    );

    if (remainingHostnames.length > 0) {
      entryHost.hostnames = remainingHostnames;
      newEntries.push(entryHost);
    }

    matchedHostnames.forEach(hostname => {
      console.info(`${hostname} (IP: ${entryHost.ip})`);
    });
  }

  await writeHosts(newEntries);

  console.log(`\nHosts removidos com sucesso do arquivo ${hostsFile}!\n`);
}