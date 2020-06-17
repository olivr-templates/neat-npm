export function myName(name) {
  if (/^\w+$/i.test(name)) return `${name}, your name is valid!`
  else throw new Error('Your name is invalid')
}

export async function myAsyncName(name) {
  return new Promise((resolve) => {
    if (/^\w+$/i.test(name)) resolve(`${name}, your name is valid!`)
    else throw new Error('Your name is invalid')
  })
}
