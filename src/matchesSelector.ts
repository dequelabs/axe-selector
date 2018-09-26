/**
 * Ponyfil for Element#matches.
 *
 * @param {Element} element The element to test
 * @param {String} selector The selector to test element against
 */

const matchesSelector = (
  element: Element,
  selector: string
): boolean => {
  if (element.matches) {
    return element.matches(selector)
  }

  // TypeScript bugs.
  if ((element as any).matchesSelector) {
    return (element as any).matchesSelector(selector)
  }

  if ((element as any).matchesSelector) {
    return (element as any).matchesSelector(selector)
  }

  if ((element as any).mozMatchesSelector) {
    return (element as any).mozMatchesSelector(selector)
  }

  if (element.webkitMatchesSelector) {
    return element.webkitMatchesSelector(selector)
  }

  if (element.msMatchesSelector) {
    return element.msMatchesSelector(selector)
  }

  throw new Error('No matches selector method available')
}

export default matchesSelector
