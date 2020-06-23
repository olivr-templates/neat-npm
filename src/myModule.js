//@ts-check
import Axios from 'axios'

/**
 * @param {string} name
 */
export function myName(name) {
  Axios.defaults
  if (/^\w+$/i.test(name)) return `${name}, your name is valid!`
  else throw new Error('Your name is invalid')
}

/**
 * @param {string} name
 */
export async function myAsyncName(name) {
  return new Promise((resolve) => {
    if (/^\w+$/i.test(name)) resolve(`${name}, your name is valid!`)
    else throw new Error('Your name is invalid')
  })
}
