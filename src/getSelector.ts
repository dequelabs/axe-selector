import escapeSelector from './escapeProperty'
import matchesSelector from './matchesSelector'
import getFriendlyUriEnd from './getFriendlyUriEnd'
import isXHTML from './isXHTML'

const COMMON_CLASSNAMES = [
  'focus',
  'hover',
  'hidden',
  'visible',
  'dirty',
  'touched',
  'valid',
  'disable',
  'enable',
  'active',
  'col-'
]

const COMMON_NODE_NAMES = [
  'div',
  'span',
  'p',
  'b',
  'i',
  'u',
  'strong',
  'em',
  'h2',
  'h3'
]

const isUncommonClassName = (className: string): boolean =>
  !COMMON_CLASSNAMES.find(str => className.includes(str))

const getDistinctClassList = (element: Element): string[] => {
  const classList = element.classList
    ? Array.from(element.classList)
    : []
  if (classList.length === 0) {
    return []
  }

  const uncommonClassList = classList.filter(isUncommonClassName)

  const siblings =
    (element.parentElement &&
      Array.from(element.parentElement.children)) ||
    []

  return siblings.reduce(
    (classList: string[], childElement: Element): string[] => {
      if (element === childElement) {
        return classList
      }

      return classList.filter(
        className => !childElement.classList.contains(className)
      )
    },
    uncommonClassList
  )
}

const getNthChildSelectorSuffix = (
  element: Element,
  selector: string
): string => {
  const siblings =
    (element.parentElement &&
      Array.from(element.parentElement.children)) ||
    []
  const hasMatchingSiblings = siblings.find(
    (sibling: Element) =>
      sibling !== element && matchesSelector(sibling, selector)
  )

  if (hasMatchingSiblings) {
    return `:nth-child(${siblings.indexOf(element) + 1})`
  }

  return ''
}

interface ElementFeaturesProps {
  nodeName: string
  classList: string[]
  isCustomElm: boolean
  isCommonElm: boolean
  distinctClassList: string[]
}

type ElementFeatureFunc = (
  element: Element,
  props: ElementFeaturesProps
) => string | void

const getElementIdSelector = (element: Element): string | void => {
  if (!element.getAttribute('id')) {
    return
  }
  const id = '#' + escapeSelector(element.getAttribute('id') || '')
  if (
    // Don't include youtube's uid values, they change  on reload
    !id.match(/player_uid_/) &&
    // Don't include IDs that occur more then once on the page
    document.querySelectorAll(id).length === 1
  ) {
    return id
  }
}

const getCustomElementSelector = (
  element: Element,
  props: ElementFeaturesProps
): string | void => {
  if (props.isCustomElm) {
    return props.nodeName
  }
}

const getElementRoleSelector = (
  element: Element,
  props: ElementFeaturesProps
): string | void => {
  if (element.hasAttribute('role')) {
    return `[role="${escapeSelector(element.getAttribute('role'))}"]`
  }
}

const getElementUncommonNodeNameSelector = (
  element: Element,
  props: ElementFeaturesProps
): string | void => {
  let { isCommonElm, isCustomElm, nodeName } = props
  if (!isCommonElm && !isCustomElm) {
    // Add [type] if nodeName is an input element
    if (nodeName === 'input' && element.hasAttribute('type')) {
      nodeName += `[type="${escapeSelector(
        element.getAttribute('type')
      )}"]`
    }
    return nodeName
  }
}

const getElementNameSelector = (
  element: Element,
  props: ElementFeaturesProps
): string | void => {
  // Has a name property, but no ID (Think input fields)
  if (!element.hasAttribute('id') && element.getAttribute('name')) {
    return `[name="${escapeSelector(element.getAttribute('name'))}"]`
  }
}

// Get any distinct classes (as long as there aren't more then 3 of them)
const getElementDistinctClassesSelector = (
  element: Element,
  props: ElementFeaturesProps
): string | void => {
  const { distinctClassList } = props
  if (distinctClassList.length > 0 && distinctClassList.length < 3) {
    return '.' + distinctClassList.map(escapeSelector).join('.')
  }
}

