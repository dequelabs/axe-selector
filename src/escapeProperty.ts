/* tslint:disable triple-equals */

type EscapePropertyInput = string | boolean | null | undefined

/**
 * Escapes a property value of a CSS selector.
 *
 * @see https://github.com/mathiasbynens/CSS.escape/
 * @see http://dev.w3.org/csswg/cssom/#serialize-an-identifier
 *
 * @param value The piece of the selector to escape
 */

const escapeProperty = (value: EscapePropertyInput): string => {
  const s = String(value)
  const length = s.length
  let index = -1
  let codeUnit: number
  let result = ''
  let firstCodeUnit = s.charCodeAt(0)

  while (++index < length) {
    codeUnit = s.charCodeAt(index)
    // Note: there’s no need to special-case astral symbols, surrogate
    // pairs, or lone surrogates.

    // If the character is NULL (U+0000), then throw an
    // `InvalidCharacterError` exception and terminate these steps.
    if (codeUnit == 0x0000) {
      throw new Error('INVALID_CHARACTER_ERR')
    }

    if (
      // If the character is in the range [\1-\1F] (U+0001 to U+001F) or
      // [\7F-\9F] (U+007F to U+009F), […]
      (codeUnit >= 0x0001 && codeUnit <= 0x001f) ||
      (codeUnit >= 0x007f && codeUnit <= 0x009f) ||
      // If the character is the first character and is in the range [0-9]
      // (U+0030 to U+0039), […]
      (index == 0 && codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
      // If the character is the second character and is in the range [0-9]
      // (U+0030 to U+0039) and the first character is a `-` (U+002D), […]
      (index == 1 &&
        codeUnit >= 0x0030 &&
        codeUnit <= 0x0039 &&
        firstCodeUnit == 0x002d)
    ) {
      // http://dev.w3.org/csswg/cssom/#escape-a-character-as-code-point
      result += '\\' + codeUnit.toString(16) + ' '
      continue
    }

    // If the character is the second character and is `-` (U+002D) and the
    // first character is `-` as well, […]
    if (index == 1 && codeUnit == 0x002d && firstCodeUnit == 0x002d) {
      // http://dev.w3.org/csswg/cssom/#escape-a-character
      result += '\\' + s.charAt(index)
      continue
    }

    // If the character is not handled by one of the above rules and is
    // greater than or equal to U+0080, is `-` (U+002D) or `_` (U+005F), or
    // is in one of the ranges [0-9] (U+0030 to U+0039), [A-Z] (U+0041 to
    // U+005A), or [a-z] (U+0061 to U+007A), […]
    if (
      codeUnit >= 0x0080 ||
      codeUnit == 0x002d ||
      codeUnit == 0x005f ||
      (codeUnit >= 0x0030 && codeUnit <= 0x0039) ||
      (codeUnit >= 0x0041 && codeUnit <= 0x005a) ||
      (codeUnit >= 0x0061 && codeUnit <= 0x007a)
    ) {
      // the character itself
      result += s.charAt(index)
      continue
    }

    // Otherwise, the escaped character.
    // http://dev.w3.org/csswg/cssom/#escape-a-character
    result += '\\' + s.charAt(index)
  }

  return result
}

export default escapeProperty
