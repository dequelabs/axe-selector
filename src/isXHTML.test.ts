import 'mocha'
import * as assert from 'assert'
import isXHTML from './isXHTML'

describe('isXHTML', () => {
  it('should return true on any document that is XHTML', () => {
    const doc = document.implementation.createDocument(
      'http://www.w3.org/1999/xhtml',
      'html',
      null
    )
    assert.ok(isXHTML(doc))
  })

  it('should return false on any document that is HTML', () => {
    const doc = document.implementation.createHTMLDocument('Monkeys')
    assert.strictEqual(isXHTML(doc), false)
  })

  it('should return false on any document that is HTML - fixture', () => {
    assert.strictEqual(isXHTML(document), false)
  })
})
