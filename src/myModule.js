//@ts-check
import isNotDefined from 'is-not-defined'

/**
 * @param {string} name
 */
export function myName(name) {
  if (isNotDefined(name)) throw new Error('You need to specify a name')
  else if (/^\w+$/i.test(name)) return `${name}, your name is valid!`
  else return `${name} is an invalid name!`
}

/**
 * @param {string} name
 */
export async function myAsyncName(name) {
  return new Promise((resolve, reject) => {
    if (isNotDefined(name)) throw new Error('You need to specify a name')
    else if (/^\w+$/i.test(name)) resolve(`${name}, your name is valid!`)
    else reject(`${name} is an invalid name!`)
  })
}
