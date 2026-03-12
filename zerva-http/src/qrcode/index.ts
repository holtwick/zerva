/* eslint-disable no-console */
// An awesome idea originally by
// https://github.com/svitejs/vite-plugin-qrcode (MIT)

import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import os from 'node:os'
import qr from './main'

export function logQrcode(http: Server) {
  const networkUrls = getNetworkUrls(http)
  if (networkUrls.length === 0) {
    return
  }

  console.info('📱 Scan QR Code to access from mobile:')
  console.info('─'.repeat(80))

  for (const url of networkUrls) {
    qr.generate(url, { small: true }, (result) => {
      console.info(`\n   ${colorizeCyan(url)}`)
      console.info(`   ${result.replace(/\n/g, '\n   ')}`)
    })
  }

  console.info(`${'═'.repeat(80)}\n`)
}

function colorizeCyan(str: string): string {
  return `\x1B[36m${str}\x1B[0m`
}

// // Referenced from https://github.com/vitejs/vite/blob/77447496704e61cdb68b5788d8d79f19a2d895f1/packages/vite/src/node/logger.ts#L143
function getNetworkUrls(server: Server): string[] {
  const address = server?.address()
  if (!isAddressInfo(address))
    return []
  // const hostname = resolveHostname(server.config.server.host)
  // if (hostname.host === "127.0.0.1") return []
  const protocol = 'http'
  const port = address.port

  return Object.values(os.networkInterfaces())
    .flatMap(nInterface => nInterface ?? [])
    .filter(
      detail =>
        detail
        && detail.address
        && (detail.family === 'IPv4' || +detail.family === 4)
        && !detail.address.includes('127.0.0.1'),
    )
    .map(detail => `${protocol}://${detail.address}:${port}`)
}

function isAddressInfo(v: any): v is AddressInfo {
  return v.address
}
