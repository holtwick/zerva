/*!
 * compression
 * Copyright(c) 2010 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

import accepts from 'accepts'
import bytes from 'bytes'
import compressible from 'compressible'
import onHeaders from 'on-headers'
import vary from 'vary'
import zlib from 'zlib'
import { IncomingMessage } from 'http'
import { Readable } from 'stream'
import { Buffer } from 'node:buffer'

var cacheControlNoTransformRegExp = /(?:^|,)\s*?no-transform\s*?(?:,|$)/

/**
 * Compress response data with gzip / deflate.
 *
 * @param {Object} [options]
 * @return {Function} middleware
 * @public
 */

export function compressionMiddleware(options: any = {}) {
  var opts = options || {}

  // options
  var filter = opts.filter || shouldCompress
  var threshold = bytes.parse(opts.threshold)

  if (threshold == null) {
    threshold = 1024
  }

  return function compression(req: IncomingMessage, res: any, next: () => void) {
    var ended = false
    var length: number
    var listeners: any = []
    var stream: zlib.Gzip

    var _end = res.end
    var _on = res.on
    var _write = res.write

    // flush
    res.flush = function flush() {
      if (stream) {
        stream.flush()
      }
    }

    // proxy

    res.write = function write(chunk: any, encoding: any) {
      if (ended) {
        return false
      }

      if (!this._header) {
        this._implicitHeader()
      }

      return stream
        ? stream.write(toBuffer(chunk, encoding))
        : _write.call(this, chunk, encoding)
    }

    res.end = function end(chunk: any, encoding: any) {
      if (ended) {
        return false
      }

      if (!this._header) {
        // estimate the length
        if (!this.getHeader('Content-Length')) {
          length = chunkLength(chunk, encoding)
        }

        this._implicitHeader()
      }

      if (!stream) {
        return _end.call(this, chunk, encoding)
      }

      // mark ended
      ended = true

      // write Buffer for Node.js 0.8
      return chunk
        ? stream.end(toBuffer(chunk, encoding))
        : stream.end()
    }

    res.on = function on(type: string, listener: any) {
      if (!listeners || type !== 'drain') {
        return _on.call(this, type, listener)
      }

      if (stream) {
        return stream.on(type, listener)
      }

      // buffer listeners for future stream
      listeners.push([type, listener])

      return this
    }

    function nocompress(msg: string) {
      addListeners(res, _on, listeners)
      listeners = null
    }

    onHeaders(res, function onResponseHeaders() {
      // determine if request is filtered
      if (!filter(req, res)) {
        nocompress('filtered')
        return
      }

      // determine if the entity should be transformed
      if (!shouldTransform(req, res)) {
        nocompress('no transform')
        return
      }

      // vary
      vary(res, 'Accept-Encoding')

      // content-length below threshold
      if (Number(res.getHeader('Content-Length')) < threshold || length < threshold) {
        nocompress('size below threshold')
        return
      }

      var encoding = res.getHeader('Content-Encoding') || 'identity'

      // already encoded
      if (encoding !== 'identity') {
        nocompress('already encoded')
        return
      }

      // head
      if (req.method === 'HEAD') {
        nocompress('HEAD request')
        return
      }

      // compression method
      var accept = accepts(req)
      var method = accept.encoding(['gzip', 'deflate', 'identity'])

      // we really don't prefer deflate
      if (method === 'deflate' && accept.encoding(['gzip'])) {
        method = accept.encoding(['gzip', 'identity'])
      }

      // negotiation failed
      if (!method || method === 'identity') {
        nocompress('not acceptable')
        return
      }

      // compression stream      
      stream = method === 'gzip'
        ? zlib.createGzip(opts)
        : zlib.createDeflate(opts)

      // add buffered listeners to stream
      addListeners(stream, stream.on, listeners)

      // header fields
      res.setHeader('Content-Encoding', method)
      res.removeHeader('Content-Length')

      // compression
      stream.on('data', function onStreamData(chunk) {
        if (_write.call(res, chunk) === false) {
          stream.pause()
        }
      })

      stream.on('end', function onStreamEnd() {
        _end.call(res)
      })

      _on.call(res, 'drain', function onResponseDrain() {
        stream.resume()
      })
    })

    next()
  }
}

/**
 * Add bufferred listeners to stream
 * @private
 */

function addListeners(stream: zlib.Gzip, on: { (event: "close", listener: () => void): zlib.Gzip; (event: "data", listener: (chunk: any) => void): zlib.Gzip; (event: "drain", listener: () => void): zlib.Gzip; (event: "end", listener: () => void): zlib.Gzip; (event: "error", listener: (err: Error) => void): zlib.Gzip; (event: "finish", listener: () => void): zlib.Gzip; (event: "pause", listener: () => void): zlib.Gzip; (event: "pipe", listener: (src: Readable) => void): zlib.Gzip; (event: "readable", listener: () => void): zlib.Gzip; (event: "resume", listener: () => void): zlib.Gzip; (event: "unpipe", listener: (src: Readable) => void): zlib.Gzip; (event: string | symbol, listener: (...args: any[]) => void): zlib.Gzip; apply?: any }, listeners: string | any[]) {
  for (var i = 0; i < listeners.length; i++) {
    on.apply(stream, listeners[i])
  }
}

/**
 * Get the length of a given chunk
 */

function chunkLength(chunk: any, encoding: string | undefined) {
  if (!chunk) {
    return 0
  }

  return !Buffer.isBuffer(chunk)
    ? Buffer.byteLength(chunk, encoding as any)
    : chunk.length
}

/**
 * Default filter function.
 * @private
 */

function shouldCompress(req: any, res: { getHeader: (arg0: string) => any }) {
  var type = res.getHeader('Content-Type')

  if (type === undefined || !compressible(type)) {
    return false
  }

  return true
}

/**
 * Determine if the entity should be transformed.
 * @private
 */

function shouldTransform(req: any, res: { getHeader: (arg0: string) => any }) {
  var cacheControl = res.getHeader('Cache-Control')

  // Don't compress for Cache-Control: no-transform
  // https://tools.ietf.org/html/rfc7234#section-5.2.2.4
  return !cacheControl ||
    !cacheControlNoTransformRegExp.test(cacheControl)
}

/**
 * Coerce arguments to Buffer
 * @private
 */

function toBuffer(chunk: ArrayBuffer, encoding: number | undefined) {
  return !Buffer.isBuffer(chunk)
    ? Buffer.from(chunk, encoding)
    : chunk
}