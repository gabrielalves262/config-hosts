import { isIPv4, isIPv6 } from "net"

export class EntryEmpty {
  type: 'empty' = 'empty'
  toString(): string {
    return ''
  }
}

export class EntryComment {
  type: 'comment' = 'comment'
  content: string

  constructor(content: string) {
    this.content = content
  }

  toString(): string {
    return this.content.trimStart()
  }
}

export class EntryHost {
  type: 'entry' = 'entry'
  ip: string
  hostnames: string[]
  enabled: boolean
  comment?: string

  constructor(ip: string, hostnames: string[], enabled: boolean, comment?: string) {
    this.ip = ip
    this.hostnames = hostnames
    this.enabled = enabled
    this.comment = comment
  }

  toString(options: { largestIpLength?: number, largestHostnamesLength?: number } = {}): string {
    const prefix = this.enabled ? '  ' : '# '
    const hostnamesStr = this.hostnames.join(' ')
    const commentStr = this.comment ? ` # ${this.comment}` : ''
    return prefix +
      this.ip.padEnd(options.largestIpLength ?? this.ip.length, ' ') + ' ' +
      hostnamesStr.padEnd(options.largestHostnamesLength ?? hostnamesStr.length, ' ') +
      commentStr
  }
}

export type Entry = EntryEmpty | EntryComment | EntryHost

/** 
 * Retorna o conteúdo de um arquivo hosts em uma matriz de objetos Entry.
 * 
 * @param content O conteúdo do arquivo hosts como uma string.
 * 
 * @return Uma matriz de objetos Entry representando cada linha do arquivo hosts.
 */
export const parseEntries = (content: string): Entry[] => {
  const lines = content.split('\n')
  const entries: Entry[] = []

  for (const line of lines) {
    const trimmedLine = line.trim()

    // Empty
    if (trimmedLine === '') {
      entries.push(new EntryEmpty())
      continue
    }

    // Entry
    const [ip] = trimmedLine.replace(/^[ \t#]+/, '').split(/\s+/).filter(Boolean)
    if (isIPv4(ip) || isIPv6(ip)) {
      const enabled = !trimmedLine.startsWith('#')
      const [hostnamesPart, ...commentParts] = trimmedLine.slice(trimmedLine.indexOf(ip) + ip.length).trim().split('#')

      const hostnames = hostnamesPart.split(/\s+/).filter(Boolean)
      const comment = commentParts.length > 0 ? commentParts.join('#').trim() : undefined

      entries.push(new EntryHost(ip, hostnames, enabled, comment))
    }

    // Comment
    else {
      entries.push(new EntryComment(line))
      continue;
    }
  }

  return entries;
}