import fs from "fs";
import { getHostsFile } from "./get-hosts-file.js";

export type HostEntry = {
  index: number;
  ip: string;
  aliases: string[];
  comment: string;
  raw: string;
}

/** 
 * Lista as entradas do arquivo de hosts do sistema.
 * Requer privilégios de administrador.
 * @returns Uma lista de entradas do arquivo de hosts, incluindo índice, IP, aliases, comentário e linha bruta.
 */
export const listHosts = async (): Promise<void> => {
  const hostsFile = getHostsFile();

  const content = await fs.promises.readFile(hostsFile, 'utf-8');

  const hosts = content
    .split('\n')
    .map((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('#') || trimmedLine === '')
        return null;

      const [ip, ...rest] = trimmedLine.split(' ');
      const [aliasesString, ...comments] = rest.join(' ').split('#');
      const comment = comments.join('#').trim();

      const aliases = aliasesString.split(' ').map(alias => alias.trim()).filter(Boolean);

      return { index: index + 1, ip, aliases, comment, raw: line };
    })
    .filter((entry): entry is HostEntry => entry !== null);

  hosts.forEach(host => {
    host.aliases.forEach(alias => {
      console.log(`${host.ip.padEnd(15, ' ')}\t${alias}`);
    })
  })
}