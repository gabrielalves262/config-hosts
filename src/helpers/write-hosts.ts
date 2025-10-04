import fs from 'fs';
import { getLargestHostnamesLength, getLargestIpLength, getLargetsCommentLength } from "../utils.js";
import { Entry } from "./parser.js";
import { getHostsFile } from './get-hosts-file.js';

export const writeHosts = async (entries: Entry[]): Promise<void> => {
  const hostsFile = getHostsFile();

  const largestIpLength = getLargestIpLength(entries);
  const largestHostnamesLength = getLargestHostnamesLength(entries);

  const content = entries
    .map(entry => entry.toString({ largestIpLength, largestHostnamesLength }))
    .join('\n');

  await fs.promises.writeFile(hostsFile, content, { encoding: 'utf-8' });
}