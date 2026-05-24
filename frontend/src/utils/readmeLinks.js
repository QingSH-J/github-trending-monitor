export const getRepoParts = (repoName) => {
  const [owner, repo] = (repoName || '').split('/')
  return owner && repo ? { owner, repo } : null
}

const isAbsoluteUrl = (url) => /^[a-z][a-z\d+.-]*:/i.test(url) || url.startsWith('//')

export const resolveReadmeLink = (href = '', repoName = '') => {
  if (!href || href.startsWith('#') || isAbsoluteUrl(href)) {
    return href
  }

  const repoParts = getRepoParts(repoName)
  if (!repoParts) {
    return href
  }

  const path = href.startsWith('/') ? href.slice(1) : href
  return `https://github.com/${repoParts.owner}/${repoParts.repo}/blob/HEAD/${path}`
}

export const resolveReadmeImage = (src = '', repoName = '') => {
  if (!src || isAbsoluteUrl(src)) {
    return src
  }

  const repoParts = getRepoParts(repoName)
  if (!repoParts) {
    return src
  }

  const path = src.startsWith('/') ? src.slice(1) : src
  return `https://raw.githubusercontent.com/${repoParts.owner}/${repoParts.repo}/HEAD/${path}`
}
