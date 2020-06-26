import { myAsyncName, myName } from '../src'

/**
 * Sync
 */
describe('sync tests', function () {
  it('returns valid name', () => {
    expect.assertions(1)
    expect(myName('John')).toMatch('John, your name is valid!')
  })

  it('returns invalid name', () => {
    expect.assertions(1)
    expect(myName('John!')).toMatch('John! is an invalid name!')
  })

  it('throws undefined name', () => {
    expect.assertions(1)
    expect(() => myName('')).toThrow('You need to specify a name')
  })
})

/**
 * Async
 */
describe('async tests', function () {
  it('returns valid name', async () => {
    expect.assertions(1)
    return expect(myAsyncName('John')).resolves.toMatch(
      'John, your name is valid!'
    )
  })

  it('returns invalid name', async () => {
    expect.assertions(1)
    return expect(myAsyncName('John!')).rejects.toMatch(
      'John! is an invalid name!'
    )
  })

  it('throws invalid name', async () => {
    expect.assertions(1)
    return expect(myAsyncName('')).rejects.toThrow('You need to specify a name')
  })
})
