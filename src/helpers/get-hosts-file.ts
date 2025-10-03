import fs from 'fs';

/** 
 * Retorna o caminho do arquivo de hosts do sistema, dependendo do sistema operacional.
 * @returns O caminho do arquivo de hosts.
 * @throws Erro se o arquivo de hosts não for encontrado.
 */
export const getHostsFile = () => {
  const hostsFile = process.platform === 'win32' ? 'C:\\Windows\\System32\\drivers\\etc\\hosts' : '/etc/hosts';
  if (!fs.existsSync(hostsFile))
    throw new Error(`Arquivo de hosts não encontrado em ${hostsFile}`);
  return hostsFile;
}