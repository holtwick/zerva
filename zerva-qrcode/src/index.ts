// An awesome idea originally by
// https://github.com/svitejs/vite-plugin-qrcode (MIT)

import { on } from "@zerva/core"
import type { Server } from "http"
import { AddressInfo } from "net"
import os from "os"
import qr from "qrcode-terminal"
import { Logger } from "zeed"
import "@zerva/http"

const log = Logger("zerva:qrcode")

function logQrcode(http: Server) {
  const networkUrls = getNetworkUrls(http)
  if (networkUrls.length === 0) return
  console.info("  Visit page on mobile:")
  for (const url of networkUrls) {
    qr.generate(url, { small: true }, (result) => {
      console.info(`\n  ${cyan(url)}\n  ${result.replace(/\n/g, "\n  ")}\n`)
    })
  }
}

function cyan(str: string): string {
  return `\x1b[36m${str}\x1b[0m`
}

// // Referenced from https://github.com/vitejs/vite/blob/77447496704e61cdb68b5788d8d79f19a2d895f1/packages/vite/src/node/logger.ts#L143
function getNetworkUrls(server: Server): string[] {
  const address = server?.address()
  if (!isAddressInfo(address)) return []
  // const hostname = resolveHostname(server.config.server.host)
  // if (hostname.host === "127.0.0.1") return []
  const protocol = "http"
  const port = address.port
  return Object.values(os.networkInterfaces())
    .flatMap((nInterface) => nInterface ?? [])
    .filter(
      (detail) =>
        detail &&
        detail.address &&
        detail.family === "IPv4" &&
        !detail.address.includes("127.0.0.1")
    )
    .map((detail) => `${protocol}://${detail.address}:${port}`)
}

function isAddressInfo(v: any): v is AddressInfo {
  return v.address
}

// // Copied from https://github.com/vitejs/vite/blob/77447496704e61cdb68b5788d8d79f19a2d895f1/packages/vite/src/node/utils.ts#L531
// function resolveHostname(optionsHost: string | boolean | undefined): Hostname {
//   let host: string | undefined
//   if (
//     optionsHost === undefined ||
//     optionsHost === false ||
//     optionsHost === "localhost"
//   ) {
//     // Use a secure default
//     host = "127.0.0.1"
//   } else if (optionsHost === true) {
//     // If passed --host in the CLI without arguments
//     host = undefined // undefined typically means 0.0.0.0 or :: (listen on all IPs)
//   } else {
//     host = optionsHost
//   }

//   // Set host name to localhost when possible, unless the user explicitly asked for '127.0.0.1'
//   const name =
//     (optionsHost !== "127.0.0.1" && host === "127.0.0.1") ||
//     host === "0.0.0.0" ||
//     host === "::" ||
//     host === undefined
//       ? "localhost"
//       : host

//   return { host, name }
// }

// interface Hostname {
//   // undefined sets the default behaviour of server.listen
//   host: string | undefined
//   // resolve to localhost when possible
//   name: string
// }

export function useQrCode() {
  log("qrcode")
  on("httpRunning", ({ http }) => {
    logQrcode(http)
  })
}
