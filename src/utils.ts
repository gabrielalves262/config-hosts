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