const getElementSrcHrefSelector = (
  element: Element,
  props: ElementFeaturesProps
): string | void => {
  let attr
  if (element.hasAttribute('href')) {
    attr = 'href'
  } else if (element.hasAttribute('src')) {
    attr = 'src'
  } else {
    return
  }

  const value = element.getAttribute(attr) as string
  const friendlyUriEnd = getFriendlyUriEnd(value)
  if (friendlyUriEnd) {
    return `[${attr}$="${encodeURI(friendlyUriEnd)}"]`
  }
}

const getElementCommonNameSelector = (
  element: Element,
  props: ElementFeaturesProps
): string | void => {
  const { nodeName, isCommonElm } = props
  if (isCommonElm) {
    return nodeName
  }
}

/**
 * Get an array of features (as CSS selectors) that describe an element
 *
 * By going down the list of most to least prominent element features,
 * we attempt to find those features that a dev is most likely to
 * recognize the element by (IDs, aria roles, custom element names, etc.)
 */
function getElementFeatureSelector(
  element: Element,
  featureCount: number
) {
  const nodeName = escapeSelector(
    isXHTML(document)
      ? element.localName
      : element.nodeName.toLowerCase()
  )
  const classList: string[] = Array.from(element.classList) || []
  // Collect some props we need to build the selector
  const props: ElementFeaturesProps = {
    nodeName,
    classList,
    isCustomElm: nodeName.includes('-'),
    isCommonElm: COMMON_NODE_NAMES.includes(nodeName),
    distinctClassList: getDistinctClassList(element)
  }

  // Feature getters, ordered by priority.
  const featureFuncs: ElementFeatureFunc[] = [
    getCustomElementSelector,
    getElementRoleSelector,
    getElementUncommonNodeNameSelector,
    getElementNameSelector,
    getElementDistinctClassesSelector,
    getElementSrcHrefSelector,
    getElementCommonNameSelector
  ]

  return featureFuncs.reduce(
    (features: string[], func: ElementFeatureFunc) => {
      // As long as we haven't met our count, keep looking for features
      if (features.length === featureCount) {
        return features
      }

      const feature = func(element, props)
      if (feature) {
        if (!feature[0].match(/[a-z]/)) {
          features.push(feature)
        } else {
          features.unshift(feature)
        }
      }
      return features
    },
    []
  )
}

export interface GetSelectorOptions {
  isUnique?: boolean
  featureCount?: number
  minDepth?: number
  toRoot?: boolean
  childSelectors?: string[]
}

const getSelector = (
  element: Element,
  options: GetSelectorOptions = {}
): string => {
  if (!element) {
    return ''
  }

  let selector: string
  let addParent: boolean = false
  const idSelector = getElementIdSelector(element)
  let { isUnique = false } = options
  const {
    featureCount = 2,
    minDepth = 1,
    toRoot = false,
    childSelectors = []
  } = options

  if (idSelector) {
    selector = idSelector
    isUnique = true
  } else {
    selector = getElementFeatureSelector(element, featureCount).join(
      ''
    )
    selector += getNthChildSelectorSuffix(element, selector)

    isUnique =
      options.isUnique ||
      document.querySelectorAll(selector).length === 1

    // For the odd case that document doesn't have a unique selector.
    if (!isUnique && element === document.documentElement) {
      selector += ':root'
    }

    addParent = minDepth !== 0 || !isUnique
  }

  const selectorParts = [selector, ...childSelectors]

  if (element.parentElement && (toRoot || addParent)) {
    return getSelector(element.parentElement, {
      toRoot,
      isUnique,
      childSelectors: selectorParts,
      featureCount: 1,
      minDepth: minDepth - 1
    })
  }

  return selectorParts.join(' > ')
}

export default getSelector
