export function myNameTs(name: string): string {
  if (/^\w+$/i.test(name)) return `${name}, your name is valid!`
  else throw new Error('Your name is invalid')
}

export async function myAsyncNameTs(name: string): Promise<string> {
  return new Promise((resolve) => {
    if (/^\w+$/i.test(name)) resolve(`${name}, your name is valid!`)
    else throw new Error('Your name is invalid')
  })
}

export default { myNameTs, myAsyncNameTs }
