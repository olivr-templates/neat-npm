import Axios from 'axios'

export function myName(name: string): string {
  Axios.defaults
  if (/^\w+$/i.test(name)) return `${name}, your name is valid!`
  else throw new Error('Your name is invalid')
}

export async function myAsyncName(name: string): Promise<string> {
  return new Promise((resolve) => {
    if (/^\w+$/i.test(name)) resolve(`${name}, your name is valid!`)
    else throw new Error('Your name is invalid')
  })
}
