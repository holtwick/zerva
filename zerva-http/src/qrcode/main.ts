/* Converted to TypeScript + ESM to fit project build (keeps original runtime behavior) */
import * as process from 'node:process'
import * as QRCodeModule from './QRCode/index.js'
import * as QRErrorCorrectLevelModule from './QRCode/QRErrorCorrectLevel.js'

// CommonJS interop: prefer default when available
const QRCode: any = (QRCodeModule as any)?.default ?? QRCodeModule
const QRErrorCorrectLevel: any = (QRErrorCorrectLevelModule as any)?.default ?? QRErrorCorrectLevelModule

let internalError: any = QRErrorCorrectLevel.L
export function getErrorLevel() { return internalError }

const black = '\x1B[40m  \x1B[0m'
const white = '\x1B[47m  \x1B[0m'
const toCell = (isBlack: boolean) => (isBlack ? black : white)
function repeat(color: string) {
  return {
    times(count: number) {
      // use Array.from to create an array and join to repeat the string
      return Array.from({ length: count }).join(color)
    },
  }
}

function fill<T>(length: number, value: T): T[] {
  return Array.from({ length }, () => value)
}

export function generate(input: string, opts?: { small?: boolean } | ((out: string) => void), cb?: (out: string) => void) {
  if (typeof opts === 'function') {
    cb = opts as (out: string) => void
    opts = {}
  }

  const qrcode = new QRCode(-1, internalError)
  qrcode.addData(input)
  qrcode.make()

  let output = ''
  if (opts && (opts as any).small) {
    const BLACK = true
    const WHITE = false
    const moduleCount = qrcode.getModuleCount()
    const moduleData = qrcode.modules.slice()

    const oddRow = moduleCount % 2 === 1
    if (oddRow) {
      moduleData.push(fill(moduleCount, WHITE))
    }

    const platte = {
      WHITE_ALL: '\u2588',
      WHITE_BLACK: '\u2580',
      BLACK_WHITE: '\u2584',
      BLACK_ALL: ' ',
    }

    const borderTop = repeat(platte.BLACK_WHITE).times(moduleCount + 3)
    const borderBottom = repeat(platte.WHITE_BLACK).times(moduleCount + 3)
    output += `${borderTop}\n`

    for (let row = 0; row < moduleCount; row += 2) {
      output += platte.WHITE_ALL

      for (let col = 0; col < moduleCount; col++) {
        if (moduleData[row][col] === WHITE && moduleData[row + 1][col] === WHITE) {
          output += platte.WHITE_ALL
        }
        else if (moduleData[row][col] === WHITE && moduleData[row + 1][col] === BLACK) {
          output += platte.WHITE_BLACK
        }
        else if (moduleData[row][col] === BLACK && moduleData[row + 1][col] === WHITE) {
          output += platte.BLACK_WHITE
        }
        else {
          output += platte.BLACK_ALL
        }
      }

      output += `${platte.WHITE_ALL}\n`
    }

    if (!oddRow) {
      output += borderBottom
    }
  }
  else {
    const border = repeat(white).times(qrcode.getModuleCount() + 3)

    output += `${border}\n`
    qrcode.modules.forEach((row: any) => {
      output += white
      output += row.map(toCell).join('')
      output += `${white}\n`
    })
    output += border
  }

  if (cb)
    cb(output)
  else process.stdout.write(output)
}

export function setErrorLevel(err: string) {
  // update internal error value
  internalError = QRErrorCorrectLevel[err] || internalError
}

export default { generate, setErrorLevel, get errorLevel() { return getErrorLevel() } }
