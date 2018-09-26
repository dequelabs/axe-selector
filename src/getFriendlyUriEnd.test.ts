import 'mocha'
import * as assert from 'assert'
import getFriendlyUriEnd from './getFriendlyUriEnd'

describe('getFriendlyUriEnd', () => {
  it('returns a domain name', () => {
    assert.strictEqual(
      'deque.com',
      getFriendlyUriEnd('http://deque.com')
    )
    assert.strictEqual(
      'deque.com/',
      getFriendlyUriEnd('https://www.deque.com/')
    )
    assert.strictEqual(
      'docs.deque.com/',
      getFriendlyUriEnd('//docs.deque.com/')
    )
  })

  it('returns a filename', () => {
    assert.strictEqual(
      'contact/',
      getFriendlyUriEnd('../../contact/')
    )
    assert.strictEqual(
      'contact/',
      getFriendlyUriEnd('http://deque.com/contact/')
    )
    assert.strictEqual('contact', getFriendlyUriEnd('/contact'))
    assert.strictEqual(
      'contact.html',
      getFriendlyUriEnd('/contact.html')
    )
  })

  it('returns a hash URI', () => {
    assert.strictEqual('#footer', getFriendlyUriEnd('#footer'))
    assert.strictEqual(
      'contact.html#footer',
      getFriendlyUriEnd('/contact.html#footer')
    )
  })

  it('returns undef when there is a query', () => {
    assert.strictEqual(getFriendlyUriEnd('/contact?'), null)
    assert.strictEqual(getFriendlyUriEnd('/contact?foo=bar'), null)
  })

  it('returns undef for index files', () => {
    assert.strictEqual(getFriendlyUriEnd('/index.cfs'), null)
    assert.strictEqual(getFriendlyUriEnd('/index'), null)
  })

  it('returns undef when the result is too short', () => {
    assert.strictEqual(getFriendlyUriEnd('/i.html'), null)
    assert.strictEqual(getFriendlyUriEnd('/dq'), null)
  })

  it('returns undef when the result is too long', () => {
    assert.ok(getFriendlyUriEnd('/abcd.html', { maxLength: 50 }))
    assert.ok(getFriendlyUriEnd('#foo-bar-baz', { maxLength: 50 }))
    assert.ok(getFriendlyUriEnd('//deque.com', { maxLength: 50 }))

    assert.strictEqual(
      getFriendlyUriEnd('/abcd.html', { maxLength: 5 }),
      null
    )
    assert.strictEqual(
      getFriendlyUriEnd('#foo-bar-baz', { maxLength: 5 }),
      null
    )
    assert.strictEqual(
      getFriendlyUriEnd('//deque.com', { maxLength: 5 }),
      null
    )
  })

  it('returns undef when the result has too many numbers', () => {
    assert.strictEqual(getFriendlyUriEnd('123456.html'), null)
  })
})
