import 'mocha'
import * as assert from 'assert'
import getSelector from './getSelector'

describe('getSelector', () => {
  let fixture: HTMLElement

  before(() => {
    fixture = document.createElement('div')
    fixture.id = 'fixture'
    document.body.appendChild(fixture)
  })

  beforeEach(() => {
    fixture.innerHTML = ''
  })

  afterEach(() => {
    fixture.innerHTML = ''
  })

  it('should be a function', () => {
    assert.strictEqual(typeof getSelector, 'function')
  })

  it('should generate a unique CSS selector', () => {
    const node = document.createElement('div')
    fixture.appendChild(node)

    const sel = getSelector(node)

    assert.strictEqual(sel, '#fixture > div')

    const result = document.querySelectorAll(sel)
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0], node)
  })

  it('should still work if an element has nothing but whitespace as a className', () => {
    const node = document.createElement('div')
    node.className = '    '
    fixture.appendChild(node)

    const sel = getSelector(node)

    assert.strictEqual(sel, '#fixture > div')

    const result = document.querySelectorAll(sel)
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0], node)
  })

  it('should handle special characters', () => {
    const node = document.createElement('div')
    node.id = 'monkeys#are.animals\\ok'
    fixture.appendChild(node)

    const result = document.querySelectorAll(getSelector(node))
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0], node)
  })

  it('should handle special characters in className', () => {
    const node = document.createElement('div')
    node.className = '.  bb-required'
    fixture.appendChild(node)

    const result = document.querySelectorAll(getSelector(node))
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0], node)
  })

  it('should be able to fall back to positional selectors', () => {
    const addElement = (): Element => {
      const el = document.createElement('div')
      fixture.appendChild(el)
      return el
    }

    addElement()
    addElement()
    addElement()
    addElement()
    const expected = addElement()
    addElement()
    addElement()
    addElement()
    addElement()
    addElement()

    const selector = getSelector(expected)
    const result = document.querySelectorAll(selector)
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0], expected)
  })

  it('should stop on unique ID', () => {
    const node = document.createElement('div')
    node.id = 'monkeys'
    fixture.appendChild(node)

    const sel = getSelector(node)

    assert.strictEqual(sel, '#monkeys')

    const result = document.querySelectorAll(sel)
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0], node)
  })

  it('should not use ids if they are not unique', () => {
    let node = document.createElement('div')
    node.id = 'monkeys'
    fixture.appendChild(node)

    node = document.createElement('div')
    node.id = 'monkeys'
    fixture.appendChild(node)

    const sel = getSelector(node)

    assert.strictEqual(sel, '#fixture > div:nth-child(2)')

    const result = document.querySelectorAll(sel)
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0], node)
  })

  it('should use classes if available and unique', () => {
    let node = document.createElement('div')
    node.className = 'monkeys simian'
    fixture.appendChild(node)

    node = document.createElement('div')
    node.className = 'dogs cats'
    fixture.appendChild(node)

    const sel = getSelector(node)

    assert.strictEqual(sel, '#fixture > div.dogs.cats')

    const result = document.querySelectorAll(sel)
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0], node)
  })

  it('should default to tagName and position if classes are not unique', () => {
    let node = document.createElement('div')
    node.className = 'monkeys simian'
    fixture.appendChild(node)

    node = document.createElement('div')
    node.className = 'monkeys simian'
    fixture.appendChild(node)

    const sel = getSelector(node)

    assert.strictEqual(sel, '#fixture > div:nth-child(2)')

    const result = document.querySelectorAll(sel)
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0], node)
  })

  it('should work on the documentElement', () => {
    const sel = getSelector(document.documentElement)
    const result = document.querySelectorAll(sel)
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0], document.documentElement)
  })

  it('should work on the documentElement with classes', () => {
    const orig = document.documentElement.className
    document.documentElement.className = 'stuff and other things'
    const sel = getSelector(document.documentElement)
    const result = document.querySelectorAll(sel)
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0], document.documentElement)
    document.documentElement.className = orig
  })

  it('should work on the body', () => {
    const sel = getSelector(document.body)
    const result = document.querySelectorAll(sel)
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0], document.body)
  })

  it('should work on namespaced elements', () => {
    fixture.innerHTML = '<hx:include>Hello</hx:include>'
    const node = fixture.firstChild as Element
    const sel = getSelector(node)
    const result = document.querySelectorAll(sel)
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0], node)
  })

  it('should work on complex namespaced elements', () => {
    fixture.innerHTML = `
      <m:math xmlns:m="http://www.w3.org/1998/Math/MathML">
        <m:mi>x</m:mi>
        <m:annotation-xml encoding="MathML-Content">
          <m:ci>x</m:ci>
        </m:annotation-xml>
      </m:math>';
    `
    const node = fixture.querySelector('m\\:ci') as Element
    const sel = getSelector(node)
    const result = document.querySelectorAll(sel)
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0], node)
  })

  // XXX: this test couldn't be ported to TypeScript. It's commented out for now, but should probably be addressed someday.
  // it("shouldn't fail if the node's parentNode doesnt have children, somehow (Firefox bug)", function() {
  //   var sel = getSelector({
  //     nodeName: 'a',
  //     classList: [],
  //     getAttribute: function() {},
  //     hasAttribute: function() {
  //       return false;
  //     },
  //     parentNode: {
  //       nodeName: 'b',
  //       getAttribute: function() {},
  //       hasAttribute: function() {
  //         return false;
  //       },
  //       classList: []
  //     }
  //   });
  //   assert.strictEqual(sel, 'a');
  // });

  it('should use role attributes', () => {
    const node = document.createElement('div')
    node.setAttribute('role', 'menuitem')
    fixture.appendChild(node)

    assert.strictEqual(
      getSelector(node),
      '#fixture > div[role="menuitem"]'
    )
  })

  it('should use href and src attributes', () => {
    const link = document.createElement('a')
    link.setAttribute('href', '//deque.com/about/')
    fixture.appendChild(link)

    const img = document.createElement('img')
    img.setAttribute('src', '//deque.com/logo.png')
    fixture.appendChild(img)

    assert.strictEqual(
      getSelector(link),
      '#fixture > a[href$="about/"]'
    )
    assert.strictEqual(
      getSelector(img),
      '#fixture > img[src$="logo.png"]'
    )
  })

  it('should give use two features on the first element', () => {
    const node = document.createElement('div')
    node.setAttribute('role', 'menuitem')
    fixture.appendChild(node)

    assert.strictEqual(
      getSelector(node),
      '#fixture > div[role="menuitem"]'
    )

    node.className = 'dqpl-btn-primary'
    assert.strictEqual(
      getSelector(node),
      '#fixture > [role="menuitem"].dqpl-btn-primary'
    )
  })

  it('should give use one features on the subsequent elements', () => {
    const span = document.createElement('span')
    const node = document.createElement('div')
    node.setAttribute('role', 'menuitem')
    span.className = 'expand-icon'
    node.appendChild(span)
    fixture.appendChild(node)

    assert.strictEqual(
      getSelector(span),
      '[role="menuitem"] > span.expand-icon'
    )
  })

  it('should prioritize uncommon tagNames', () => {
    const node = document.createElement('button')
    node.setAttribute('role', 'menuitem')
    node.className = 'dqpl-btn-primary'
    fixture.appendChild(node)
    assert.strictEqual(
      getSelector(node),
      '#fixture > button[role="menuitem"]'
    )
  })

  it('should add [type] to input elements', () => {
    const node = document.createElement('input')
    node.type = 'password'
    node.className = 'dqpl-textfield'
    fixture.appendChild(node)
    assert.strictEqual(
      getSelector(node),
      '#fixture > input[type="password"].dqpl-textfield'
    )
  })

  it('should use the name property', () => {
    const node = document.createElement('input')
    node.type = 'text'
    node.name = 'username'
    node.className = 'dqpl-textfield'
    fixture.appendChild(node)
    assert.strictEqual(
      getSelector(node),
      '#fixture > input[type="text"][name="username"]'
    )
  })
})
