import 'mocha'
import * as assert from 'assert'
import elementMatches from './matchesSelector'

describe('elementMatches', () => {
  let fixture: Element

  before(() => {
    fixture = document.createElement('div')
    fixture.id = 'fixture'
    document.body.appendChild(fixture)
  })

  afterEach(() => {
    fixture.innerHTML = ''
  })

  after(() => {
    document.body.removeChild(fixture)
  })

  it('should actually work', () => {
    fixture.innerHTML = '<div id="test">Hi</div>'
    const target = document.getElementById('test') as Element
    assert.ok(elementMatches(target, '#test'))
  })
})
