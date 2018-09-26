const isMostlyNumbers = (str: string = ''): boolean => {
  return (
    str.length !== 0 &&
    (str.match(/[0-9]/g) || '').length >= str.length / 2
  )
}

const splitString = (str: string, index: number): string[] => [
  str.substr(0, index),
  str.substring(index)
]

interface URLPieces {
  original: string
  protocol: string
  domain: string
  port: string
  path: string
  query: string
  hash: string
}

const uriParser = (url: string): URLPieces => {
  let original = url
  let protocol = ''
  let domain = ''
  let port = ''
  let path = ''
  let query = ''
  let hash = ''
  if (url.includes('#')) {
    ;[url, hash] = splitString(url, url.indexOf('#'))
  }

  if (url.includes('?')) {
    ;[url, query] = splitString(url, url.indexOf('?'))
  }

  if (url.includes('://')) {
    ;[protocol, url] = url.split('://')
    ;[domain, url] = splitString(url, url.indexOf('/'))
  } else if (url.substr(0, 2) === '//') {
    url = url.substr(2)
    ;[domain, url] = splitString(url, url.indexOf('/'))
  }

  if (domain.substr(0, 4) === 'www.') {
    domain = domain.substr(4)
  }

  if (domain && domain.includes(':')) {
    ;[domain, port] = splitString(domain, domain.indexOf(':'))
  }

  path = url // Whatever is left, must be the path
  return { original, protocol, domain, port, path, query, hash }
}

export interface GetFriendlyUriEndOptions {
  currentDomain?: string
  maxLength?: number
}

const getFriendlyUriEnd = (
  uri: string = '',
  options: GetFriendlyUriEndOptions = {}
): string | null => {
  if (
    // Skip certain URIs:
    uri.length <= 1 || // very short
    uri.substr(0, 5) === 'data:' || // data URIs are unreadable
    uri.substr(0, 11) === 'javascript:' || // JS isn't a URL
    uri.includes('?') // query strings aren't very readable either
  ) {
    return null
  }

  const { currentDomain, maxLength = 25 } = options
  const { path, domain, hash } = uriParser(uri)
  // Split the path at the last / that has text after it
  const pathEnd = path.substr(
    path.substr(0, path.length - 2).lastIndexOf('/') + 1
  )

  if (hash) {
    if (pathEnd && (pathEnd + hash).length <= maxLength) {
      return pathEnd + hash
    }
    if (
      pathEnd.length < 2 &&
      hash.length > 2 &&
      hash.length <= maxLength
    ) {
      return hash
    }
    return null
  }

  if (domain && domain.length < maxLength && path.length <= 1) {
    // '' or '/'
    return domain + path
  }

  // See if the domain should be returned
  if (
    path === '/' + pathEnd &&
    domain &&
    currentDomain &&
    domain !== currentDomain &&
    (domain + path).length <= maxLength
  ) {
    return domain + path
  }

  const lastDotIndex = pathEnd.lastIndexOf('.')
  if (
    // Exclude very short or very long string
    (lastDotIndex === -1 || lastDotIndex > 1) &&
    (lastDotIndex !== -1 || pathEnd.length > 2) &&
    pathEnd.length <= maxLength &&
    // Exclude index files
    !pathEnd.match(/index(\.[a-zA-Z]{2-4})?/) &&
    // Exclude files that are likely to be database IDs
    !isMostlyNumbers(pathEnd)
  ) {
    return pathEnd
  }

  return null
}

export default getFriendlyUriEnd
