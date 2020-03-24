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

  // Need to ignore in order to support IE9
  // @ts-ignore
  if (element.msMatchesSelector) {
    // @ts-ignore
    return element.msMatchesSelector(selector)
  }

  throw new Error('No matches selector method available')
}

export default matchesSelector
