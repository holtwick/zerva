import type { Request } from './types'
import fs from 'node:fs'
import process from 'node:process'

export function isRequestProxied(req: Request) {
  const h = req.headers
  return !!(h['x-forwarded-for'] || h['x-forwarded-proto'] || h['x-forwarded-host']
    || h['x-forwarded-port'] || h.via || h['cf-connecting-ip'] || h['cf-ray'])
}

// Format a filesystem path for route description (absolute + ~ for home)
export function formatStaticPath(p: string): string {
  let absPath: string
  try {
    // Resolve real path (follows symlinks). This will throw if the path does not exist.
    absPath = fs.realpathSync(p)
  }
  catch {
    // Fallback: make a best-effort absolute path relative to cwd (works cross-platform)
    const isAbsolute = p.startsWith('/') || /^[A-Za-z]:[\\/]/.test(p)
    absPath = isAbsolute ? p : `${process.cwd()}/${p}`
  }

  // If the path is inside the user's home directory, show it using ~
  const homeDir = process.env.HOME || process.env.USERPROFILE || ''
  if (!homeDir)
    return absPath

  // Remove any trailing slashes from homeDir for consistent comparison
  const normalizedHome = homeDir.replace(/[\\/]+$/, '')
  if (absPath === normalizedHome)
    return '~'

  if (absPath.startsWith(`${normalizedHome}/`) || absPath.startsWith(`${normalizedHome}\\`))
    return `~${absPath.slice(normalizedHome.length)}`

  return absPath
}
