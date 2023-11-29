/* eslint-disable prefer-rest-params */
/*!
 * accepts
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

import Negotiator from 'negotiator'
import mime from 'mime'

function Accepts(this: any, req: any) {
  if (!(this instanceof Accepts)) {
    // @ts-expect-error xxx
    return new Accepts(req)
  }

  // @ts-expect-error xxx
  this.headers = req.headers
  // @ts-expect-error xxx
  this.negotiator = new Negotiator(req)
}

/**
 * Check if the given `type(s)` is acceptable, returning
 * the best match when true, otherwise `undefined`, in which
 * case you should respond with 406 "Not Acceptable".
 *
 * The `type` value may be a single mime type string
 * such as "application/json", the extension name
 * such as "json" or an array `["json", "html", "text/plain"]`. When a list
 * or array is given the _best_ match, if any is returned.
 *
 * Examples:
 *
 *     // Accept: text/html
 *     this.types('html');
 *     // => "html"
 *
 *     // Accept: text/*, application/json
 *     this.types('html');
 *     // => "html"
 *     this.types('text/html');
 *     // => "text/html"
 *     this.types('json', 'text');
 *     // => "json"
 *     this.types('application/json');
 *     // => "application/json"
 *
 *     // Accept: text/*, application/json
 *     this.types('image/png');
 *     this.types('png');
 *     // => undefined
 *
 *     // Accept: text/*;q=.5, application/json
 *     this.types(['html', 'json']);
 *     this.types('html', 'json');
 *     // => "json"
 *
 * @param {string | Array} types...
 * @return {string | Array | boolean}
 * @public
 */

Accepts.prototype.type
  = Accepts.prototype.types = function (types_: any) {
    let types = types_

    // support flattened arguments
    if (types && !Array.isArray(types)) {
      types = Array.from({ length: arguments.length })
      for (let i = 0; i < types.length; i++)
        types[i] = arguments[i]
    }

    // no types, return all requested types
    if (!types || types.length === 0)
      return this.negotiator.mediaTypes()

    // no accept header, return first given type
    if (!this.headers.accept)
      return types[0]

    const mimes = types.map(extToMime)
    const accepts = this.negotiator.mediaTypes(mimes.filter(validMime))
    const first = accepts[0]

    return first
      ? types[mimes.indexOf(first)]
      : false
  }

/**
 * Return accepted encodings or best fit based on `encodings`.
 *
 * Given `Accept-Encoding: gzip, deflate`
 * an array sorted by quality is returned:
 *
 *     ['gzip', 'deflate']
 *
 * @param {string | Array} encodings...
 * @return {string | Array}
 * @public
 */

Accepts.prototype.encoding
  = Accepts.prototype.encodings = function (encodings_: any) {
    let encodings = encodings_

    // support flattened arguments
    if (encodings && !Array.isArray(encodings)) {
      encodings = Array.from({ length: arguments.length })
      for (let i = 0; i < encodings.length; i++)
        encodings[i] = arguments[i]
    }

    // no encodings, return all requested encodings
    if (!encodings || encodings.length === 0)
      return this.negotiator.encodings()

    return this.negotiator.encodings(encodings)[0] || false
  }

/**
 * Return accepted charsets or best fit based on `charsets`.
 *
 * Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5`
 * an array sorted by quality is returned:
 *
 *     ['utf-8', 'utf-7', 'iso-8859-1']
 *
 * @param {string | Array} charsets...
 * @return {string | Array}
 * @public
 */

Accepts.prototype.charset
  = Accepts.prototype.charsets = function (charsets_: any) {
    let charsets = charsets_

    // support flattened arguments
    if (charsets && !Array.isArray(charsets)) {
      charsets = Array.from({ length: arguments.length })
      for (let i = 0; i < charsets.length; i++)
        charsets[i] = arguments[i]
    }

    // no charsets, return all requested charsets
    if (!charsets || charsets.length === 0)
      return this.negotiator.charsets()

    return this.negotiator.charsets(charsets)[0] || false
  }

/**
 * Return accepted languages or best fit based on `langs`.
 *
 * Given `Accept-Language: en;q=0.8, es, pt`
 * an array sorted by quality is returned:
 *
 *     ['es', 'pt', 'en']
 *
 * @param {string | Array} langs...
 * @return {Array | string}
 * @public
 */

Accepts.prototype.lang
  = Accepts.prototype.langs
  = Accepts.prototype.language
  = Accepts.prototype.languages = function (languages_: any) {
        let languages = languages_

        // support flattened arguments
        if (languages && !Array.isArray(languages)) {
          languages = Array.from({ length: arguments.length })
          for (let i = 0; i < languages.length; i++)
            languages[i] = arguments[i]
        }

        // no languages, return all requested languages
        if (!languages || languages.length === 0)
          return this.negotiator.languages()

        return this.negotiator.languages(languages)[0] || false
      }

/**
 * Convert extnames to mime.
 *
 * @param {string} type
 * @return {string}
 * @private
 */

function extToMime(type: string | string[]) {
  return !type.includes('/')
    ? mime.getType(String(type))
    : type
}

/**
 * Check if mime is valid.
 *
 * @param {string} type
 * @return {string}
 * @private
 */

function validMime(type: any) {
  return typeof type === 'string'
}

export default Accepts
