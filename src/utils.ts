import { Entry } from "./helpers/parser.js";

/** 
 * Verifica se uma string é um domínio válido.
 * @param domain A string a ser verificada.
 * @returns Verdadeiro se a string for um domínio válido, falso caso contrário.
 */
export const isValidDomain = (domain: string): boolean => {
  const domainRegex = /^(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$/;
  return domainRegex.test(domain);
}

/** 
 * Verifica se um domínio corresponde a um padrão, que pode incluir curingas.
 * @param domain O domínio a ser verificado.
 * @param patterns Os padrões, que podem incluir um curinga no início (ex: *.example.com).
 * @returns Verdadeiro se o domínio corresponder ao padrão, falso caso contrário.
 */
export const domainMatched = (domain: string, ...patterns: string[]): boolean => {
  for (const p of patterns) {
    if (p.startsWith("*.")) {
      const baseDomain = p.slice(2);
      if (domain.endsWith(baseDomain))
        return true;
    } else if (domain === p) {
      return true;
    }
  }

  return false;
}

/** 
 * Retorna o maior comprimento de IP entre as entradas fornecidas.
 * 
 * @param entries Uma matriz de objetos Entry.
 * 
 * @return O maior comprimento de IP encontrado nas entradas.
 */
export const getLargestIpLength = (entries: Entry[]): number => {
  return entries.reduce((max, entry) => {
    if (entry.type === 'entry') {
      return Math.max(max, entry.ip.length)
    }
    return max
  }, 0)
}

/** 
 * Retorna o maior comprimento de hostnames entre as entradas fornecidas.
 * 
 * @param entries Uma matriz de objetos Entry.
 * 
 * @return O maior comprimento de hostnames encontrado nas entradas.
 */
export const getLargestHostnamesLength = (entries: Entry[]): number => {
  return entries.reduce((max, entry) => {
    if (entry.type === 'entry') {
      const hostnamesLength = entry.hostnames.join(' ').length
      return Math.max(max, hostnamesLength)
    }
    return max
  }, 0)
}

/** 
 * Retorna o maior comprimento de comentário entre as entradas fornecidas.
 * 
 * @param entries Uma matriz de objetos Entry.
 * 
 * @return O maior comprimento de comentário encontrado nas entradas.
 */
export const getLargetsCommentLength = (entries: Entry[]): number => {
  return entries.reduce((max, entry) => {
    if (entry.type === 'entry' && entry.comment) {
      return Math.max(max, entry.comment.length)
    }
    return max
  }, 0)
}