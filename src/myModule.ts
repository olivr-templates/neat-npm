import isNotDefined from 'is-not-defined'

export function myName(name: string): string {
  if (isNotDefined(name)) throw new Error('You need to specify a name')
  else if (/^\w+$/i.test(name)) return `${name}, your name is valid!`
  else return `${name} is an invalid name!`
}

export async function myAsyncName(name: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (isNotDefined(name)) throw new Error('You need to specify a name')
    else if (/^\w+$/i.test(name)) resolve(`${name}, your name is valid!`)
    else reject(`${name} is an invalid name!`)
  })
}
