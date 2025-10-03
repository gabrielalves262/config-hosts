import inquirer from 'inquirer';
import fs from "fs";
import { getHostsFile } from "./get-hosts-file.js";
import { domainMatched } from "../utils.js";
import { HostEntry } from "./list-hosts.js";

export const deleteHosts = async (aliases?: string[]) => {
  const hostsFile = getHostsFile();

  const content = await fs.promises.readFile(hostsFile, 'utf-8');

  const lines = content.split('\n');

  const newLines: string[] = [];

  if (!aliases || aliases.length === 0) {
    const hosts = content
      .split('\n')
      .map((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('#') || trimmedLine === '')
          return null;

        const [ip, ...rest] = trimmedLine.split(' ');
        const [aliasesString, ...comments] = rest.join(' ').split('#');
        const comment = comments.join('#').trim();

        const aliases = aliasesString.split(',').map(alias => alias.trim());

        return { index: index + 1, ip, aliases, comment, raw: line };
      })
      .filter((entry): entry is HostEntry => entry !== null);

    const selectHosts = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'aliases',
        message: 'Selecione os aliases que deseja remover:',
        choices: hosts.reduce((acc, curr) => {
          curr.aliases.forEach(alias => {
            if (!acc.find(a => a.value.includes(alias)))
              acc.push({ name: alias, value: alias });
          })
          return acc;
        }, [] as { name: string, value: string }[])
      }
    ]);

    aliases = selectHosts.aliases as string[];
  }

  for (const line of lines) {
    if (line.trim().startsWith('#') || line.trim() === '') {
      newLines.push(line);
      continue;
    }

    const [ip, ...rest] = line.split(' ');
    const [aliasesString, ...comments] = rest.join(' ').split('#');
    const comment = comments.join('#').trim();
    const lineAliases = aliasesString.split(' ').map(alias => alias.trim()).filter(Boolean);

    const hasAliasToDelete = lineAliases.some(alias => domainMatched(alias, ...aliases));

    if (hasAliasToDelete) {
      const newAliases = lineAliases.filter(alias => !domainMatched(alias, ...aliases));
      if (newAliases.length > 0) {
        newLines.push(`${ip} ${newAliases.join(', ')}${comment ? ' # ' + comment : ''}`);
      }

      const removedAliases = lineAliases.filter(alias => !newAliases.includes(alias));
      removedAliases.forEach(removed => {
        console.info(`Alias removido: ${removed}`);
      });

      continue;
    }

    newLines.push(line);
  }

  await fs.promises.writeFile(hostsFile, newLines.join('\n'), 'utf-8');
}