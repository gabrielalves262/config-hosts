import fs from "fs";
import { bold, gray, green, red, reset } from 'picocolors';
import {
  getLargestHostnamesLength,
  getLargestIpLength,
  getLargetsCommentLength
} from "../utils.js";
import { getHostsFile } from "./get-hosts-file.js";
import { parseEntries } from "./parser.js";

type ListOptions = {
  /** Formato de saída */
  format: 'json' | 'table',

  /** Oculta comentários (somente se formato = `table`) */
  hideComments?: boolean,

  /** Mostra somente os hosts habilitados */
  onlyEnabled?: boolean
}

/** 
 * Lista as entradas do arquivo de hosts do sistema.
 * Requer privilégios de administrador.
 * 
 * @param options Opções para formatar a saída.
 */
export const listHosts = async (options: ListOptions): Promise<void> => {
  const {
    format = 'table',
    hideComments = false,
    onlyEnabled = false
  } = options;

  const hostsFile = getHostsFile();
  const content = await fs.promises.readFile(hostsFile, 'utf-8');
  const entries = parseEntries(content)

  const largestIpLength = getLargestIpLength(entries);
  const largestHostnamesLength = getLargestHostnamesLength(entries);
  const largestComment = getLargetsCommentLength(entries);

  console.log("");

  if (format === 'json') {
    const json = entries
      .filter(entry => entry.type === 'entry')
      .filter(entry => onlyEnabled ? entry.enabled : true)
      .map(entry => ({
        ip: entry.ip,
        hostnames: entry.hostnames,
        enabled: entry.enabled,
        comment: entry.comment ?? null
      }));

    console.log(JSON.stringify(json, null, 2));
    return;
  }

  console.log(bold(
    '| - ' +
    '| IP'.padEnd(largestIpLength + 3, ' ') +
    '| Hostname'.padEnd(largestHostnamesLength + 3, ' ') +
    (!hideComments ? '| Comment'.padEnd(largestComment + 3, ' ') : '') +
    '|'
  ))

  console.log(
    '|' + '-'.repeat(3) +
    '|' + '-'.repeat(largestIpLength + 2) +
    '|' + '-'.repeat(largestHostnamesLength + 2) +
    (!hideComments ? '|' + '-'.repeat(largestComment + 2) : '') +
    '|'
  )

  for (const entry of entries) {
    if (entry.type === 'entry') {
      if (onlyEnabled && !entry.enabled)
        continue;

      const color = entry.enabled ? reset : gray;

      for (const hostname of entry.hostnames) {
        console.log(
          '| ' + (entry.enabled ? green('√ ') : red('x ')) +
          '| ' + color(entry.ip.padEnd(largestIpLength + 1, ' ')) +
          '| ' + color(hostname.padEnd(largestHostnamesLength + 1, ' ')) +
          (!hideComments ? '| ' + color((entry.comment ? `${entry.comment}` : '').padEnd(largestComment + 1)) : '') +
          '|'
        );
      }
    }
  }
}