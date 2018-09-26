import 'mocha'
import * as assert from 'assert'
import escapeSelector from './escapeProperty'

describe('escapeSelector', () => {
  it('should serialize strings based on CSSOM spec', () => {
    assert.throws(() => escapeSelector('\0'), Error)
    assert.throws(() => escapeSelector('a\0'), Error)
    assert.throws(() => escapeSelector('a\0b'), Error)

    assert.strictEqual(escapeSelector(undefined), 'undefined')
    assert.strictEqual(escapeSelector(true), 'true')
    assert.strictEqual(escapeSelector(false), 'false')
    assert.strictEqual(escapeSelector(null), 'null')
    assert.strictEqual(escapeSelector(''), '')

    assert.strictEqual(
      escapeSelector('\x01\x02\x1E\x1F'),
      '\\1 \\2 \\1e \\1f '
    )

    assert.strictEqual(escapeSelector('0a'), '\\30 a')
    assert.strictEqual(escapeSelector('1a'), '\\31 a')
    assert.strictEqual(escapeSelector('2a'), '\\32 a')
    assert.strictEqual(escapeSelector('3a'), '\\33 a')
    assert.strictEqual(escapeSelector('4a'), '\\34 a')
    assert.strictEqual(escapeSelector('5a'), '\\35 a')
    assert.strictEqual(escapeSelector('6a'), '\\36 a')
    assert.strictEqual(escapeSelector('7a'), '\\37 a')
    assert.strictEqual(escapeSelector('8a'), '\\38 a')
    assert.strictEqual(escapeSelector('9a'), '\\39 a')

    assert.strictEqual(escapeSelector('a0b'), 'a0b')
    assert.strictEqual(escapeSelector('a1b'), 'a1b')
    assert.strictEqual(escapeSelector('a2b'), 'a2b')
    assert.strictEqual(escapeSelector('a3b'), 'a3b')
    assert.strictEqual(escapeSelector('a4b'), 'a4b')
    assert.strictEqual(escapeSelector('a5b'), 'a5b')
    assert.strictEqual(escapeSelector('a6b'), 'a6b')
    assert.strictEqual(escapeSelector('a7b'), 'a7b')
    assert.strictEqual(escapeSelector('a8b'), 'a8b')
    assert.strictEqual(escapeSelector('a9b'), 'a9b')

    assert.strictEqual(escapeSelector('-0a'), '-\\30 a')
    assert.strictEqual(escapeSelector('-1a'), '-\\31 a')
    assert.strictEqual(escapeSelector('-2a'), '-\\32 a')
    assert.strictEqual(escapeSelector('-3a'), '-\\33 a')
    assert.strictEqual(escapeSelector('-4a'), '-\\34 a')
    assert.strictEqual(escapeSelector('-5a'), '-\\35 a')
    assert.strictEqual(escapeSelector('-6a'), '-\\36 a')
    assert.strictEqual(escapeSelector('-7a'), '-\\37 a')
    assert.strictEqual(escapeSelector('-8a'), '-\\38 a')
    assert.strictEqual(escapeSelector('-9a'), '-\\39 a')

    assert.strictEqual(escapeSelector('--a'), '-\\-a')

    assert.strictEqual(
      escapeSelector('\x80\x2D\x5F\xA9'),
      '\\80 \x2D\x5F\xA9'
    )
    assert.strictEqual(escapeSelector('\xA0\xA1\xA2'), '\xA0\xA1\xA2')
    assert.strictEqual(escapeSelector('a0123456789b'), 'a0123456789b')
    assert.strictEqual(
      escapeSelector('abcdefghijklmnopqrstuvwxyz'),
      'abcdefghijklmnopqrstuvwxyz'
    )
    assert.strictEqual(
      escapeSelector('ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    )

    assert.strictEqual(escapeSelector('\x20\x21\x78\x79'), '\\ \\!xy')

    // astral symbol (U+1D306 TETRAGRAM FOR CENTRE)
    assert.strictEqual(escapeSelector('\uD834\uDF06'), '\uD834\uDF06')
    // lone surrogates
    assert.strictEqual(escapeSelector('\uDF06'), '\uDF06')
    assert.strictEqual(escapeSelector('\uD834'), '\uD834')
  })
})
