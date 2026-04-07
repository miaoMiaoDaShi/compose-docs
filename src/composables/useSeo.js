const ensureMeta = (name) => {
  let element = document.head.querySelector(`meta[name="${name}"]`)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute('name', name)
    document.head.appendChild(element)
  }

  return element
}

const ensureCanonical = () => {
  let element = document.head.querySelector('link[rel="canonical"]')

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', 'canonical')
    document.head.appendChild(element)
  }

  return element
}

export function useSeo() {
  const setSeo = ({ title, description, canonical }) => {
    if (title) {
      document.title = title
    }

    if (description) {
      ensureMeta('description').setAttribute('content', description)
    }

    if (canonical) {
      ensureCanonical().setAttribute('href', canonical)
    }
  }

  return { setSeo }
}
