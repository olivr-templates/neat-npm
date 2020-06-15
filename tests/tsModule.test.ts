import { describe, expect, it } from '@jest/globals'
import { myAsyncNameTs, myNameTs } from '../src/tsModule'

let name: string

/**
 * Sync
 */
describe('sync tests', function () {
  it('returns valid name (sync)', () => {
    expect.assertions(1)
    name = 'John'
    expect(myNameTs(name)).toMatch('John, your name is valid!')
  })

  it('throws invalid name (sync)', () => {
    expect.assertions(1)
    name = 'John!'
    expect(() => myNameTs(name)).toThrow('Your name is invalid')
  })
})

/**
 * Async
 */
describe('async tests', function () {
  it('returns valid name (async)', async () => {
    expect.assertions(1)
    name = 'John'
    expect(await myAsyncNameTs(name)).toMatch('John, your name is valid!')
  })

  it('throws invalid name (async)', async () => {
    expect.assertions(1)
    name = 'John!'
    await expect(myAsyncNameTs(name)).rejects.toThrow('Your name is invalid')
  })
})
