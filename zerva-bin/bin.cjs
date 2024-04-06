#!/usr/bin/env node
'use strict'; const Oc = Object.create; const jn = Object.defineProperty; const _c = Object.getOwnPropertyDescriptor; const Pc = Object.getOwnPropertyNames; const Dc = Object.getPrototypeOf; const Bc = Object.prototype.hasOwnProperty; const m = (e, r) => () => (r || e((r = { exports: {} }).exports, r), r.exports); function Nc(e, r, t, n) {
  if (r && typeof r == 'object' || typeof r == 'function')
    for (const i of Pc(r))!Bc.call(e, i) && i !== t && jn(e, i, { get: () => r[i], enumerable: !(n = _c(r, i)) || n.enumerable }); return e
} const we = (e, r, t) => (t = e != null ? Oc(Dc(e)) : {}, Nc(r || !e || !e.__esModule ? jn(t, 'default', { value: e, enumerable: !0 }) : t, e)); const Y = m((yt) => {
  'use strict'; yt.fromCallback = function (e) {
    return Object.defineProperty(function (...r) {
      if (typeof r[r.length - 1] == 'function')
        e.apply(this, r); else return new Promise((t, n) => { e.call(this, ...r, (i, o) => i != null ? n(i) : t(o)) })
    }, 'name', { value: e.name })
  }; yt.fromPromise = function (e) {
    return Object.defineProperty(function (...r) {
      const t = r[r.length - 1]; if (typeof t != 'function')
        return e.apply(this, r); e.apply(this, r.slice(0, -1)).then(n => t(null, n), t)
    }, 'name', { value: e.name })
  }
}); const Hn = m((dy, Gn) => {
  const te = require('node:constants'); const Uc = process.cwd; let gr = null; const Mc = process.env.GRACEFUL_FS_PLATFORM || process.platform; process.cwd = function () { return gr || (gr = Uc.call(process)), gr }; try { process.cwd() }
  catch {} typeof process.chdir == 'function' && (gt = process.chdir, process.chdir = function (e) { gr = null, gt.call(process, e) }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, gt)); let gt; Gn.exports = Rc; function Rc(e) {
    te.hasOwnProperty('O_SYMLINK') && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && r(e), e.lutimes || t(e), e.chown = o(e.chown), e.fchown = o(e.fchown), e.lchown = o(e.lchown), e.chmod = n(e.chmod), e.fchmod = n(e.fchmod), e.lchmod = n(e.lchmod), e.chownSync = s(e.chownSync), e.fchownSync = s(e.fchownSync), e.lchownSync = s(e.lchownSync), e.chmodSync = i(e.chmodSync), e.fchmodSync = i(e.fchmodSync), e.lchmodSync = i(e.lchmodSync), e.stat = u(e.stat), e.fstat = u(e.fstat), e.lstat = u(e.lstat), e.statSync = a(e.statSync), e.fstatSync = a(e.fstatSync), e.lstatSync = a(e.lstatSync), e.chmod && !e.lchmod && (e.lchmod = function (c, f, p) { p && process.nextTick(p) }, e.lchmodSync = function () {}), e.chown && !e.lchown && (e.lchown = function (c, f, p, d) { d && process.nextTick(d) }, e.lchownSync = function () {}), Mc === 'win32' && (e.rename = typeof e.rename != 'function' ? e.rename : (function (c) { function f(p, d, h) { const y = Date.now(); let g = 0; c(p, d, function x(v) { if (v && (v.code === 'EACCES' || v.code === 'EPERM' || v.code === 'EBUSY') && Date.now() - y < 6e4) { setTimeout(() => { e.stat(d, (D, re) => { D && D.code === 'ENOENT' ? c(p, d, x) : h(v) }) }, g), g < 100 && (g += 10); return }h && h(v) }) } return Object.setPrototypeOf && Object.setPrototypeOf(f, c), f }(e.rename))), e.read = typeof e.read != 'function'
      ? e.read
      : (function (c) {
          function f(p, d, h, y, g, x) {
            let v; if (x && typeof x == 'function') {
              let D = 0; v = function (re, je, Ge) {
                if (re && re.code === 'EAGAIN' && D < 10)
                  return D++, c.call(e, p, d, h, y, g, v); x.apply(this, arguments)
              }
            } return c.call(e, p, d, h, y, g, v)
          } return Object.setPrototypeOf && Object.setPrototypeOf(f, c), f
        }(e.read)), e.readSync = typeof e.readSync != 'function'
      ? e.readSync
      : (function (c) {
          return function (f, p, d, h, y) {
            for (let g = 0; ;) {
              try { return c.call(e, f, p, d, h, y) }
              catch (x) { if (x.code === 'EAGAIN' && g < 10) { g++; continue } throw x }
            }
          }
        }(e.readSync)); function r(c) {
      c.lchmod = function (f, p, d) { c.open(f, te.O_WRONLY | te.O_SYMLINK, p, (h, y) => { if (h) { d && d(h); return }c.fchmod(y, p, (g) => { c.close(y, (x) => { d && d(g || x) }) }) }) }, c.lchmodSync = function (f, p) {
        const d = c.openSync(f, te.O_WRONLY | te.O_SYMLINK, p); let h = !0; let y; try { y = c.fchmodSync(d, p), h = !1 }
        finally {
          if (h) {
            try { c.closeSync(d) }
            catch {}
          }
          else { c.closeSync(d) }
        } return y
      }
    } function t(c) {
      te.hasOwnProperty('O_SYMLINK') && c.futimes
        ? (c.lutimes = function (f, p, d, h) { c.open(f, te.O_SYMLINK, (y, g) => { if (y) { h && h(y); return }c.futimes(g, p, d, (x) => { c.close(g, (v) => { h && h(x || v) }) }) }) }, c.lutimesSync = function (f, p, d) {
            const h = c.openSync(f, te.O_SYMLINK); let y; let g = !0; try { y = c.futimesSync(h, p, d), g = !1 }
            finally {
              if (g) {
                try { c.closeSync(h) }
                catch {}
              }
              else { c.closeSync(h) }
            } return y
          })
        : c.futimes && (c.lutimes = function (f, p, d, h) { h && process.nextTick(h) }, c.lutimesSync = function () {})
    } function n(c) { return c && function (f, p, d) { return c.call(e, f, p, function (h) { l(h) && (h = null), d && d.apply(this, arguments) }) } } function i(c) {
      return c && function (f, p) {
        try { return c.call(e, f, p) }
        catch (d) {
          if (!l(d))
            throw d
        }
      }
    } function o(c) { return c && function (f, p, d, h) { return c.call(e, f, p, d, function (y) { l(y) && (y = null), h && h.apply(this, arguments) }) } } function s(c) {
      return c && function (f, p, d) {
        try { return c.call(e, f, p, d) }
        catch (h) {
          if (!l(h))
            throw h
        }
      }
    } function u(c) { return c && function (f, p, d) { typeof p == 'function' && (d = p, p = null); function h(y, g) { g && (g.uid < 0 && (g.uid += 4294967296), g.gid < 0 && (g.gid += 4294967296)), d && d.apply(this, arguments) } return p ? c.call(e, f, p, h) : c.call(e, f, h) } } function a(c) { return c && function (f, p) { const d = p ? c.call(e, f, p) : c.call(e, f); return d && (d.uid < 0 && (d.uid += 4294967296), d.gid < 0 && (d.gid += 4294967296)), d } } function l(c) {
      if (!c || c.code === 'ENOSYS')
        return !0; const f = !process.getuid || process.getuid() !== 0; return !!(f && (c.code === 'EINVAL' || c.code === 'EPERM'))
    }
  }
}); const Vn = m((py, Yn) => {
  const Wn = require('node:stream').Stream; Yn.exports = qc; function qc(e) {
    return { ReadStream: r, WriteStream: t }; function r(n, i) {
      if (!(this instanceof r))
        return new r(n, i); Wn.call(this); const o = this; this.path = n, this.fd = null, this.readable = !0, this.paused = !1, this.flags = 'r', this.mode = 438, this.bufferSize = 64 * 1024, i = i || {}; for (let s = Object.keys(i), u = 0, a = s.length; u < a; u++) { const l = s[u]; this[l] = i[l] } if (this.encoding && this.setEncoding(this.encoding), this.start !== void 0) {
        if (typeof this.start != 'number')
          throw new TypeError('start must be a Number'); if (this.end === void 0)
          this.end = 1 / 0; else if (typeof this.end != 'number')
          throw new TypeError('end must be a Number'); if (this.start > this.end)
          throw new Error('start must be <= end'); this.pos = this.start
      } if (this.fd !== null) { process.nextTick(() => { o._read() }); return }e.open(this.path, this.flags, this.mode, (c, f) => { if (c) { o.emit('error', c), o.readable = !1; return }o.fd = f, o.emit('open', f), o._read() })
    } function t(n, i) {
      if (!(this instanceof t))
        return new t(n, i); Wn.call(this), this.path = n, this.fd = null, this.writable = !0, this.flags = 'w', this.encoding = 'binary', this.mode = 438, this.bytesWritten = 0, i = i || {}; for (let o = Object.keys(i), s = 0, u = o.length; s < u; s++) { const a = o[s]; this[a] = i[a] } if (this.start !== void 0) {
        if (typeof this.start != 'number')
          throw new TypeError('start must be a Number'); if (this.start < 0)
          throw new Error('start must be >= zero'); this.pos = this.start
      } this.busy = !1, this._queue = [], this.fd === null && (this._open = e.open, this._queue.push([this._open, this.path, this.flags, this.mode, void 0]), this.flush())
    }
  }
}); const Kn = m((my, zn) => {
  'use strict'; zn.exports = jc; const $c = Object.getPrototypeOf || function (e) { return e.__proto__ }; function jc(e) {
    if (e === null || typeof e != 'object')
      return e; if (e instanceof Object)
      var r = { __proto__: $c(e) }; else var r = Object.create(null); return Object.getOwnPropertyNames(e).forEach((t) => { Object.defineProperty(r, t, Object.getOwnPropertyDescriptor(e, t)) }), r
  }
}); const R = m((hy, xt) => {
  const k = require('node:fs'); const Gc = Hn(); const Hc = Vn(); const Wc = Kn(); const wr = require('node:util'); let M; let xr; typeof Symbol == 'function' && typeof Symbol.for == 'function' ? (M = Symbol.for('graceful-fs.queue'), xr = Symbol.for('graceful-fs.previous')) : (M = '___graceful-fs.queue', xr = '___graceful-fs.previous'); function Yc() {} function Xn(e, r) { Object.defineProperty(e, M, { get() { return r } }) } let ce = Yc; wr.debuglog
    ? ce = wr.debuglog('gfs4')
    : /\bgfs4\b/i.test(process.env.NODE_DEBUG || '') && (ce = function () {
      let e = wr.format.apply(wr, arguments); e = `GFS4: ${e.split(/\n/).join(`
GFS4: `)}`, console.error(e)
    }); k[M] || (Jn = global[M] || [], Xn(k, Jn), k.close = (function (e) { function r(t, n) { return e.call(k, t, function (i) { i || Zn(), typeof n == 'function' && n.apply(this, arguments) }) } return Object.defineProperty(r, xr, { value: e }), r }(k.close)), k.closeSync = (function (e) { function r(t) { e.apply(k, arguments), Zn() } return Object.defineProperty(r, xr, { value: e }), r }(k.closeSync)), /\bgfs4\b/i.test(process.env.NODE_DEBUG || '') && process.on('exit', () => { ce(k[M]), require('node:assert').equal(k[M].length, 0) })); let Jn; global[M] || Xn(global, k[M]); xt.exports = wt(Wc(k)); process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !k.__patched && (xt.exports = wt(k), k.__patched = !0); function wt(e) { Gc(e), e.gracefulify = wt, e.createReadStream = je, e.createWriteStream = Ge; const r = e.readFile; e.readFile = t; function t(S, b, E) { return typeof b == 'function' && (E = b, b = null), B(S, b, E); function B(N, _, I, L) { return r(N, _, function (T) { T && (T.code === 'EMFILE' || T.code === 'ENFILE') ? ve([B, [N, _, I], T, L || Date.now(), Date.now()]) : typeof I == 'function' && I.apply(this, arguments) }) } } const n = e.writeFile; e.writeFile = i; function i(S, b, E, B) { return typeof E == 'function' && (B = E, E = null), N(S, b, E, B); function N(_, I, L, T, U) { return n(_, I, L, function (A) { A && (A.code === 'EMFILE' || A.code === 'ENFILE') ? ve([N, [_, I, L, T], A, U || Date.now(), Date.now()]) : typeof T == 'function' && T.apply(this, arguments) }) } } const o = e.appendFile; o && (e.appendFile = s); function s(S, b, E, B) { return typeof E == 'function' && (B = E, E = null), N(S, b, E, B); function N(_, I, L, T, U) { return o(_, I, L, function (A) { A && (A.code === 'EMFILE' || A.code === 'ENFILE') ? ve([N, [_, I, L, T], A, U || Date.now(), Date.now()]) : typeof T == 'function' && T.apply(this, arguments) }) } } const u = e.copyFile; u && (e.copyFile = a); function a(S, b, E, B) { return typeof E == 'function' && (B = E, E = 0), N(S, b, E, B); function N(_, I, L, T, U) { return u(_, I, L, function (A) { A && (A.code === 'EMFILE' || A.code === 'ENFILE') ? ve([N, [_, I, L, T], A, U || Date.now(), Date.now()]) : typeof T == 'function' && T.apply(this, arguments) }) } } const l = e.readdir; e.readdir = f; const c = /^v[0-5]\./; function f(S, b, E) { typeof b == 'function' && (E = b, b = null); const B = c.test(process.version) ? function (I, L, T, U) { return l(I, N(I, L, T, U)) } : function (I, L, T, U) { return l(I, L, N(I, L, T, U)) }; return B(S, b, E); function N(_, I, L, T) { return function (U, A) { U && (U.code === 'EMFILE' || U.code === 'ENFILE') ? ve([B, [_, I, L], U, T || Date.now(), Date.now()]) : (A && A.sort && A.sort(), typeof L == 'function' && L.call(this, U, A)) } } } if (process.version.substr(0, 4) === 'v0.8') { const p = Hc(e); x = p.ReadStream, D = p.WriteStream } const d = e.ReadStream; d && (x.prototype = Object.create(d.prototype), x.prototype.open = v); const h = e.WriteStream; h && (D.prototype = Object.create(h.prototype), D.prototype.open = re), Object.defineProperty(e, 'ReadStream', { get() { return x }, set(S) { x = S }, enumerable: !0, configurable: !0 }), Object.defineProperty(e, 'WriteStream', { get() { return D }, set(S) { D = S }, enumerable: !0, configurable: !0 }); let y = x; Object.defineProperty(e, 'FileReadStream', { get() { return y }, set(S) { y = S }, enumerable: !0, configurable: !0 }); let g = D; Object.defineProperty(e, 'FileWriteStream', { get() { return g }, set(S) { g = S }, enumerable: !0, configurable: !0 }); function x(S, b) { return this instanceof x ? (d.apply(this, arguments), this) : x.apply(Object.create(x.prototype), arguments) } function v() { const S = this; ht(S.path, S.flags, S.mode, (b, E) => { b ? (S.autoClose && S.destroy(), S.emit('error', b)) : (S.fd = E, S.emit('open', E), S.read()) }) } function D(S, b) { return this instanceof D ? (h.apply(this, arguments), this) : D.apply(Object.create(D.prototype), arguments) } function re() { const S = this; ht(S.path, S.flags, S.mode, (b, E) => { b ? (S.destroy(), S.emit('error', b)) : (S.fd = E, S.emit('open', E)) }) } function je(S, b) { return new e.ReadStream(S, b) } function Ge(S, b) { return new e.WriteStream(S, b) } const yr = e.open; e.open = ht; function ht(S, b, E, B) { return typeof E == 'function' && (B = E, E = null), N(S, b, E, B); function N(_, I, L, T, U) { return yr(_, I, L, function (A, cy) { A && (A.code === 'EMFILE' || A.code === 'ENFILE') ? ve([N, [_, I, L, T], A, U || Date.now(), Date.now()]) : typeof T == 'function' && T.apply(this, arguments) }) } } return e } function ve(e) { ce('ENQUEUE', e[0].name, e[1]), k[M].push(e), vt() } let vr; function Zn() { for (let e = Date.now(), r = 0; r < k[M].length; ++r)k[M][r].length > 2 && (k[M][r][3] = e, k[M][r][4] = e); vt() } function vt() {
    if (clearTimeout(vr), vr = void 0, k[M].length !== 0) {
      const e = k[M].shift(); const r = e[0]; const t = e[1]; const n = e[2]; const i = e[3]; const o = e[4]; if (i === void 0) { ce('RETRY', r.name, t), r.apply(null, t) }
      else if (Date.now() - i >= 6e4) { ce('TIMEOUT', r.name, t); const s = t.pop(); typeof s == 'function' && s.call(null, n) }
      else { const u = Date.now() - o; const a = Math.max(o - i, 1); const l = Math.min(a * 1.2, 100); u >= l ? (ce('RETRY', r.name, t), r.apply(null, t.concat([i]))) : k[M].push(e) }vr === void 0 && (vr = setTimeout(vt, 0))
    }
  }
}); const He = m((ne) => {
  'use strict'; const Qn = Y().fromCallback; const G = R(); const Vc = ['access', 'appendFile', 'chmod', 'chown', 'close', 'copyFile', 'fchmod', 'fchown', 'fdatasync', 'fstat', 'fsync', 'ftruncate', 'futimes', 'lchmod', 'lchown', 'link', 'lstat', 'mkdir', 'mkdtemp', 'open', 'opendir', 'readdir', 'readFile', 'readlink', 'realpath', 'rename', 'rm', 'rmdir', 'stat', 'symlink', 'truncate', 'unlink', 'utimes', 'writeFile'].filter(e => typeof G[e] == 'function'); Object.keys(G).forEach((e) => { e !== 'promises' && (ne[e] = G[e]) }); Vc.forEach((e) => { ne[e] = Qn(G[e]) }); ne.exists = function (e, r) { return typeof r == 'function' ? G.exists(e, r) : new Promise(t => G.exists(e, t)) }; ne.read = function (e, r, t, n, i, o) {
    return typeof o == 'function'
      ? G.read(e, r, t, n, i, o)
      : new Promise((s, u) => {
        G.read(e, r, t, n, i, (a, l, c) => {
          if (a)
            return u(a); s({ bytesRead: l, buffer: c })
        })
      })
  }; ne.write = function (e, r, ...t) {
    return typeof t[t.length - 1] == 'function'
      ? G.write(e, r, ...t)
      : new Promise((n, i) => {
        G.write(e, r, ...t, (o, s, u) => {
          if (o)
            return i(o); n({ bytesWritten: s, buffer: u })
        })
      })
  }; typeof G.writev == 'function' && (ne.writev = function (e, r, ...t) {
    return typeof t[t.length - 1] == 'function'
      ? G.writev(e, r, ...t)
      : new Promise((n, i) => {
        G.writev(e, r, ...t, (o, s, u) => {
          if (o)
            return i(o); n({ bytesWritten: s, buffers: u })
        })
      })
  }); typeof G.realpath.native == 'function' && (ne.realpath.native = Qn(G.realpath.native))
}); const St = m((gy, ei) => { ei.exports = (e) => { const r = process.versions.node.split('.').map(t => Number.parseInt(t, 10)); return e = e.split('.').map(t => Number.parseInt(t, 10)), r[0] > e[0] || r[0] === e[0] && (r[1] > e[1] || r[1] === e[1] && r[2] >= e[2]) } }); const oi = m((wy, Et) => {
  'use strict'; const xe = He(); const Q = require('node:path'); const zc = St(); const ri = zc('10.12.0'); const ti = (e) => { if (process.platform === 'win32' && /[<>:"|?*]/.test(e.replace(Q.parse(e).root, ''))) { const t = new Error(`Path contains invalid characters: ${e}`); throw t.code = 'EINVAL', t } }; const ni = (e) => { const r = { mode: 511 }; return typeof e == 'number' && (e = { mode: e }), { ...r, ...e } }; const ii = (e) => { const r = new Error(`operation not permitted, mkdir '${e}'`); return r.code = 'EPERM', r.errno = -4048, r.path = e, r.syscall = 'mkdir', r }; Et.exports.makeDir = async (e, r) => {
    if (ti(e), r = ni(r), ri) { const n = Q.resolve(e); return xe.mkdir(n, { mode: r.mode, recursive: !0 }) } const t = async (n) => {
      try { await xe.mkdir(n, r.mode) }
      catch (i) {
        if (i.code === 'EPERM')
          throw i; if (i.code === 'ENOENT') {
          if (Q.dirname(n) === n)
            throw ii(n); if (i.message.includes('null bytes'))
            throw i; return await t(Q.dirname(n)), t(n)
        } try {
          if (!(await xe.stat(n)).isDirectory())
            throw new Error('The path is not a directory')
        }
        catch { throw i }
      }
    }; return t(Q.resolve(e))
  }; Et.exports.makeDirSync = (e, r) => {
    if (ti(e), r = ni(r), ri) { const n = Q.resolve(e); return xe.mkdirSync(n, { mode: r.mode, recursive: !0 }) } const t = (n) => {
      try { xe.mkdirSync(n, r.mode) }
      catch (i) {
        if (i.code === 'EPERM')
          throw i; if (i.code === 'ENOENT') {
          if (Q.dirname(n) === n)
            throw ii(n); if (i.message.includes('null bytes'))
            throw i; return t(Q.dirname(n)), t(n)
        } try {
          if (!xe.statSync(n).isDirectory())
            throw new Error('The path is not a directory')
        }
        catch { throw i }
      }
    }; return t(Q.resolve(e))
  }
}); const J = m((vy, si) => { 'use strict'; const Kc = Y().fromPromise; const { makeDir: Jc, makeDirSync: bt } = oi(); const Ct = Kc(Jc); si.exports = { mkdirs: Ct, mkdirsSync: bt, mkdirp: Ct, mkdirpSync: bt, ensureDir: Ct, ensureDirSync: bt } }); const Tt = m((xy, ui) => {
  'use strict'; const Se = R(); function Zc(e, r, t, n) {
    Se.open(e, 'r+', (i, o) => {
      if (i)
        return n(i); Se.futimes(o, r, t, (s) => { Se.close(o, (u) => { n && n(s || u) }) })
    })
  } function Xc(e, r, t) { const n = Se.openSync(e, 'r+'); return Se.futimesSync(n, r, t), Se.closeSync(n) }ui.exports = { utimesMillis: Zc, utimesMillisSync: Xc }
}); const We = m((Sy, fi) => {
  'use strict'; const Ee = He(); const V = require('node:path'); const Qc = require('node:util'); const el = St(); const Sr = el('10.5.0'); const ai = e => Sr ? Ee.stat(e, { bigint: !0 }) : Ee.stat(e); const At = e => Sr ? Ee.statSync(e, { bigint: !0 }) : Ee.statSync(e); function rl(e, r) {
    return Promise.all([ai(e), ai(r).catch((t) => {
      if (t.code === 'ENOENT')
        return null; throw t
    })]).then(([t, n]) => ({ srcStat: t, destStat: n }))
  } function tl(e, r) {
    let t; const n = At(e); try { t = At(r) }
    catch (i) {
      if (i.code === 'ENOENT')
        return { srcStat: n, destStat: null }; throw i
    } return { srcStat: n, destStat: t }
  } function nl(e, r, t, n) {
    Qc.callbackify(rl)(e, r, (i, o) => {
      if (i)
        return n(i); const { srcStat: s, destStat: u } = o; return u && Er(s, u) ? n(new Error('Source and destination must not be the same.')) : s.isDirectory() && Ft(e, r) ? n(new Error(br(e, r, t))) : n(null, { srcStat: s, destStat: u })
    })
  } function il(e, r, t) {
    const { srcStat: n, destStat: i } = tl(e, r); if (i && Er(n, i))
      throw new Error('Source and destination must not be the same.'); if (n.isDirectory() && Ft(e, r))
      throw new Error(br(e, r, t)); return { srcStat: n, destStat: i }
  } function ci(e, r, t, n, i) {
    const o = V.resolve(V.dirname(e)); const s = V.resolve(V.dirname(t)); if (s === o || s === V.parse(s).root)
      return i(); const u = (a, l) => a ? a.code === 'ENOENT' ? i() : i(a) : Er(r, l) ? i(new Error(br(e, t, n))) : ci(e, r, s, n, i); Sr ? Ee.stat(s, { bigint: !0 }, u) : Ee.stat(s, u)
  } function li(e, r, t, n) {
    const i = V.resolve(V.dirname(e)); const o = V.resolve(V.dirname(t)); if (o === i || o === V.parse(o).root)
      return; let s; try { s = At(o) }
    catch (u) {
      if (u.code === 'ENOENT')
        return; throw u
    } if (Er(r, s))
      throw new Error(br(e, t, n)); return li(e, r, o, n)
  } function Er(e, r) { return !!(r.ino && r.dev && r.ino === e.ino && r.dev === e.dev && (Sr || r.ino < Number.MAX_SAFE_INTEGER || r.size === e.size && r.mode === e.mode && r.nlink === e.nlink && r.atimeMs === e.atimeMs && r.mtimeMs === e.mtimeMs && r.ctimeMs === e.ctimeMs && r.birthtimeMs === e.birthtimeMs)) } function Ft(e, r) { const t = V.resolve(e).split(V.sep).filter(i => i); const n = V.resolve(r).split(V.sep).filter(i => i); return t.reduce((i, o, s) => i && n[s] === o, !0) } function br(e, r, t) { return `Cannot ${t} '${e}' to a subdirectory of itself, '${r}'.` }fi.exports = { checkPaths: nl, checkPathsSync: il, checkParentPaths: ci, checkParentPathsSync: li, isSrcSubdir: Ft }
}); const yi = m((Ey, hi) => {
  'use strict'; const q = R(); const Ye = require('node:path'); const ol = J().mkdirsSync; const sl = Tt().utimesMillisSync; const Ve = We(); function ul(e, r, t) {
    typeof t == 'function' && (t = { filter: t }), t = t || {}, t.clobber = 'clobber' in t ? !!t.clobber : !0, t.overwrite = 'overwrite' in t ? !!t.overwrite : t.clobber, t.preserveTimestamps && process.arch === 'ia32' && console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;

    see https://github.com/jprichardson/node-fs-extra/issues/269`); const { srcStat: n, destStat: i } = Ve.checkPathsSync(e, r, 'copy'); return Ve.checkParentPathsSync(e, n, r, 'copy'), al(i, e, r, t)
  } function al(e, r, t, n) {
    if (n.filter && !n.filter(r, t))
      return; const i = Ye.dirname(t); return q.existsSync(i) || ol(i), di(e, r, t, n)
  } function di(e, r, t, n) {
    if (!(n.filter && !n.filter(r, t)))
      return cl(e, r, t, n)
  } function cl(e, r, t, n) {
    const o = (n.dereference ? q.statSync : q.lstatSync)(r); if (o.isDirectory())
      return yl(o, e, r, t, n); if (o.isFile() || o.isCharacterDevice() || o.isBlockDevice())
      return ll(o, e, r, t, n); if (o.isSymbolicLink())
      return vl(e, r, t, n)
  } function ll(e, r, t, n, i) { return r ? fl(e, t, n, i) : pi(e, t, n, i) } function fl(e, r, t, n) {
    if (n.overwrite)
      return q.unlinkSync(t), pi(e, r, t, n); if (n.errorOnExist)
      throw new Error(`'${t}' already exists`)
  } function pi(e, r, t, n) { return q.copyFileSync(r, t), n.preserveTimestamps && dl(e.mode, r, t), It(t, e.mode) } function dl(e, r, t) { return pl(e) && ml(t, e), hl(r, t) } function pl(e) { return (e & 128) === 0 } function ml(e, r) { return It(e, r | 128) } function It(e, r) { return q.chmodSync(e, r) } function hl(e, r) { const t = q.statSync(e); return sl(r, t.atime, t.mtime) } function yl(e, r, t, n, i) {
    if (!r)
      return gl(e.mode, t, n, i); if (r && !r.isDirectory())
      throw new Error(`Cannot overwrite non-directory '${n}' with directory '${t}'.`); return mi(t, n, i)
  } function gl(e, r, t, n) { return q.mkdirSync(t), mi(r, t, n), It(t, e) } function mi(e, r, t) { q.readdirSync(e).forEach(n => wl(n, e, r, t)) } function wl(e, r, t, n) { const i = Ye.join(r, e); const o = Ye.join(t, e); const { destStat: s } = Ve.checkPathsSync(i, o, 'copy'); return di(s, i, o, n) } function vl(e, r, t, n) {
    let i = q.readlinkSync(r); if (n.dereference && (i = Ye.resolve(process.cwd(), i)), e) {
      let o; try { o = q.readlinkSync(t) }
      catch (s) {
        if (s.code === 'EINVAL' || s.code === 'UNKNOWN')
          return q.symlinkSync(i, t); throw s
      } if (n.dereference && (o = Ye.resolve(process.cwd(), o)), Ve.isSrcSubdir(i, o))
        throw new Error(`Cannot copy '${i}' to a subdirectory of itself, '${o}'.`); if (q.statSync(t).isDirectory() && Ve.isSrcSubdir(o, i))
        throw new Error(`Cannot overwrite '${o}' with '${i}'.`); return xl(i, t)
    }
    else { return q.symlinkSync(i, t) }
  } function xl(e, r) { return q.unlinkSync(r), q.symlinkSync(e, r) }hi.exports = ul
}); const kt = m((by, gi) => { 'use strict'; gi.exports = { copySync: yi() } }); const ie = m((Cy, vi) => { 'use strict'; const Sl = Y().fromPromise; const wi = He(); function El(e) { return wi.access(e).then(() => !0).catch(() => !1) }vi.exports = { pathExists: Sl(El), pathExistsSync: wi.existsSync } }); const Ii = m((Ty, Fi) => {
  'use strict'; const z = R(); const ze = require('node:path'); const bl = J().mkdirs; const Cl = ie().pathExists; const Tl = Tt().utimesMillis; const Ke = We(); function Al(e, r, t, n) {
    typeof t == 'function' && !n ? (n = t, t = {}) : typeof t == 'function' && (t = { filter: t }), n = n || function () {}, t = t || {}, t.clobber = 'clobber' in t ? !!t.clobber : !0, t.overwrite = 'overwrite' in t ? !!t.overwrite : t.clobber, t.preserveTimestamps && process.arch === 'ia32' && console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;

    see https://github.com/jprichardson/node-fs-extra/issues/269`), Ke.checkPaths(e, r, 'copy', (i, o) => {
      if (i)
        return n(i); const { srcStat: s, destStat: u } = o; Ke.checkParentPaths(e, s, r, 'copy', a => a ? n(a) : t.filter ? bi(xi, u, e, r, t, n) : xi(u, e, r, t, n))
    })
  } function xi(e, r, t, n, i) {
    const o = ze.dirname(t); Cl(o, (s, u) => {
      if (s)
        return i(s); if (u)
        return Lt(e, r, t, n, i); bl(o, a => a ? i(a) : Lt(e, r, t, n, i))
    })
  } function bi(e, r, t, n, i, o) { Promise.resolve(i.filter(t, n)).then(s => s ? e(r, t, n, i, o) : o(), s => o(s)) } function Lt(e, r, t, n, i) { return n.filter ? bi(Si, e, r, t, n, i) : Si(e, r, t, n, i) } function Si(e, r, t, n, i) {
    (n.dereference ? z.stat : z.lstat)(r, (s, u) => {
      if (s)
        return i(s); if (u.isDirectory())
        return Pl(u, e, r, t, n, i); if (u.isFile() || u.isCharacterDevice() || u.isBlockDevice())
        return Fl(u, e, r, t, n, i); if (u.isSymbolicLink())
        return Nl(e, r, t, n, i)
    })
  } function Fl(e, r, t, n, i, o) { return r ? Il(e, t, n, i, o) : Ci(e, t, n, i, o) } function Il(e, r, t, n, i) {
    if (n.overwrite)
      z.unlink(t, o => o ? i(o) : Ci(e, r, t, n, i)); else return n.errorOnExist ? i(new Error(`'${t}' already exists`)) : i()
  } function Ci(e, r, t, n, i) { z.copyFile(r, t, o => o ? i(o) : n.preserveTimestamps ? kl(e.mode, r, t, i) : Cr(t, e.mode, i)) } function kl(e, r, t, n) { return Ll(e) ? Ol(t, e, i => i ? n(i) : Ei(e, r, t, n)) : Ei(e, r, t, n) } function Ll(e) { return (e & 128) === 0 } function Ol(e, r, t) { return Cr(e, r | 128, t) } function Ei(e, r, t, n) { _l(r, t, i => i ? n(i) : Cr(t, e, n)) } function Cr(e, r, t) { return z.chmod(e, r, t) } function _l(e, r, t) { z.stat(e, (n, i) => n ? t(n) : Tl(r, i.atime, i.mtime, t)) } function Pl(e, r, t, n, i, o) { return r ? r && !r.isDirectory() ? o(new Error(`Cannot overwrite non-directory '${n}' with directory '${t}'.`)) : Ti(t, n, i, o) : Dl(e.mode, t, n, i, o) } function Dl(e, r, t, n, i) {
    z.mkdir(t, (o) => {
      if (o)
        return i(o); Ti(r, t, n, s => s ? i(s) : Cr(t, e, i))
    })
  } function Ti(e, r, t, n) { z.readdir(e, (i, o) => i ? n(i) : Ai(o, e, r, t, n)) } function Ai(e, r, t, n, i) { const o = e.pop(); return o ? Bl(e, o, r, t, n, i) : i() } function Bl(e, r, t, n, i, o) {
    const s = ze.join(t, r); const u = ze.join(n, r); Ke.checkPaths(s, u, 'copy', (a, l) => {
      if (a)
        return o(a); const { destStat: c } = l; Lt(c, s, u, i, f => f ? o(f) : Ai(e, t, n, i, o))
    })
  } function Nl(e, r, t, n, i) {
    z.readlink(r, (o, s) => {
      if (o)
        return i(o); if (n.dereference && (s = ze.resolve(process.cwd(), s)), e)
        z.readlink(t, (u, a) => u ? u.code === 'EINVAL' || u.code === 'UNKNOWN' ? z.symlink(s, t, i) : i(u) : (n.dereference && (a = ze.resolve(process.cwd(), a)), Ke.isSrcSubdir(s, a) ? i(new Error(`Cannot copy '${s}' to a subdirectory of itself, '${a}'.`)) : e.isDirectory() && Ke.isSrcSubdir(a, s) ? i(new Error(`Cannot overwrite '${a}' with '${s}'.`)) : Ul(s, t, i))); else return z.symlink(s, t, i)
    })
  } function Ul(e, r, t) { z.unlink(r, n => n ? t(n) : z.symlink(e, r, t)) }Fi.exports = Al
}); const Ot = m((Ay, ki) => { 'use strict'; const Ml = Y().fromCallback; ki.exports = { copy: Ml(Ii()) } }); const Mi = m((Fy, Ui) => {
  'use strict'; const Li = R(); const Di = require('node:path'); const C = require('node:assert'); const Je = process.platform === 'win32'; function Bi(e) { ['unlink', 'chmod', 'stat', 'lstat', 'rmdir', 'readdir'].forEach((t) => { e[t] = e[t] || Li[t], t = `${t}Sync`, e[t] = e[t] || Li[t] }), e.maxBusyTries = e.maxBusyTries || 3 } function _t(e, r, t) { let n = 0; typeof r == 'function' && (t = r, r = {}), C(e, 'rimraf: missing path'), C.strictEqual(typeof e, 'string', 'rimraf: path should be a string'), C.strictEqual(typeof t, 'function', 'rimraf: callback function required'), C(r, 'rimraf: invalid options argument provided'), C.strictEqual(typeof r, 'object', 'rimraf: options should be object'), Bi(r), Oi(e, r, function i(o) { if (o) { if ((o.code === 'EBUSY' || o.code === 'ENOTEMPTY' || o.code === 'EPERM') && n < r.maxBusyTries) { n++; const s = n * 100; return setTimeout(() => Oi(e, r, i), s) }o.code === 'ENOENT' && (o = null) }t(o) }) } function Oi(e, r, t) {
    C(e), C(r), C(typeof t == 'function'), r.lstat(e, (n, i) => {
      if (n && n.code === 'ENOENT')
        return t(null); if (n && n.code === 'EPERM' && Je)
        return _i(e, r, n, t); if (i && i.isDirectory())
        return Tr(e, r, n, t); r.unlink(e, (o) => {
        if (o) {
          if (o.code === 'ENOENT')
            return t(null); if (o.code === 'EPERM')
            return Je ? _i(e, r, o, t) : Tr(e, r, o, t); if (o.code === 'EISDIR')
            return Tr(e, r, o, t)
        } return t(o)
      })
    })
  } function _i(e, r, t, n) { C(e), C(r), C(typeof n == 'function'), r.chmod(e, 438, (i) => { i ? n(i.code === 'ENOENT' ? null : t) : r.stat(e, (o, s) => { o ? n(o.code === 'ENOENT' ? null : t) : s.isDirectory() ? Tr(e, r, t, n) : r.unlink(e, n) }) }) } function Pi(e, r, t) {
    let n; C(e), C(r); try { r.chmodSync(e, 438) }
    catch (i) {
      if (i.code === 'ENOENT')
        return; throw t
    } try { n = r.statSync(e) }
    catch (i) {
      if (i.code === 'ENOENT')
        return; throw t
    }n.isDirectory() ? Ar(e, r, t) : r.unlinkSync(e)
  } function Tr(e, r, t, n) { C(e), C(r), C(typeof n == 'function'), r.rmdir(e, (i) => { i && (i.code === 'ENOTEMPTY' || i.code === 'EEXIST' || i.code === 'EPERM') ? Rl(e, r, n) : i && i.code === 'ENOTDIR' ? n(t) : n(i) }) } function Rl(e, r, t) {
    C(e), C(r), C(typeof t == 'function'), r.readdir(e, (n, i) => {
      if (n)
        return t(n); let o = i.length; let s; if (o === 0)
        return r.rmdir(e, t); i.forEach((u) => {
        _t(Di.join(e, u), r, (a) => {
          if (!s) {
            if (a)
              return t(s = a); --o === 0 && r.rmdir(e, t)
          }
        })
      })
    })
  } function Ni(e, r) {
    let t; r = r || {}, Bi(r), C(e, 'rimraf: missing path'), C.strictEqual(typeof e, 'string', 'rimraf: path should be a string'), C(r, 'rimraf: missing options'), C.strictEqual(typeof r, 'object', 'rimraf: options should be object'); try { t = r.lstatSync(e) }
    catch (n) {
      if (n.code === 'ENOENT')
        return; n.code === 'EPERM' && Je && Pi(e, r, n)
    } try { t && t.isDirectory() ? Ar(e, r, null) : r.unlinkSync(e) }
    catch (n) {
      if (n.code === 'ENOENT')
        return; if (n.code === 'EPERM')
        return Je ? Pi(e, r, n) : Ar(e, r, n); if (n.code !== 'EISDIR')
        throw n; Ar(e, r, n)
    }
  } function Ar(e, r, t) {
    C(e), C(r); try { r.rmdirSync(e) }
    catch (n) {
      if (n.code === 'ENOTDIR')
        throw t; if (n.code === 'ENOTEMPTY' || n.code === 'EEXIST' || n.code === 'EPERM')
        ql(e, r); else if (n.code !== 'ENOENT')
        throw n
    }
  } function ql(e, r) {
    if (C(e), C(r), r.readdirSync(e).forEach(t => Ni(Di.join(e, t), r)), Je) {
      const t = Date.now(); do {
        try { return r.rmdirSync(e, r) }
        catch {}
      } while (Date.now() - t < 500)
    }
    else { return r.rmdirSync(e, r) }
  }Ui.exports = _t; _t.sync = Ni
}); const Ze = m((Iy, qi) => { 'use strict'; const $l = Y().fromCallback; const Ri = Mi(); qi.exports = { remove: $l(Ri), removeSync: Ri.sync } }); const zi = m((ky, Vi) => {
  'use strict'; const jl = Y().fromCallback; const Gi = R(); const Hi = require('node:path'); const Wi = J(); const Yi = Ze(); const $i = jl((r, t) => {
    t = t || function () {}, Gi.readdir(r, (n, i) => {
      if (n)
        return Wi.mkdirs(r, t); i = i.map(s => Hi.join(r, s)), o(); function o() {
        const s = i.pop(); if (!s)
          return t(); Yi.remove(s, (u) => {
          if (u)
            return t(u); o()
        })
      }
    })
  }); function ji(e) {
    let r; try { r = Gi.readdirSync(e) }
    catch { return Wi.mkdirsSync(e) }r.forEach((t) => { t = Hi.join(e, t), Yi.removeSync(t) })
  }Vi.exports = { emptyDirSync: ji, emptydirSync: ji, emptyDir: $i, emptydir: $i }
}); const Xi = m((Ly, Zi) => {
  'use strict'; const Gl = Y().fromCallback; const Ki = require('node:path'); const oe = R(); const Ji = J(); function Hl(e, r) {
    function t() {
      oe.writeFile(e, '', (n) => {
        if (n)
          return r(n); r()
      })
    }oe.stat(e, (n, i) => {
      if (!n && i.isFile())
        return r(); const o = Ki.dirname(e); oe.stat(o, (s, u) => {
        if (s) {
          return s.code === 'ENOENT'
            ? Ji.mkdirs(o, (a) => {
              if (a)
                return r(a); t()
            })
            : r(s)
        } u.isDirectory()
          ? t()
          : oe.readdir(o, (a) => {
            if (a)
              return r(a)
          })
      })
    })
  } function Wl(e) {
    let r; try { r = oe.statSync(e) }
    catch {} if (r && r.isFile())
      return; const t = Ki.dirname(e); try { oe.statSync(t).isDirectory() || oe.readdirSync(t) }
    catch (n) {
      if (n && n.code === 'ENOENT')
        Ji.mkdirsSync(t); else throw n
    }oe.writeFileSync(e, '')
  }Zi.exports = { createFile: Gl(Hl), createFileSync: Wl }
}); const no = m((Oy, to) => {
  'use strict'; const Yl = Y().fromCallback; const eo = require('node:path'); const le = R(); const ro = J(); const Qi = ie().pathExists; function Vl(e, r, t) {
    function n(i, o) {
      le.link(i, o, (s) => {
        if (s)
          return t(s); t(null)
      })
    }Qi(r, (i, o) => {
      if (i)
        return t(i); if (o)
        return t(null); le.lstat(e, (s) => {
        if (s)
          return s.message = s.message.replace('lstat', 'ensureLink'), t(s); const u = eo.dirname(r); Qi(u, (a, l) => {
          if (a)
            return t(a); if (l)
            return n(e, r); ro.mkdirs(u, (c) => {
            if (c)
              return t(c); n(e, r)
          })
        })
      })
    })
  } function zl(e, r) {
    if (le.existsSync(r))
      return; try { le.lstatSync(e) }
    catch (o) { throw o.message = o.message.replace('lstat', 'ensureLink'), o } const n = eo.dirname(r); return le.existsSync(n) || ro.mkdirsSync(n), le.linkSync(e, r)
  }to.exports = { createLink: Yl(Vl), createLinkSync: zl }
}); const oo = m((_y, io) => {
  'use strict'; const se = require('node:path'); const Xe = R(); const Kl = ie().pathExists; function Jl(e, r, t) {
    if (se.isAbsolute(e))
      return Xe.lstat(e, n => n ? (n.message = n.message.replace('lstat', 'ensureSymlink'), t(n)) : t(null, { toCwd: e, toDst: e })); { const n = se.dirname(r); const i = se.join(n, e); return Kl(i, (o, s) => o ? t(o) : s ? t(null, { toCwd: i, toDst: e }) : Xe.lstat(e, u => u ? (u.message = u.message.replace('lstat', 'ensureSymlink'), t(u)) : t(null, { toCwd: e, toDst: se.relative(n, e) }))) }
  } function Zl(e, r) {
    let t; if (se.isAbsolute(e)) {
      if (t = Xe.existsSync(e), !t)
        throw new Error('absolute srcpath does not exist'); return { toCwd: e, toDst: e }
    }
    else {
      const n = se.dirname(r); const i = se.join(n, e); if (t = Xe.existsSync(i), t)
        return { toCwd: i, toDst: e }; if (t = Xe.existsSync(e), !t)
        throw new Error('relative srcpath does not exist'); return { toCwd: e, toDst: se.relative(n, e) }
    }
  }io.exports = { symlinkPaths: Jl, symlinkPathsSync: Zl }
}); const ao = m((Py, uo) => {
  'use strict'; const so = R(); function Xl(e, r, t) {
    if (t = typeof r == 'function' ? r : t, r = typeof r == 'function' ? !1 : r, r)
      return t(null, r); so.lstat(e, (n, i) => {
      if (n)
        return t(null, 'file'); r = i && i.isDirectory() ? 'dir' : 'file', t(null, r)
    })
  } function Ql(e, r) {
    let t; if (r)
      return r; try { t = so.lstatSync(e) }
    catch { return 'file' } return t && t.isDirectory() ? 'dir' : 'file'
  }uo.exports = { symlinkType: Xl, symlinkTypeSync: Ql }
}); const yo = m((Dy, ho) => {
  'use strict'; const ef = Y().fromCallback; const lo = require('node:path'); const be = R(); const fo = J(); const rf = fo.mkdirs; const tf = fo.mkdirsSync; const po = oo(); const nf = po.symlinkPaths; const of = po.symlinkPathsSync; const mo = ao(); const sf = mo.symlinkType; const uf = mo.symlinkTypeSync; const co = ie().pathExists; function af(e, r, t, n) {
    n = typeof t == 'function' ? t : n, t = typeof t == 'function' ? !1 : t, co(r, (i, o) => {
      if (i)
        return n(i); if (o)
        return n(null); nf(e, r, (s, u) => {
        if (s)
          return n(s); e = u.toDst, sf(u.toCwd, t, (a, l) => {
          if (a)
            return n(a); const c = lo.dirname(r); co(c, (f, p) => {
            if (f)
              return n(f); if (p)
              return be.symlink(e, r, l, n); rf(c, (d) => {
              if (d)
                return n(d); be.symlink(e, r, l, n)
            })
          })
        })
      })
    })
  } function cf(e, r, t) {
    if (be.existsSync(r))
      return; const i = of(e, r); e = i.toDst, t = uf(i.toCwd, t); const o = lo.dirname(r); return be.existsSync(o) || tf(o), be.symlinkSync(e, r, t)
  }ho.exports = { createSymlink: ef(af), createSymlinkSync: cf }
}); const wo = m((By, go) => { 'use strict'; const Fr = Xi(); const Ir = no(); const kr = yo(); go.exports = { createFile: Fr.createFile, createFileSync: Fr.createFileSync, ensureFile: Fr.createFile, ensureFileSync: Fr.createFileSync, createLink: Ir.createLink, createLinkSync: Ir.createLinkSync, ensureLink: Ir.createLink, ensureLinkSync: Ir.createLinkSync, createSymlink: kr.createSymlink, createSymlinkSync: kr.createSymlinkSync, ensureSymlink: kr.createSymlink, ensureSymlinkSync: kr.createSymlinkSync } }); const Lr = m((Ny, vo) => {
  function lf(e, { EOL: r = `
`, finalEOL: t = !0, replacer: n = null, spaces: i } = {}) { const o = t ? r : ''; return JSON.stringify(e, n, i).replace(/\n/g, r) + o } function ff(e) { return Buffer.isBuffer(e) && (e = e.toString('utf8')), e.replace(/^\uFEFF/, '') }vo.exports = { stringify: lf, stripBom: ff }
}); const bo = m((Uy, Eo) => {
  let Ce; try { Ce = R() }
  catch { Ce = require('node:fs') } const Or = Y(); const { stringify: xo, stripBom: So } = Lr(); async function df(e, r = {}) {
    typeof r == 'string' && (r = { encoding: r }); const t = r.fs || Ce; const n = 'throws' in r ? r.throws : !0; let i = await Or.fromCallback(t.readFile)(e, r); i = So(i); let o; try { o = JSON.parse(i, r ? r.reviver : null) }
    catch (s) {
      if (n)
        throw s.message = `${e}: ${s.message}`, s; return null
    } return o
  } const pf = Or.fromPromise(df); function mf(e, r = {}) {
    typeof r == 'string' && (r = { encoding: r }); const t = r.fs || Ce; const n = 'throws' in r ? r.throws : !0; try { let i = t.readFileSync(e, r); return i = So(i), JSON.parse(i, r.reviver) }
    catch (i) {
      if (n)
        throw i.message = `${e}: ${i.message}`, i; return null
    }
  } async function hf(e, r, t = {}) { const n = t.fs || Ce; const i = xo(r, t); await Or.fromCallback(n.writeFile)(e, i, t) } const yf = Or.fromPromise(hf); function gf(e, r, t = {}) { const n = t.fs || Ce; const i = xo(r, t); return n.writeFileSync(e, i, t) } const wf = { readFile: pf, readFileSync: mf, writeFile: yf, writeFileSync: gf }; Eo.exports = wf
}); const To = m((My, Co) => { 'use strict'; const _r = bo(); Co.exports = { readJson: _r.readFile, readJsonSync: _r.readFileSync, writeJson: _r.writeFile, writeJsonSync: _r.writeFileSync } }); const Pr = m((Ry, Io) => {
  'use strict'; const vf = Y().fromCallback; const Qe = R(); const Ao = require('node:path'); const Fo = J(); const xf = ie().pathExists; function Sf(e, r, t, n) {
    typeof t == 'function' && (n = t, t = 'utf8'); const i = Ao.dirname(e); xf(i, (o, s) => {
      if (o)
        return n(o); if (s)
        return Qe.writeFile(e, r, t, n); Fo.mkdirs(i, (u) => {
        if (u)
          return n(u); Qe.writeFile(e, r, t, n)
      })
    })
  } function Ef(e, ...r) {
    const t = Ao.dirname(e); if (Qe.existsSync(t))
      return Qe.writeFileSync(e, ...r); Fo.mkdirsSync(t), Qe.writeFileSync(e, ...r)
  }Io.exports = { outputFile: vf(Sf), outputFileSync: Ef }
}); const Lo = m((qy, ko) => { 'use strict'; const { stringify: bf } = Lr(); const { outputFile: Cf } = Pr(); async function Tf(e, r, t = {}) { const n = bf(r, t); await Cf(e, n, t) }ko.exports = Tf }); const _o = m(($y, Oo) => { 'use strict'; const { stringify: Af } = Lr(); const { outputFileSync: Ff } = Pr(); function If(e, r, t) { const n = Af(r, t); Ff(e, n, t) }Oo.exports = If }); const Do = m((jy, Po) => { 'use strict'; const kf = Y().fromPromise; const H = To(); H.outputJson = kf(Lo()); H.outputJsonSync = _o(); H.outputJSON = H.outputJson; H.outputJSONSync = H.outputJsonSync; H.writeJSON = H.writeJson; H.writeJSONSync = H.writeJsonSync; H.readJSON = H.readJson; H.readJSONSync = H.readJsonSync; Po.exports = H }); const qo = m((Gy, Ro) => {
  'use strict'; const Uo = R(); const Lf = require('node:path'); const Of = kt().copySync; const Mo = Ze().removeSync; const _f = J().mkdirpSync; const Bo = We(); function Pf(e, r, t) { t = t || {}; const n = t.overwrite || t.clobber || !1; const { srcStat: i } = Bo.checkPathsSync(e, r, 'move'); return Bo.checkParentPathsSync(e, i, r, 'move'), _f(Lf.dirname(r)), Df(e, r, n) } function Df(e, r, t) {
    if (t)
      return Mo(r), No(e, r, t); if (Uo.existsSync(r))
      throw new Error('dest already exists.'); return No(e, r, t)
  } function No(e, r, t) {
    try { Uo.renameSync(e, r) }
    catch (n) {
      if (n.code !== 'EXDEV')
        throw n; return Bf(e, r, t)
    }
  } function Bf(e, r, t) { return Of(e, r, { overwrite: t, errorOnExist: !0 }), Mo(e) }Ro.exports = Pf
}); const jo = m((Hy, $o) => { 'use strict'; $o.exports = { moveSync: qo() } }); const Vo = m((Wy, Yo) => {
  'use strict'; const Nf = R(); const Uf = require('node:path'); const Mf = Ot().copy; const Wo = Ze().remove; const Rf = J().mkdirp; const qf = ie().pathExists; const Go = We(); function $f(e, r, t, n) {
    typeof t == 'function' && (n = t, t = {}); const i = t.overwrite || t.clobber || !1; Go.checkPaths(e, r, 'move', (o, s) => {
      if (o)
        return n(o); const { srcStat: u } = s; Go.checkParentPaths(e, u, r, 'move', (a) => {
        if (a)
          return n(a); Rf(Uf.dirname(r), l => l ? n(l) : jf(e, r, i, n))
      })
    })
  } function jf(e, r, t, n) {
    if (t)
      return Wo(r, i => i ? n(i) : Ho(e, r, t, n)); qf(r, (i, o) => i ? n(i) : o ? n(new Error('dest already exists.')) : Ho(e, r, t, n))
  } function Ho(e, r, t, n) { Nf.rename(e, r, i => i ? i.code !== 'EXDEV' ? n(i) : Gf(e, r, t, n) : n()) } function Gf(e, r, t, n) { Mf(e, r, { overwrite: t, errorOnExist: !0 }, o => o ? n(o) : Wo(e, n)) }Yo.exports = $f
}); const Ko = m((Yy, zo) => { 'use strict'; const Hf = Y().fromCallback; zo.exports = { move: Hf(Vo()) } }); const Zo = m((Vy, Pt) => { 'use strict'; Pt.exports = { ...He(), ...kt(), ...Ot(), ...zi(), ...wo(), ...Do(), ...J(), ...jo(), ...Ko(), ...Pr(), ...ie(), ...Ze() }; const Jo = require('node:fs'); Object.getOwnPropertyDescriptor(Jo, 'promises') && Object.defineProperty(Pt.exports, 'promises', { get() { return Jo.promises } }) }); const Te = m((zy, fe) => {
  'use strict'; function Xo(e) { return typeof e > 'u' || e === null } function Wf(e) { return typeof e == 'object' && e !== null } function Yf(e) { return Array.isArray(e) ? e : Xo(e) ? [] : [e] } function Vf(e, r) {
    let t, n, i, o; if (r)
      for (o = Object.keys(r), t = 0, n = o.length; t < n; t += 1)i = o[t], e[i] = r[i]; return e
  } function zf(e, r) { let t = ''; let n; for (n = 0; n < r; n += 1)t += e; return t } function Kf(e) { return e === 0 && Number.NEGATIVE_INFINITY === 1 / e }fe.exports.isNothing = Xo; fe.exports.isObject = Wf; fe.exports.toArray = Yf; fe.exports.repeat = zf; fe.exports.isNegativeZero = Kf; fe.exports.extend = Vf
}); const Ae = m((Ky, es) => {
  'use strict'; function Qo(e, r) {
    let t = ''; const n = e.reason || '(unknown reason)'; return e.mark
      ? (e.mark.name && (t += `in "${e.mark.name}" `), t += `(${e.mark.line + 1}:${e.mark.column + 1})`, !r && e.mark.snippet && (t += `

${e.mark.snippet}`), `${n} ${t}`)
      : n
  } function er(e, r) { Error.call(this), this.name = 'YAMLException', this.reason = e, this.mark = r, this.message = Qo(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || '' }er.prototype = Object.create(Error.prototype); er.prototype.constructor = er; er.prototype.toString = function (r) { return `${this.name}: ${Qo(this, r)}` }; es.exports = er
}); const ts = m((Jy, rs) => {
  'use strict'; const rr = Te(); function Dt(e, r, t, n, i) { let o = ''; let s = ''; const u = Math.floor(i / 2) - 1; return n - r > u && (o = ' ... ', r = n - u + o.length), t - n > u && (s = ' ...', t = n + u - s.length), { str: o + e.slice(r, t).replace(/\t/g, '\u2192') + s, pos: n - r + o.length } } function Bt(e, r) { return rr.repeat(' ', r - e.length) + e } function Jf(e, r) {
    if (r = Object.create(r || null), !e.buffer)
      return null; r.maxLength || (r.maxLength = 79), typeof r.indent != 'number' && (r.indent = 1), typeof r.linesBefore != 'number' && (r.linesBefore = 3), typeof r.linesAfter != 'number' && (r.linesAfter = 2); for (var t = /\r?\n|\r|\0/g, n = [0], i = [], o, s = -1; o = t.exec(e.buffer);)i.push(o.index), n.push(o.index + o[0].length), e.position <= o.index && s < 0 && (s = n.length - 2); s < 0 && (s = n.length - 1); let u = ''; let a; let l; const c = Math.min(e.line + r.linesAfter, i.length).toString().length; const f = r.maxLength - (r.indent + c + 3); for (a = 1; a <= r.linesBefore && !(s - a < 0); a++) {
      l = Dt(e.buffer, n[s - a], i[s - a], e.position - (n[s] - n[s - a]), f), u = `${rr.repeat(' ', r.indent) + Bt((e.line - a + 1).toString(), c)} | ${l.str}
  ${u}`
    } for (l = Dt(e.buffer, n[s], i[s], e.position, f), u += `${rr.repeat(' ', r.indent) + Bt((e.line + 1).toString(), c)} | ${l.str}
`, u += `${rr.repeat('-', r.indent + c + 3 + l.pos)}^
`, a = 1; a <= r.linesAfter && !(s + a >= i.length); a++) {
      l = Dt(e.buffer, n[s + a], i[s + a], e.position - (n[s] - n[s + a]), f), u += `${rr.repeat(' ', r.indent) + Bt((e.line + a + 1).toString(), c)} | ${l.str}
`
    } return u.replace(/\n$/, '')
  }rs.exports = Jf
}); const $ = m((Zy, is) => {
  'use strict'; const ns = Ae(); const Zf = ['kind', 'multi', 'resolve', 'construct', 'instanceOf', 'predicate', 'represent', 'representName', 'defaultStyle', 'styleAliases']; const Xf = ['scalar', 'sequence', 'mapping']; function Qf(e) { const r = {}; return e !== null && Object.keys(e).forEach((t) => { e[t].forEach((n) => { r[String(n)] = t }) }), r } function ed(e, r) {
    if (r = r || {}, Object.keys(r).forEach((t) => {
      if (!Zf.includes(t))
        throw new ns(`Unknown option "${t}" is met in definition of "${e}" YAML type.`)
    }), this.options = r, this.tag = e, this.kind = r.kind || null, this.resolve = r.resolve || function () { return !0 }, this.construct = r.construct || function (t) { return t }, this.instanceOf = r.instanceOf || null, this.predicate = r.predicate || null, this.represent = r.represent || null, this.representName = r.representName || null, this.defaultStyle = r.defaultStyle || null, this.multi = r.multi || !1, this.styleAliases = Qf(r.styleAliases || null), !Xf.includes(this.kind))
      throw new ns(`Unknown kind "${this.kind}" is specified for "${e}" YAML type.`)
  }is.exports = ed
}); const Mt = m((Xy, ss) => {
  'use strict'; const tr = Ae(); const Nt = $(); function os(e, r) { const t = []; return e[r].forEach((n) => { let i = t.length; t.forEach((o, s) => { o.tag === n.tag && o.kind === n.kind && o.multi === n.multi && (i = s) }), t[i] = n }), t } function rd() { const e = { scalar: {}, sequence: {}, mapping: {}, fallback: {}, multi: { scalar: [], sequence: [], mapping: [], fallback: [] } }; let r; let t; function n(i) { i.multi ? (e.multi[i.kind].push(i), e.multi.fallback.push(i)) : e[i.kind][i.tag] = e.fallback[i.tag] = i } for (r = 0, t = arguments.length; r < t; r += 1)arguments[r].forEach(n); return e } function Ut(e) { return this.extend(e) }Ut.prototype.extend = function (r) {
    let t = []; let n = []; if (r instanceof Nt)
      n.push(r); else if (Array.isArray(r))
      n = n.concat(r); else if (r && (Array.isArray(r.implicit) || Array.isArray(r.explicit)))
      r.implicit && (t = t.concat(r.implicit)), r.explicit && (n = n.concat(r.explicit)); else throw new tr('Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })'); t.forEach((o) => {
      if (!(o instanceof Nt))
        throw new tr('Specified list of YAML types (or a single Type object) contains a non-Type object.'); if (o.loadKind && o.loadKind !== 'scalar')
        throw new tr('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.'); if (o.multi)
        throw new tr('There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.')
    }), n.forEach((o) => {
      if (!(o instanceof Nt))
        throw new tr('Specified list of YAML types (or a single Type object) contains a non-Type object.')
    }); const i = Object.create(Ut.prototype); return i.implicit = (this.implicit || []).concat(t), i.explicit = (this.explicit || []).concat(n), i.compiledImplicit = os(i, 'implicit'), i.compiledExplicit = os(i, 'explicit'), i.compiledTypeMap = rd(i.compiledImplicit, i.compiledExplicit), i
  }; ss.exports = Ut
}); const Rt = m((Qy, us) => { 'use strict'; const td = $(); us.exports = new td('tag:yaml.org,2002:str', { kind: 'scalar', construct(e) { return e !== null ? e : '' } }) }); const qt = m((eg, as) => { 'use strict'; const nd = $(); as.exports = new nd('tag:yaml.org,2002:seq', { kind: 'sequence', construct(e) { return e !== null ? e : [] } }) }); const $t = m((rg, cs) => { 'use strict'; const id = $(); cs.exports = new id('tag:yaml.org,2002:map', { kind: 'mapping', construct(e) { return e !== null ? e : {} } }) }); const jt = m((tg, ls) => { 'use strict'; const od = Mt(); ls.exports = new od({ explicit: [Rt(), qt(), $t()] }) }); const Gt = m((ng, fs) => {
  'use strict'; const sd = $(); function ud(e) {
    if (e === null)
      return !0; const r = e.length; return r === 1 && e === '~' || r === 4 && (e === 'null' || e === 'Null' || e === 'NULL')
  } function ad() { return null } function cd(e) { return e === null }fs.exports = new sd('tag:yaml.org,2002:null', { kind: 'scalar', resolve: ud, construct: ad, predicate: cd, represent: { canonical() { return '~' }, lowercase() { return 'null' }, uppercase() { return 'NULL' }, camelcase() { return 'Null' }, empty() { return '' } }, defaultStyle: 'lowercase' })
}); const Ht = m((ig, ds) => {
  'use strict'; const ld = $(); function fd(e) {
    if (e === null)
      return !1; const r = e.length; return r === 4 && (e === 'true' || e === 'True' || e === 'TRUE') || r === 5 && (e === 'false' || e === 'False' || e === 'FALSE')
  } function dd(e) { return e === 'true' || e === 'True' || e === 'TRUE' } function pd(e) { return Object.prototype.toString.call(e) === '[object Boolean]' }ds.exports = new ld('tag:yaml.org,2002:bool', { kind: 'scalar', resolve: fd, construct: dd, predicate: pd, represent: { lowercase(e) { return e ? 'true' : 'false' }, uppercase(e) { return e ? 'TRUE' : 'FALSE' }, camelcase(e) { return e ? 'True' : 'False' } }, defaultStyle: 'lowercase' })
}); const Wt = m((og, ps) => {
  'use strict'; const md = Te(); const hd = $(); function yd(e) { return e >= 48 && e <= 57 || e >= 65 && e <= 70 || e >= 97 && e <= 102 } function gd(e) { return e >= 48 && e <= 55 } function wd(e) { return e >= 48 && e <= 57 } function vd(e) {
    if (e === null)
      return !1; const r = e.length; let t = 0; let n = !1; let i; if (!r)
      return !1; if (i = e[t], (i === '-' || i === '+') && (i = e[++t]), i === '0') {
      if (t + 1 === r)
        return !0; if (i = e[++t], i === 'b') {
        for (t++; t < r; t++) {
          if (i = e[t], i !== '_') {
            if (i !== '0' && i !== '1')
              return !1; n = !0
          }
        } return n && i !== '_'
      } if (i === 'x') {
        for (t++; t < r; t++) {
          if (i = e[t], i !== '_') {
            if (!yd(e.charCodeAt(t)))
              return !1; n = !0
          }
        } return n && i !== '_'
      } if (i === 'o') {
        for (t++; t < r; t++) {
          if (i = e[t], i !== '_') {
            if (!gd(e.charCodeAt(t)))
              return !1; n = !0
          }
        } return n && i !== '_'
      }
    } if (i === '_')
      return !1; for (;t < r; t++) {
      if (i = e[t], i !== '_') {
        if (!wd(e.charCodeAt(t)))
          return !1; n = !0
      }
    } return !(!n || i === '_')
  } function xd(e) {
    let r = e; let t = 1; let n; if (r.includes('_') && (r = r.replace(/_/g, '')), n = r[0], (n === '-' || n === '+') && (n === '-' && (t = -1), r = r.slice(1), n = r[0]), r === '0')
      return 0; if (n === '0') {
      if (r[1] === 'b')
        return t * Number.parseInt(r.slice(2), 2); if (r[1] === 'x')
        return t * Number.parseInt(r.slice(2), 16); if (r[1] === 'o')
        return t * Number.parseInt(r.slice(2), 8)
    } return t * Number.parseInt(r, 10)
  } function Sd(e) { return Object.prototype.toString.call(e) === '[object Number]' && e % 1 === 0 && !md.isNegativeZero(e) }ps.exports = new hd('tag:yaml.org,2002:int', { kind: 'scalar', resolve: vd, construct: xd, predicate: Sd, represent: { binary(e) { return e >= 0 ? `0b${e.toString(2)}` : `-0b${e.toString(2).slice(1)}` }, octal(e) { return e >= 0 ? `0o${e.toString(8)}` : `-0o${e.toString(8).slice(1)}` }, decimal(e) { return e.toString(10) }, hexadecimal(e) { return e >= 0 ? `0x${e.toString(16).toUpperCase()}` : `-0x${e.toString(16).toUpperCase().slice(1)}` } }, defaultStyle: 'decimal', styleAliases: { binary: [2, 'bin'], octal: [8, 'oct'], decimal: [10, 'dec'], hexadecimal: [16, 'hex'] } })
}); const Yt = m((sg, hs) => {
  'use strict'; const ms = Te(); const Ed = $(); const bd = new RegExp('^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$'); function Cd(e) { return !(e === null || !bd.test(e) || e[e.length - 1] === '_') } function Td(e) { let r, t; return r = e.replace(/_/g, '').toLowerCase(), t = r[0] === '-' ? -1 : 1, '+-'.includes(r[0]) && (r = r.slice(1)), r === '.inf' ? t === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : r === '.nan' ? Number.NaN : t * Number.parseFloat(r, 10) } const Ad = /^[-+]?[0-9]+e/; function Fd(e, r) {
    let t; if (isNaN(e))
      switch (r) { case 'lowercase':return '.nan'; case 'uppercase':return '.NAN'; case 'camelcase':return '.NaN' } else if (Number.POSITIVE_INFINITY === e)
      switch (r) { case 'lowercase':return '.inf'; case 'uppercase':return '.INF'; case 'camelcase':return '.Inf' } else if (Number.NEGATIVE_INFINITY === e)
      switch (r) { case 'lowercase':return '-.inf'; case 'uppercase':return '-.INF'; case 'camelcase':return '-.Inf' } else if (ms.isNegativeZero(e))
      return '-0.0'; return t = e.toString(10), Ad.test(t) ? t.replace('e', '.e') : t
  } function Id(e) { return Object.prototype.toString.call(e) === '[object Number]' && (e % 1 !== 0 || ms.isNegativeZero(e)) }hs.exports = new Ed('tag:yaml.org,2002:float', { kind: 'scalar', resolve: Cd, construct: Td, predicate: Id, represent: Fd, defaultStyle: 'lowercase' })
}); const Vt = m((ug, ys) => { 'use strict'; ys.exports = jt().extend({ implicit: [Gt(), Ht(), Wt(), Yt()] }) }); const zt = m((ag, gs) => { 'use strict'; gs.exports = Vt() }); const Kt = m((cg, xs) => {
  'use strict'; const kd = $(); const ws = new RegExp('^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$'); const vs = new RegExp('^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$'); function Ld(e) { return e === null ? !1 : ws.exec(e) !== null || vs.exec(e) !== null } function Od(e) {
    let r; let t; let n; let i; let o; let s; let u; let a = 0; let l = null; let c; let f; let p; if (r = ws.exec(e), r === null && (r = vs.exec(e)), r === null)
      throw new Error('Date resolve error'); if (t = +r[1], n = +r[2] - 1, i = +r[3], !r[4])
      return new Date(Date.UTC(t, n, i)); if (o = +r[4], s = +r[5], u = +r[6], r[7]) { for (a = r[7].slice(0, 3); a.length < 3;)a += '0'; a = +a } return r[9] && (c = +r[10], f = +(r[11] || 0), l = (c * 60 + f) * 6e4, r[9] === '-' && (l = -l)), p = new Date(Date.UTC(t, n, i, o, s, u, a)), l && p.setTime(p.getTime() - l), p
  } function _d(e) { return e.toISOString() }xs.exports = new kd('tag:yaml.org,2002:timestamp', { kind: 'scalar', resolve: Ld, construct: Od, instanceOf: Date, represent: _d })
}); const Jt = m((lg, Ss) => { 'use strict'; const Pd = $(); function Dd(e) { return e === '<<' || e === null }Ss.exports = new Pd('tag:yaml.org,2002:merge', { kind: 'scalar', resolve: Dd }) }); const Xt = m((fg, Es) => {
  'use strict'; const Bd = $(); const Zt = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function Nd(e) {
    if (e === null)
      return !1; let r; let t; let n = 0; const i = e.length; const o = Zt; for (t = 0; t < i; t++) {
      if (r = o.indexOf(e.charAt(t)), !(r > 64)) {
        if (r < 0)
          return !1; n += 6
      }
    } return n % 8 === 0
  } function Ud(e) { let r; let t; const n = e.replace(/[\r\n=]/g, ''); const i = n.length; const o = Zt; let s = 0; const u = []; for (r = 0; r < i; r++)r % 4 === 0 && r && (u.push(s >> 16 & 255), u.push(s >> 8 & 255), u.push(s & 255)), s = s << 6 | o.indexOf(n.charAt(r)); return t = i % 4 * 6, t === 0 ? (u.push(s >> 16 & 255), u.push(s >> 8 & 255), u.push(s & 255)) : t === 18 ? (u.push(s >> 10 & 255), u.push(s >> 2 & 255)) : t === 12 && u.push(s >> 4 & 255), new Uint8Array(u) } function Md(e) { let r = ''; let t = 0; let n; let i; const o = e.length; const s = Zt; for (n = 0; n < o; n++)n % 3 === 0 && n && (r += s[t >> 18 & 63], r += s[t >> 12 & 63], r += s[t >> 6 & 63], r += s[t & 63]), t = (t << 8) + e[n]; return i = o % 3, i === 0 ? (r += s[t >> 18 & 63], r += s[t >> 12 & 63], r += s[t >> 6 & 63], r += s[t & 63]) : i === 2 ? (r += s[t >> 10 & 63], r += s[t >> 4 & 63], r += s[t << 2 & 63], r += s[64]) : i === 1 && (r += s[t >> 2 & 63], r += s[t << 4 & 63], r += s[64], r += s[64]), r } function Rd(e) { return Object.prototype.toString.call(e) === '[object Uint8Array]' }Es.exports = new Bd('tag:yaml.org,2002:binary', { kind: 'scalar', resolve: Nd, construct: Ud, predicate: Rd, represent: Md })
}); const Qt = m((dg, bs) => {
  'use strict'; const qd = $(); const $d = Object.prototype.hasOwnProperty; const jd = Object.prototype.toString; function Gd(e) {
    if (e === null)
      return !0; const r = []; let t; let n; let i; let o; let s; const u = e; for (t = 0, n = u.length; t < n; t += 1) {
      if (i = u[t], s = !1, jd.call(i) !== '[object Object]')
        return !1; for (o in i) {
        if ($d.call(i, o)) {
          if (!s)
            s = !0; else return !1
        }
      } if (!s)
        return !1; if (!r.includes(o))
        r.push(o); else return !1
    } return !0
  } function Hd(e) { return e !== null ? e : [] }bs.exports = new qd('tag:yaml.org,2002:omap', { kind: 'sequence', resolve: Gd, construct: Hd })
}); const en = m((pg, Cs) => {
  'use strict'; const Wd = $(); const Yd = Object.prototype.toString; function Vd(e) {
    if (e === null)
      return !0; let r; let t; let n; let i; let o; const s = e; for (o = Array.from({ length: s.length }), r = 0, t = s.length; r < t; r += 1) {
      if (n = s[r], Yd.call(n) !== '[object Object]' || (i = Object.keys(n), i.length !== 1))
        return !1; o[r] = [i[0], n[i[0]]]
    } return !0
  } function zd(e) {
    if (e === null)
      return []; let r; let t; let n; let i; let o; const s = e; for (o = Array.from({ length: s.length }), r = 0, t = s.length; r < t; r += 1)n = s[r], i = Object.keys(n), o[r] = [i[0], n[i[0]]]; return o
  }Cs.exports = new Wd('tag:yaml.org,2002:pairs', { kind: 'sequence', resolve: Vd, construct: zd })
}); const rn = m((mg, Ts) => {
  'use strict'; const Kd = $(); const Jd = Object.prototype.hasOwnProperty; function Zd(e) {
    if (e === null)
      return !0; let r; const t = e; for (r in t) {
      if (Jd.call(t, r) && t[r] !== null)
        return !1
    } return !0
  } function Xd(e) { return e !== null ? e : {} }Ts.exports = new Kd('tag:yaml.org,2002:set', { kind: 'mapping', resolve: Zd, construct: Xd })
}); const Dr = m((hg, As) => { 'use strict'; As.exports = zt().extend({ implicit: [Kt(), Jt()], explicit: [Xt(), Qt(), en(), rn()] }) }); const js = m((yg, sn) => {
  'use strict'; const pe = Te(); const Ps = Ae(); const Qd = ts(); const ep = Dr(); const ae = Object.prototype.hasOwnProperty; const Br = 1; const Ds = 2; const Bs = 3; const Nr = 4; const tn = 1; const rp = 2; const Fs = 3; const tp = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/; const np = /[\x85\u2028\u2029]/; const ip = /[,\[\]\{\}]/; const Ns = /^(?:!|!!|![a-z\-]+!)$/i; const Us = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i; function Is(e) { return Object.prototype.toString.call(e) } function Z(e) { return e === 10 || e === 13 } function me(e) { return e === 9 || e === 32 } function K(e) { return e === 9 || e === 32 || e === 10 || e === 13 } function Fe(e) { return e === 44 || e === 91 || e === 93 || e === 123 || e === 125 } function op(e) { let r; return e >= 48 && e <= 57 ? e - 48 : (r = e | 32, r >= 97 && r <= 102 ? r - 97 + 10 : -1) } function sp(e) { return e === 120 ? 2 : e === 117 ? 4 : e === 85 ? 8 : 0 } function up(e) { return e >= 48 && e <= 57 ? e - 48 : -1 } function ks(e) {
    return e === 48
      ? '\0'
      : e === 97
        ? '\x07'
        : e === 98
          ? '\b'
          : e === 116 || e === 9
            ? '	'
            : e === 110
              ? `
`
              : e === 118 ? '\v' : e === 102 ? '\f' : e === 114 ? '\r' : e === 101 ? '\x1B' : e === 32 ? ' ' : e === 34 ? '"' : e === 47 ? '/' : e === 92 ? '\\' : e === 78 ? '\x85' : e === 95 ? '\xA0' : e === 76 ? '\u2028' : e === 80 ? '\u2029' : ''
  } function ap(e) { return e <= 65535 ? String.fromCharCode(e) : String.fromCharCode((e - 65536 >> 10) + 55296, (e - 65536 & 1023) + 56320) } const Ms = Array.from({ length: 256 }); const Rs = Array.from({ length: 256 }); for (de = 0; de < 256; de++)Ms[de] = ks(de) ? 1 : 0, Rs[de] = ks(de); let de; function cp(e, r) { this.input = e, this.filename = r.filename || null, this.schema = r.schema || ep, this.onWarning = r.onWarning || null, this.legacy = r.legacy || !1, this.json = r.json || !1, this.listener = r.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = e.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [] } function qs(e, r) { const t = { name: e.filename, buffer: e.input.slice(0, -1), position: e.position, line: e.line, column: e.position - e.lineStart }; return t.snippet = Qd(t), new Ps(r, t) } function w(e, r) { throw qs(e, r) } function Ur(e, r) { e.onWarning && e.onWarning.call(null, qs(e, r)) } const Ls = { YAML(r, t, n) { let i, o, s; r.version !== null && w(r, 'duplication of %YAML directive'), n.length !== 1 && w(r, 'YAML directive accepts exactly one argument'), i = /^([0-9]+)\.([0-9]+)$/.exec(n[0]), i === null && w(r, 'ill-formed argument of the YAML directive'), o = Number.parseInt(i[1], 10), s = Number.parseInt(i[2], 10), o !== 1 && w(r, 'unacceptable YAML version of the document'), r.version = n[0], r.checkLineBreaks = s < 2, s !== 1 && s !== 2 && Ur(r, 'unsupported YAML version of the document') }, TAG(r, t, n) {
    let i, o; n.length !== 2 && w(r, 'TAG directive accepts exactly two arguments'), i = n[0], o = n[1], Ns.test(i) || w(r, 'ill-formed tag handle (first argument) of the TAG directive'), ae.call(r.tagMap, i) && w(r, `there is a previously declared suffix for "${i}" tag handle`), Us.test(o) || w(r, 'ill-formed tag prefix (second argument) of the TAG directive'); try { o = decodeURIComponent(o) }
    catch { w(r, `tag prefix is malformed: ${o}`) }r.tagMap[i] = o
  } }; function ue(e, r, t, n) {
    let i, o, s, u; if (r < t) {
      if (u = e.input.slice(r, t), n)
        for (i = 0, o = u.length; i < o; i += 1)s = u.charCodeAt(i), s === 9 || s >= 32 && s <= 1114111 || w(e, 'expected valid JSON character'); else tp.test(u) && w(e, 'the stream contains non-printable characters'); e.result += u
    }
  } function Os(e, r, t, n) { let i, o, s, u; for (pe.isObject(t) || w(e, 'cannot merge mappings; the provided source object is unacceptable'), i = Object.keys(t), s = 0, u = i.length; s < u; s += 1)o = i[s], ae.call(r, o) || (r[o] = t[o], n[o] = !0) } function Ie(e, r, t, n, i, o, s, u, a) {
    let l, c; if (Array.isArray(i))
      for (i = Array.prototype.slice.call(i), l = 0, c = i.length; l < c; l += 1)Array.isArray(i[l]) && w(e, 'nested arrays are not supported inside keys'), typeof i == 'object' && Is(i[l]) === '[object Object]' && (i[l] = '[object Object]'); if (typeof i == 'object' && Is(i) === '[object Object]' && (i = '[object Object]'), i = String(i), r === null && (r = {}), n === 'tag:yaml.org,2002:merge') {
      if (Array.isArray(o))
        for (l = 0, c = o.length; l < c; l += 1)Os(e, r, o[l], t); else Os(e, r, o, t)
    }
    else { !e.json && !ae.call(t, i) && ae.call(r, i) && (e.line = s || e.line, e.lineStart = u || e.lineStart, e.position = a || e.position, w(e, 'duplicated mapping key')), i === '__proto__' ? Object.defineProperty(r, i, { configurable: !0, enumerable: !0, writable: !0, value: o }) : r[i] = o, delete t[i] } return r
  } function nn(e) { let r; r = e.input.charCodeAt(e.position), r === 10 ? e.position++ : r === 13 ? (e.position++, e.input.charCodeAt(e.position) === 10 && e.position++) : w(e, 'a line break is expected'), e.line += 1, e.lineStart = e.position, e.firstTabInLine = -1 } function O(e, r, t) {
    for (var n = 0, i = e.input.charCodeAt(e.position); i !== 0;) {
      for (;me(i);)i === 9 && e.firstTabInLine === -1 && (e.firstTabInLine = e.position), i = e.input.charCodeAt(++e.position); if (r && i === 35)
        do i = e.input.charCodeAt(++e.position); while (i !== 10 && i !== 13 && i !== 0); if (Z(i))
        for (nn(e), i = e.input.charCodeAt(e.position), n++, e.lineIndent = 0; i === 32;)e.lineIndent++, i = e.input.charCodeAt(++e.position); else break
    } return t !== -1 && n !== 0 && e.lineIndent < t && Ur(e, 'deficient indentation'), n
  } function Mr(e) { let r = e.position; let t; return t = e.input.charCodeAt(r), !!((t === 45 || t === 46) && t === e.input.charCodeAt(r + 1) && t === e.input.charCodeAt(r + 2) && (r += 3, t = e.input.charCodeAt(r), t === 0 || K(t))) } function on(e, r) {
    r === 1
      ? e.result += ' '
      : r > 1 && (e.result += pe.repeat(`
`, r - 1))
  } function lp(e, r, t) {
    let n; let i; let o; let s; let u; let a; let l; let c; const f = e.kind; const p = e.result; let d; if (d = e.input.charCodeAt(e.position), K(d) || Fe(d) || d === 35 || d === 38 || d === 42 || d === 33 || d === 124 || d === 62 || d === 39 || d === 34 || d === 37 || d === 64 || d === 96 || (d === 63 || d === 45) && (i = e.input.charCodeAt(e.position + 1), K(i) || t && Fe(i)))
      return !1; for (e.kind = 'scalar', e.result = '', o = s = e.position, u = !1; d !== 0;) {
      if (d === 58) {
        if (i = e.input.charCodeAt(e.position + 1), K(i) || t && Fe(i))
          break
      }
      else if (d === 35) {
        if (n = e.input.charCodeAt(e.position - 1), K(n))
          break
      }
      else {
        if (e.position === e.lineStart && Mr(e) || t && Fe(d))
          break; if (Z(d)) {
          if (a = e.line, l = e.lineStart, c = e.lineIndent, O(e, !1, -1), e.lineIndent >= r) { u = !0, d = e.input.charCodeAt(e.position); continue }
          else { e.position = s, e.line = a, e.lineStart = l, e.lineIndent = c; break }
        }
      }u && (ue(e, o, s, !1), on(e, e.line - a), o = s = e.position, u = !1), me(d) || (s = e.position + 1), d = e.input.charCodeAt(++e.position)
    } return ue(e, o, s, !1), e.result ? !0 : (e.kind = f, e.result = p, !1)
  } function fp(e, r) {
    let t, n, i; if (t = e.input.charCodeAt(e.position), t !== 39)
      return !1; for (e.kind = 'scalar', e.result = '', e.position++, n = i = e.position; (t = e.input.charCodeAt(e.position)) !== 0;) {
      if (t === 39) {
        if (ue(e, n, e.position, !0), t = e.input.charCodeAt(++e.position), t === 39)
          n = e.position, e.position++, i = e.position; else return !0
      }
      else { Z(t) ? (ue(e, n, i, !0), on(e, O(e, !1, r)), n = i = e.position) : e.position === e.lineStart && Mr(e) ? w(e, 'unexpected end of the document within a single quoted scalar') : (e.position++, i = e.position) }
    } w(e, 'unexpected end of the stream within a single quoted scalar')
  } function dp(e, r) {
    let t, n, i, o, s, u; if (u = e.input.charCodeAt(e.position), u !== 34)
      return !1; for (e.kind = 'scalar', e.result = '', e.position++, t = n = e.position; (u = e.input.charCodeAt(e.position)) !== 0;) {
      if (u === 34)
        return ue(e, t, e.position, !0), e.position++, !0; if (u === 92) {
        if (ue(e, t, e.position, !0), u = e.input.charCodeAt(++e.position), Z(u)) { O(e, !1, r) }
        else if (u < 256 && Ms[u]) { e.result += Rs[u], e.position++ }
        else if ((s = sp(u)) > 0) { for (i = s, o = 0; i > 0; i--)u = e.input.charCodeAt(++e.position), (s = op(u)) >= 0 ? o = (o << 4) + s : w(e, 'expected hexadecimal character'); e.result += ap(o), e.position++ }
        else { w(e, 'unknown escape sequence') }t = n = e.position
      }
      else { Z(u) ? (ue(e, t, n, !0), on(e, O(e, !1, r)), t = n = e.position) : e.position === e.lineStart && Mr(e) ? w(e, 'unexpected end of the document within a double quoted scalar') : (e.position++, n = e.position) }
    }w(e, 'unexpected end of the stream within a double quoted scalar')
  } function pp(e, r) {
    let t = !0; let n; let i; let o; const s = e.tag; let u; const a = e.anchor; let l; let c; let f; let p; let d; const h = Object.create(null); let y; let g; let x; let v; if (v = e.input.charCodeAt(e.position), v === 91)
      c = 93, d = !1, u = []; else if (v === 123)
      c = 125, d = !0, u = {}; else return !1; for (e.anchor !== null && (e.anchorMap[e.anchor] = u), v = e.input.charCodeAt(++e.position); v !== 0;) {
      if (O(e, !0, r), v = e.input.charCodeAt(e.position), v === c)
        return e.position++, e.tag = s, e.anchor = a, e.kind = d ? 'mapping' : 'sequence', e.result = u, !0; t ? v === 44 && w(e, 'expected the node content, but found \',\'') : w(e, 'missed comma between flow collection entries'), g = y = x = null, f = p = !1, v === 63 && (l = e.input.charCodeAt(e.position + 1), K(l) && (f = p = !0, e.position++, O(e, !0, r))), n = e.line, i = e.lineStart, o = e.position, ke(e, r, Br, !1, !0), g = e.tag, y = e.result, O(e, !0, r), v = e.input.charCodeAt(e.position), (p || e.line === n) && v === 58 && (f = !0, v = e.input.charCodeAt(++e.position), O(e, !0, r), ke(e, r, Br, !1, !0), x = e.result), d ? Ie(e, u, h, g, y, x, n, i, o) : f ? u.push(Ie(e, null, h, g, y, x, n, i, o)) : u.push(y), O(e, !0, r), v = e.input.charCodeAt(e.position), v === 44 ? (t = !0, v = e.input.charCodeAt(++e.position)) : t = !1
    }w(e, 'unexpected end of the stream within a flow collection')
  } function mp(e, r) {
    let t; let n; let i = tn; let o = !1; let s = !1; let u = r; let a = 0; let l = !1; let c; let f; if (f = e.input.charCodeAt(e.position), f === 124)
      n = !1; else if (f === 62)
      n = !0; else return !1; for (e.kind = 'scalar', e.result = ''; f !== 0;) {
      if (f = e.input.charCodeAt(++e.position), f === 43 || f === 45)
        tn === i ? i = f === 43 ? Fs : rp : w(e, 'repeat of a chomping mode identifier'); else if ((c = up(f)) >= 0)
        c === 0 ? w(e, 'bad explicit indentation width of a block scalar; it cannot be less than one') : s ? w(e, 'repeat of an indentation width identifier') : (u = r + c - 1, s = !0); else break
    } if (me(f)) {
      do f = e.input.charCodeAt(++e.position); while (me(f)); if (f === 35)
        do f = e.input.charCodeAt(++e.position); while (!Z(f) && f !== 0)
    } for (;f !== 0;) {
      for (nn(e), e.lineIndent = 0, f = e.input.charCodeAt(e.position); (!s || e.lineIndent < u) && f === 32;)e.lineIndent++, f = e.input.charCodeAt(++e.position); if (!s && e.lineIndent > u && (u = e.lineIndent), Z(f)) { a++; continue } if (e.lineIndent < u) {
        i === Fs
          ? e.result += pe.repeat(`
`, o ? 1 + a : a)
          : i === tn && o && (e.result += `
`); break
      } for (n
        ? me(f)
          ? (l = !0, e.result += pe.repeat(`
`, o ? 1 + a : a))
          : l
            ? (l = !1, e.result += pe.repeat(`
`, a + 1))
            : a === 0
              ? o && (e.result += ' ')
              : e.result += pe.repeat(`
`, a)
        : e.result += pe.repeat(`
`, o ? 1 + a : a), o = !0, s = !0, a = 0, t = e.position; !Z(f) && f !== 0;)f = e.input.charCodeAt(++e.position); ue(e, t, e.position, !1)
    } return !0
  } function _s(e, r) {
    let t; const n = e.tag; const i = e.anchor; const o = []; let s; let u = !1; let a; if (e.firstTabInLine !== -1)
      return !1; for (e.anchor !== null && (e.anchorMap[e.anchor] = o), a = e.input.charCodeAt(e.position); a !== 0 && (e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, w(e, 'tab characters must not be used in indentation')), !(a !== 45 || (s = e.input.charCodeAt(e.position + 1), !K(s))));) {
      if (u = !0, e.position++, O(e, !0, -1) && e.lineIndent <= r) { o.push(null), a = e.input.charCodeAt(e.position); continue } if (t = e.line, ke(e, r, Bs, !1, !0), o.push(e.result), O(e, !0, -1), a = e.input.charCodeAt(e.position), (e.line === t || e.lineIndent > r) && a !== 0)
        w(e, 'bad indentation of a sequence entry'); else if (e.lineIndent < r)
        break
    } return u ? (e.tag = n, e.anchor = i, e.kind = 'sequence', e.result = o, !0) : !1
  } function hp(e, r, t) {
    let n; let i; let o; let s; let u; let a; const l = e.tag; const c = e.anchor; const f = {}; const p = Object.create(null); let d = null; let h = null; let y = null; let g = !1; let x = !1; let v; if (e.firstTabInLine !== -1)
      return !1; for (e.anchor !== null && (e.anchorMap[e.anchor] = f), v = e.input.charCodeAt(e.position); v !== 0;) {
      if (!g && e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, w(e, 'tab characters must not be used in indentation')), n = e.input.charCodeAt(e.position + 1), o = e.line, (v === 63 || v === 58) && K(n)) { v === 63 ? (g && (Ie(e, f, p, d, h, null, s, u, a), d = h = y = null), x = !0, g = !0, i = !0) : g ? (g = !1, i = !0) : w(e, 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line'), e.position += 1, v = n }
      else {
        if (s = e.line, u = e.lineStart, a = e.position, !ke(e, t, Ds, !1, !0))
          break; if (e.line === o) {
          for (v = e.input.charCodeAt(e.position); me(v);)v = e.input.charCodeAt(++e.position); if (v === 58)
            v = e.input.charCodeAt(++e.position), K(v) || w(e, 'a whitespace character is expected after the key-value separator within a block mapping'), g && (Ie(e, f, p, d, h, null, s, u, a), d = h = y = null), x = !0, g = !1, i = !1, d = e.tag, h = e.result; else if (x)
            w(e, 'can not read an implicit mapping pair; a colon is missed'); else return e.tag = l, e.anchor = c, !0
        }
        else if (x) { w(e, 'can not read a block mapping entry; a multiline key may not be an implicit key') }
        else { return e.tag = l, e.anchor = c, !0 }
      } if ((e.line === o || e.lineIndent > r) && (g && (s = e.line, u = e.lineStart, a = e.position), ke(e, r, Nr, !0, i) && (g ? h = e.result : y = e.result), g || (Ie(e, f, p, d, h, y, s, u, a), d = h = y = null), O(e, !0, -1), v = e.input.charCodeAt(e.position)), (e.line === o || e.lineIndent > r) && v !== 0)
        w(e, 'bad indentation of a mapping entry'); else if (e.lineIndent < r)
        break
    } return g && Ie(e, f, p, d, h, null, s, u, a), x && (e.tag = l, e.anchor = c, e.kind = 'mapping', e.result = f), x
  } function yp(e) {
    let r; let t = !1; let n = !1; let i; let o; let s; if (s = e.input.charCodeAt(e.position), s !== 33)
      return !1; if (e.tag !== null && w(e, 'duplication of a tag property'), s = e.input.charCodeAt(++e.position), s === 60 ? (t = !0, s = e.input.charCodeAt(++e.position)) : s === 33 ? (n = !0, i = '!!', s = e.input.charCodeAt(++e.position)) : i = '!', r = e.position, t) { do s = e.input.charCodeAt(++e.position); while (s !== 0 && s !== 62); e.position < e.length ? (o = e.input.slice(r, e.position), s = e.input.charCodeAt(++e.position)) : w(e, 'unexpected end of the stream within a verbatim tag') }
    else { for (;s !== 0 && !K(s);)s === 33 && (n ? w(e, 'tag suffix cannot contain exclamation marks') : (i = e.input.slice(r - 1, e.position + 1), Ns.test(i) || w(e, 'named tag handle cannot contain such characters'), n = !0, r = e.position + 1)), s = e.input.charCodeAt(++e.position); o = e.input.slice(r, e.position), ip.test(o) && w(e, 'tag suffix cannot contain flow indicator characters') }o && !Us.test(o) && w(e, `tag name cannot contain such characters: ${o}`); try { o = decodeURIComponent(o) }
    catch { w(e, `tag name is malformed: ${o}`) } return t ? e.tag = o : ae.call(e.tagMap, i) ? e.tag = e.tagMap[i] + o : i === '!' ? e.tag = `!${o}` : i === '!!' ? e.tag = `tag:yaml.org,2002:${o}` : w(e, `undeclared tag handle "${i}"`), !0
  } function gp(e) {
    let r, t; if (t = e.input.charCodeAt(e.position), t !== 38)
      return !1; for (e.anchor !== null && w(e, 'duplication of an anchor property'), t = e.input.charCodeAt(++e.position), r = e.position; t !== 0 && !K(t) && !Fe(t);)t = e.input.charCodeAt(++e.position); return e.position === r && w(e, 'name of an anchor node must contain at least one character'), e.anchor = e.input.slice(r, e.position), !0
  } function wp(e) {
    let r, t, n; if (n = e.input.charCodeAt(e.position), n !== 42)
      return !1; for (n = e.input.charCodeAt(++e.position), r = e.position; n !== 0 && !K(n) && !Fe(n);)n = e.input.charCodeAt(++e.position); return e.position === r && w(e, 'name of an alias node must contain at least one character'), t = e.input.slice(r, e.position), ae.call(e.anchorMap, t) || w(e, `unidentified alias "${t}"`), e.result = e.anchorMap[t], O(e, !0, -1), !0
  } function ke(e, r, t, n, i) {
    let o; let s; let u; let a = 1; let l = !1; let c = !1; let f; let p; let d; let h; let y; let g; if (e.listener !== null && e.listener('open', e), e.tag = null, e.anchor = null, e.kind = null, e.result = null, o = s = u = Nr === t || Bs === t, n && O(e, !0, -1) && (l = !0, e.lineIndent > r ? a = 1 : e.lineIndent === r ? a = 0 : e.lineIndent < r && (a = -1)), a === 1)
      for (;yp(e) || gp(e);)O(e, !0, -1) ? (l = !0, u = o, e.lineIndent > r ? a = 1 : e.lineIndent === r ? a = 0 : e.lineIndent < r && (a = -1)) : u = !1; if (u && (u = l || i), (a === 1 || Nr === t) && (Br === t || Ds === t ? y = r : y = r + 1, g = e.position - e.lineStart, a === 1 ? u && (_s(e, g) || hp(e, g, y)) || pp(e, y) ? c = !0 : (s && mp(e, y) || fp(e, y) || dp(e, y) ? c = !0 : wp(e) ? (c = !0, (e.tag !== null || e.anchor !== null) && w(e, 'alias node should not have any properties')) : lp(e, y, Br === t) && (c = !0, e.tag === null && (e.tag = '?')), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : a === 0 && (c = u && _s(e, g))), e.tag === null) { e.anchor !== null && (e.anchorMap[e.anchor] = e.result) }
    else if (e.tag === '?') { for (e.result !== null && e.kind !== 'scalar' && w(e, `unacceptable node kind for !<?> tag; it should be "scalar", not "${e.kind}"`), f = 0, p = e.implicitTypes.length; f < p; f += 1) if (h = e.implicitTypes[f], h.resolve(e.result)) { e.result = h.construct(e.result), e.tag = h.tag, e.anchor !== null && (e.anchorMap[e.anchor] = e.result); break } }
    else if (e.tag !== '!') {
      if (ae.call(e.typeMap[e.kind || 'fallback'], e.tag))
        h = e.typeMap[e.kind || 'fallback'][e.tag]; else for (h = null, d = e.typeMap.multi[e.kind || 'fallback'], f = 0, p = d.length; f < p; f += 1) if (e.tag.slice(0, d[f].tag.length) === d[f].tag) { h = d[f]; break }h || w(e, `unknown tag !<${e.tag}>`), e.result !== null && h.kind !== e.kind && w(e, `unacceptable node kind for !<${e.tag}> tag; it should be "${h.kind}", not "${e.kind}"`), h.resolve(e.result, e.tag) ? (e.result = h.construct(e.result, e.tag), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : w(e, `cannot resolve a node with !<${e.tag}> explicit tag`)
    } return e.listener !== null && e.listener('close', e), e.tag !== null || e.anchor !== null || c
  } function vp(e) {
    const r = e.position; let t; let n; let i; let o = !1; let s; for (e.version = null, e.checkLineBreaks = e.legacy, e.tagMap = Object.create(null), e.anchorMap = Object.create(null); (s = e.input.charCodeAt(e.position)) !== 0 && (O(e, !0, -1), s = e.input.charCodeAt(e.position), !(e.lineIndent > 0 || s !== 37));) {
      for (o = !0, s = e.input.charCodeAt(++e.position), t = e.position; s !== 0 && !K(s);)s = e.input.charCodeAt(++e.position); for (n = e.input.slice(t, e.position), i = [], n.length < 1 && w(e, 'directive name must not be less than one character in length'); s !== 0;) {
        for (;me(s);)s = e.input.charCodeAt(++e.position); if (s === 35) { do s = e.input.charCodeAt(++e.position); while (s !== 0 && !Z(s)); break } if (Z(s))
          break; for (t = e.position; s !== 0 && !K(s);)s = e.input.charCodeAt(++e.position); i.push(e.input.slice(t, e.position))
      }s !== 0 && nn(e), ae.call(Ls, n) ? Ls[n](e, n, i) : Ur(e, `unknown document directive "${n}"`)
    } if (O(e, !0, -1), e.lineIndent === 0 && e.input.charCodeAt(e.position) === 45 && e.input.charCodeAt(e.position + 1) === 45 && e.input.charCodeAt(e.position + 2) === 45 ? (e.position += 3, O(e, !0, -1)) : o && w(e, 'directives end mark is expected'), ke(e, e.lineIndent - 1, Nr, !1, !0), O(e, !0, -1), e.checkLineBreaks && np.test(e.input.slice(r, e.position)) && Ur(e, 'non-ASCII line breaks are interpreted as content'), e.documents.push(e.result), e.position === e.lineStart && Mr(e)) { e.input.charCodeAt(e.position) === 46 && (e.position += 3, O(e, !0, -1)); return } if (e.position < e.length - 1)
      w(e, 'end of the stream or a document separator is expected'); else return
  } function $s(e, r) {
    e = String(e), r = r || {}, e.length !== 0 && (e.charCodeAt(e.length - 1) !== 10 && e.charCodeAt(e.length - 1) !== 13 && (e += `
`), e.charCodeAt(0) === 65279 && (e = e.slice(1))); const t = new cp(e, r); const n = e.indexOf('\0'); for (n !== -1 && (t.position = n, w(t, 'null byte is not allowed in input')), t.input += '\0'; t.input.charCodeAt(t.position) === 32;)t.lineIndent += 1, t.position += 1; for (;t.position < t.length - 1;)vp(t); return t.documents
  } function xp(e, r, t) {
    r !== null && typeof r == 'object' && typeof t > 'u' && (t = r, r = null); const n = $s(e, t); if (typeof r != 'function')
      return n; for (let i = 0, o = n.length; i < o; i += 1)r(n[i])
  } function Sp(e, r) {
    const t = $s(e, r); if (t.length !== 0) {
      if (t.length === 1)
        return t[0]; throw new Ps('expected a single document in the stream, but found more')
    }
  }sn.exports.loadAll = xp; sn.exports.load = Sp
}); const cu = m((gg, au) => {
  'use strict'; const $r = Te(); const ur = Ae(); const Ep = Dr(); const Zs = Object.prototype.toString; const Xs = Object.prototype.hasOwnProperty; const fn = 65279; const bp = 9; const ir = 10; const Cp = 13; const Tp = 32; const Ap = 33; const Fp = 34; const un = 35; const Ip = 37; const kp = 38; const Lp = 39; const Op = 42; const Qs = 44; const _p = 45; const Rr = 58; const Pp = 61; const Dp = 62; const Bp = 63; const Np = 64; const eu = 91; const ru = 93; const Up = 96; const tu = 123; const Mp = 124; const nu = 125; const j = {}; j[0] = '\\0'; j[7] = '\\a'; j[8] = '\\b'; j[9] = '\\t'; j[10] = '\\n'; j[11] = '\\v'; j[12] = '\\f'; j[13] = '\\r'; j[27] = '\\e'; j[34] = '\\"'; j[92] = '\\\\'; j[133] = '\\N'; j[160] = '\\_'; j[8232] = '\\L'; j[8233] = '\\P'; const Rp = ['y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON', 'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF']; const qp = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/; function $p(e, r) {
    let t, n, i, o, s, u, a; if (r === null)
      return {}; for (t = {}, n = Object.keys(r), i = 0, o = n.length; i < o; i += 1)s = n[i], u = String(r[s]), s.slice(0, 2) === '!!' && (s = `tag:yaml.org,2002:${s.slice(2)}`), a = e.compiledTypeMap.fallback[s], a && Xs.call(a.styleAliases, u) && (u = a.styleAliases[u]), t[s] = u; return t
  } function jp(e) {
    let r, t, n; if (r = e.toString(16).toUpperCase(), e <= 255)
      t = 'x', n = 2; else if (e <= 65535)
      t = 'u', n = 4; else if (e <= 4294967295)
      t = 'U', n = 8; else throw new ur('code point within a string may not be greater than 0xFFFFFFFF'); return `\\${t}${$r.repeat('0', n - r.length)}${r}`
  } const Gp = 1; const or = 2; function Hp(e) { this.schema = e.schema || Ep, this.indent = Math.max(1, e.indent || 2), this.noArrayIndent = e.noArrayIndent || !1, this.skipInvalid = e.skipInvalid || !1, this.flowLevel = $r.isNothing(e.flowLevel) ? -1 : e.flowLevel, this.styleMap = $p(this.schema, e.styles || null), this.sortKeys = e.sortKeys || !1, this.lineWidth = e.lineWidth || 80, this.noRefs = e.noRefs || !1, this.noCompatMode = e.noCompatMode || !1, this.condenseFlow = e.condenseFlow || !1, this.quotingType = e.quotingType === '"' ? or : Gp, this.forceQuotes = e.forceQuotes || !1, this.replacer = typeof e.replacer == 'function' ? e.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = '', this.duplicates = [], this.usedDuplicates = null } function Gs(e, r) {
    for (var t = $r.repeat(' ', r), n = 0, i = -1, o = '', s, u = e.length; n < u;) {
      i = e.indexOf(`
`, n), i === -1 ? (s = e.slice(n), n = u) : (s = e.slice(n, i + 1), n = i + 1), s.length && s !== `
` && (o += t), o += s
    } return o
  } function an(e, r) {
    return `
${$r.repeat(' ', e.indent * r)}`
  } function Wp(e, r) {
    let t, n, i; for (t = 0, n = e.implicitTypes.length; t < n; t += 1) {
      if (i = e.implicitTypes[t], i.resolve(r))
        return !0
    } return !1
  } function qr(e) { return e === Tp || e === bp } function sr(e) { return e >= 32 && e <= 126 || e >= 161 && e <= 55295 && e !== 8232 && e !== 8233 || e >= 57344 && e <= 65533 && e !== fn || e >= 65536 && e <= 1114111 } function Hs(e) { return sr(e) && e !== fn && e !== Cp && e !== ir } function Ws(e, r, t) { const n = Hs(e); const i = n && !qr(e); return (t ? n : n && e !== Qs && e !== eu && e !== ru && e !== tu && e !== nu) && e !== un && !(r === Rr && !i) || Hs(r) && !qr(r) && e === un || r === Rr && i } function Yp(e) { return sr(e) && e !== fn && !qr(e) && e !== _p && e !== Bp && e !== Rr && e !== Qs && e !== eu && e !== ru && e !== tu && e !== nu && e !== un && e !== kp && e !== Op && e !== Ap && e !== Mp && e !== Pp && e !== Dp && e !== Lp && e !== Fp && e !== Ip && e !== Np && e !== Up } function Vp(e) { return !qr(e) && e !== Rr } function nr(e, r) { const t = e.charCodeAt(r); let n; return t >= 55296 && t <= 56319 && r + 1 < e.length && (n = e.charCodeAt(r + 1), n >= 56320 && n <= 57343) ? (t - 55296) * 1024 + n - 56320 + 65536 : t } function iu(e) { const r = /^\n* /; return r.test(e) } const ou = 1; const cn = 2; const su = 3; const uu = 4; const Le = 5; function zp(e, r, t, n, i, o, s, u) {
    let a; let l = 0; let c = null; let f = !1; let p = !1; const d = n !== -1; let h = -1; let y = Yp(nr(e, 0)) && Vp(nr(e, e.length - 1)); if (r || s) {
      for (a = 0; a < e.length; l >= 65536 ? a += 2 : a++) {
        if (l = nr(e, a), !sr(l))
          return Le; y = y && Ws(l, c, u), c = l
      }
    }
    else {
      for (a = 0; a < e.length; l >= 65536 ? a += 2 : a++) {
        if (l = nr(e, a), l === ir)
          f = !0, d && (p = p || a - h - 1 > n && e[h + 1] !== ' ', h = a); else if (!sr(l))
          return Le; y = y && Ws(l, c, u), c = l
      }p = p || d && a - h - 1 > n && e[h + 1] !== ' '
    } return !f && !p ? y && !s && !i(e) ? ou : o === or ? Le : cn : t > 9 && iu(e) ? Le : s ? o === or ? Le : cn : p ? uu : su
  } function Kp(e, r, t, n, i) {
    e.dump = (function () {
      if (r.length === 0)
        return e.quotingType === or ? '""' : '\'\''; if (!e.noCompatMode && (Rp.includes(r) || qp.test(r)))
        return e.quotingType === or ? `"${r}"` : `'${r}'`; const o = e.indent * Math.max(1, t); const s = e.lineWidth === -1 ? -1 : Math.max(Math.min(e.lineWidth, 40), e.lineWidth - o); const u = n || e.flowLevel > -1 && t >= e.flowLevel; function a(l) { return Wp(e, l) } switch (zp(r, u, e.indent, s, a, e.quotingType, e.forceQuotes && !n, i)) { case ou:return r; case cn:return `'${r.replace(/'/g, '\'\'')}'`; case su:return `|${Ys(r, e.indent)}${Vs(Gs(r, o))}`; case uu:return `>${Ys(r, e.indent)}${Vs(Gs(Jp(r, s), o))}`; case Le:return `"${Zp(r, s)}"`; default:throw new ur('impossible error: invalid scalar style') }
    }())
  } function Ys(e, r) {
    const t = iu(e) ? String(r) : ''; const n = e[e.length - 1] === `
`; const i = n && (e[e.length - 2] === `
` || e === `
`); const o = i ? '+' : n ? '' : '-'; return `${t + o}
`
  } function Vs(e) {
    return e[e.length - 1] === `
`
      ? e.slice(0, -1)
      : e
  } function Jp(e, r) {
    for (var t = /(\n+)([^\n]*)/g, n = (function () {
        let l = e.indexOf(`
`); return l = l !== -1 ? l : e.length, t.lastIndex = l, zs(e.slice(0, l), r)
      }()), i = e[0] === `
      ` || e[0] === ' ', o, s; s = t.exec(e);) {
      const u = s[1]; const a = s[2]; o = a[0] === ' ', n += u + (!i && !o && a !== ''
        ? `
`
        : '') + zs(a, r), i = o
    } return n
  } function zs(e, r) {
    if (e === '' || e[0] === ' ')
      return e; for (var t = / [^ ]/g, n, i = 0, o, s = 0, u = 0, a = ''; n = t.exec(e);) {
      u = n.index, u - i > r && (o = s > i ? s : u, a += `
  ${e.slice(i, o)}`, i = o + 1), s = u
    } return a += `
`, e.length - i > r && s > i
      ? a += `${e.slice(i, s)}
${e.slice(s + 1)}`
      : a += e.slice(i), a.slice(1)
  } function Zp(e) { for (var r = '', t = 0, n, i = 0; i < e.length; t >= 65536 ? i += 2 : i++)t = nr(e, i), n = j[t], !n && sr(t) ? (r += e[i], t >= 65536 && (r += e[i + 1])) : r += n || jp(t); return r } function Xp(e, r, t) { let n = ''; const i = e.tag; let o; let s; let u; for (o = 0, s = t.length; o < s; o += 1)u = t[o], e.replacer && (u = e.replacer.call(t, String(o), u)), (ee(e, r, u, !1, !1) || typeof u > 'u' && ee(e, r, null, !1, !1)) && (n !== '' && (n += `,${e.condenseFlow ? '' : ' '}`), n += e.dump); e.tag = i, e.dump = `[${n}]` } function Ks(e, r, t, n) { let i = ''; const o = e.tag; let s; let u; let a; for (s = 0, u = t.length; s < u; s += 1)a = t[s], e.replacer && (a = e.replacer.call(t, String(s), a)), (ee(e, r + 1, a, !0, !0, !1, !0) || typeof a > 'u' && ee(e, r + 1, null, !0, !0, !1, !0)) && ((!n || i !== '') && (i += an(e, r)), e.dump && ir === e.dump.charCodeAt(0) ? i += '-' : i += '- ', i += e.dump); e.tag = o, e.dump = i || '[]' } function Qp(e, r, t) { let n = ''; const i = e.tag; const o = Object.keys(t); let s; let u; let a; let l; let c; for (s = 0, u = o.length; s < u; s += 1)c = '', n !== '' && (c += ', '), e.condenseFlow && (c += '"'), a = o[s], l = t[a], e.replacer && (l = e.replacer.call(t, a, l)), ee(e, r, a, !1, !1) && (e.dump.length > 1024 && (c += '? '), c += `${e.dump + (e.condenseFlow ? '"' : '')}:${e.condenseFlow ? '' : ' '}`, ee(e, r, l, !1, !1) && (c += e.dump, n += c)); e.tag = i, e.dump = `{${n}}` } function em(e, r, t, n) {
    let i = ''; const o = e.tag; const s = Object.keys(t); let u; let a; let l; let c; let f; let p; if (e.sortKeys === !0)
      s.sort(); else if (typeof e.sortKeys == 'function')
      s.sort(e.sortKeys); else if (e.sortKeys)
      throw new ur('sortKeys must be a boolean or a function'); for (u = 0, a = s.length; u < a; u += 1)p = '', (!n || i !== '') && (p += an(e, r)), l = s[u], c = t[l], e.replacer && (c = e.replacer.call(t, l, c)), ee(e, r + 1, l, !0, !0, !0) && (f = e.tag !== null && e.tag !== '?' || e.dump && e.dump.length > 1024, f && (e.dump && ir === e.dump.charCodeAt(0) ? p += '?' : p += '? '), p += e.dump, f && (p += an(e, r)), ee(e, r + 1, c, !0, f) && (e.dump && ir === e.dump.charCodeAt(0) ? p += ':' : p += ': ', p += e.dump, i += p)); e.tag = o, e.dump = i || '{}'
  } function Js(e, r, t) {
    let n, i, o, s, u, a; for (i = t ? e.explicitTypes : e.implicitTypes, o = 0, s = i.length; o < s; o += 1) {
      if (u = i[o], (u.instanceOf || u.predicate) && (!u.instanceOf || typeof r == 'object' && r instanceof u.instanceOf) && (!u.predicate || u.predicate(r))) {
        if (t ? u.multi && u.representName ? e.tag = u.representName(r) : e.tag = u.tag : e.tag = '?', u.represent) {
          if (a = e.styleMap[u.tag] || u.defaultStyle, Zs.call(u.represent) === '[object Function]')
            n = u.represent(r, a); else if (Xs.call(u.represent, a))
            n = u.represent[a](r, a); else throw new ur(`!<${u.tag}> tag resolver accepts not "${a}" style`); e.dump = n
        } return !0
      }
    } return !1
  } function ee(e, r, t, n, i, o, s) {
    e.tag = null, e.dump = t, Js(e, t, !1) || Js(e, t, !0); const u = Zs.call(e.dump); const a = n; let l; n && (n = e.flowLevel < 0 || e.flowLevel > r); const c = u === '[object Object]' || u === '[object Array]'; let f; let p; if (c && (f = e.duplicates.indexOf(t), p = f !== -1), (e.tag !== null && e.tag !== '?' || p || e.indent !== 2 && r > 0) && (i = !1), p && e.usedDuplicates[f]) { e.dump = `*ref_${f}` }
    else {
      if (c && p && !e.usedDuplicates[f] && (e.usedDuplicates[f] = !0), u === '[object Object]') { n && Object.keys(e.dump).length !== 0 ? (em(e, r, e.dump, i), p && (e.dump = `&ref_${f}${e.dump}`)) : (Qp(e, r, e.dump), p && (e.dump = `&ref_${f} ${e.dump}`)) }
      else if (u === '[object Array]') { n && e.dump.length !== 0 ? (e.noArrayIndent && !s && r > 0 ? Ks(e, r - 1, e.dump, i) : Ks(e, r, e.dump, i), p && (e.dump = `&ref_${f}${e.dump}`)) : (Xp(e, r, e.dump), p && (e.dump = `&ref_${f} ${e.dump}`)) }
      else if (u === '[object String]') { e.tag !== '?' && Kp(e, e.dump, r, o, a) }
      else {
        if (u === '[object Undefined]')
          return !1; if (e.skipInvalid)
          return !1; throw new ur(`unacceptable kind of an object to dump ${u}`)
      }e.tag !== null && e.tag !== '?' && (l = encodeURI(e.tag[0] === '!' ? e.tag.slice(1) : e.tag).replace(/!/g, '%21'), e.tag[0] === '!' ? l = `!${l}` : l.slice(0, 18) === 'tag:yaml.org,2002:' ? l = `!!${l.slice(18)}` : l = `!<${l}>`, e.dump = `${l} ${e.dump}`)
    } return !0
  } function rm(e, r) { const t = []; const n = []; let i; let o; for (ln(e, t, n), i = 0, o = n.length; i < o; i += 1)r.duplicates.push(t[n[i]]); r.usedDuplicates = new Array(o) } function ln(e, r, t) {
    let n, i, o; if (e !== null && typeof e == 'object') {
      if (i = r.indexOf(e), i !== -1)
        !t.includes(i) && t.push(i); else if (r.push(e), Array.isArray(e))
        for (i = 0, o = e.length; i < o; i += 1)ln(e[i], r, t); else for (n = Object.keys(e), i = 0, o = n.length; i < o; i += 1)ln(e[n[i]], r, t)
    }
  } function tm(e, r) {
    r = r || {}; const t = new Hp(r); t.noRefs || rm(e, t); let n = e; return t.replacer && (n = t.replacer.call({ '': n }, '', n)), ee(t, 0, n, !0, !0)
      ? `${t.dump}
`
      : ''
  }au.exports.dump = tm
}); const fu = m((wg, W) => { 'use strict'; const lu = js(); const nm = cu(); function dn(e, r) { return function () { throw new Error(`Function yaml.${e} is removed in js-yaml 4. Use yaml.${r} instead, which is now safe by default.`) } }W.exports.Type = $(); W.exports.Schema = Mt(); W.exports.FAILSAFE_SCHEMA = jt(); W.exports.JSON_SCHEMA = Vt(); W.exports.CORE_SCHEMA = zt(); W.exports.DEFAULT_SCHEMA = Dr(); W.exports.load = lu.load; W.exports.loadAll = lu.loadAll; W.exports.dump = nm.dump; W.exports.YAMLException = Ae(); W.exports.types = { binary: Xt(), float: Yt(), map: $t(), null: Gt(), pairs: en(), set: rn(), timestamp: Kt(), bool: Ht(), int: Wt(), merge: Jt(), omap: Qt(), seq: qt(), str: Rt() }; W.exports.safeLoad = dn('safeLoad', 'load'); W.exports.safeLoadAll = dn('safeLoadAll', 'loadAll'); W.exports.safeDump = dn('safeDump', 'dump') }); const mu = m((pn) => {
  const im = Object.create; const jr = Object.defineProperty; const om = Object.getPrototypeOf; const sm = Object.prototype.hasOwnProperty; const um = Object.getOwnPropertyNames; const am = Object.getOwnPropertyDescriptor; const pu = e => jr(e, '__esModule', { value: !0 }); const cm = (e, r) => { for (const t in r)jr(e, t, { get: r[t], enumerable: !0 }) }; const lm = (e, r, t) => {
    if (r && typeof r == 'object' || typeof r == 'function')
      for (const n of um(r))!sm.call(e, n) && n !== 'default' && jr(e, n, { get: () => r[n], enumerable: !(t = am(r, n)) || t.enumerable }); return e
  }; const Gr = e => e && e.__esModule ? e : lm(pu(jr(e != null ? im(om(e)) : {}, 'default', { value: e, enumerable: !0 })), e); pu(pn); cm(pn, { yamlPlugin: () => mm }); const du = Gr(require('node:path')); const fm = Gr(Zo()); const dm = Gr(fu()); const pm = Gr(require('node:util')); var mm = e => ({ name: 'yaml', setup(r) {
    r.onResolve({ filter: /\.(yml|yaml)$/ }, (t) => {
      if (t.resolveDir !== '')
        return { path: du.default.isAbsolute(t.path) ? t.path : du.default.join(t.resolveDir, t.path), namespace: 'yaml' }
    }), r.onLoad({ filter: /.*/, namespace: 'yaml' }, async (t) => { const n = await fm.default.readFile(t.path); let i = dm.default.load(new pm.TextDecoder().decode(n), e?.loadOptions); return e?.transform && e.transform(i, t.path) !== void 0 && (i = e.transform(i, t.path)), { contents: JSON.stringify(i), loader: 'json' } })
  } })
}); const vu = m((xg, wu) => {
  wu.exports = gu; gu.sync = ym; const hu = require('node:fs'); function hm(e, r) {
    let t = r.pathExt !== void 0 ? r.pathExt : process.env.PATHEXT; if (!t || (t = t.split(';'), t.includes('')))
      return !0; for (let n = 0; n < t.length; n++) {
      const i = t[n].toLowerCase(); if (i && e.substr(-i.length).toLowerCase() === i)
        return !0
    } return !1
  } function yu(e, r, t) { return !e.isSymbolicLink() && !e.isFile() ? !1 : hm(r, t) } function gu(e, r, t) { hu.stat(e, (n, i) => { t(n, n ? !1 : yu(i, e, r)) }) } function ym(e, r) { return yu(hu.statSync(e), e, r) }
}); const Cu = m((Sg, bu) => { bu.exports = Su; Su.sync = gm; const xu = require('node:fs'); function Su(e, r, t) { xu.stat(e, (n, i) => { t(n, n ? !1 : Eu(i, r)) }) } function gm(e, r) { return Eu(xu.statSync(e), r) } function Eu(e, r) { return e.isFile() && wm(e, r) } function wm(e, r) { const t = e.mode; const n = e.uid; const i = e.gid; const o = r.uid !== void 0 ? r.uid : process.getuid && process.getuid(); const s = r.gid !== void 0 ? r.gid : process.getgid && process.getgid(); const u = Number.parseInt('100', 8); const a = Number.parseInt('010', 8); const l = Number.parseInt('001', 8); const c = u | a; const f = t & l || t & a && i === s || t & u && n === o || t & c && o === 0; return f } }); const Au = m((bg, Tu) => {
  const Eg = require('node:fs'); let Hr; process.platform === 'win32' || global.TESTING_WINDOWS ? Hr = vu() : Hr = Cu(); Tu.exports = mn; mn.sync = vm; function mn(e, r, t) {
    if (typeof r == 'function' && (t = r, r = {}), !t) {
      if (typeof Promise != 'function')
        throw new TypeError('callback not provided'); return new Promise((n, i) => { mn(e, r || {}, (o, s) => { o ? i(o) : n(s) }) })
    }Hr(e, r || {}, (n, i) => { n && (n.code === 'EACCES' || r && r.ignoreErrors) && (n = null, i = !1), t(n, i) })
  } function vm(e, r) {
    try { return Hr.sync(e, r || {}) }
    catch (t) {
      if (r && r.ignoreErrors || t.code === 'EACCES')
        return !1; throw t
    }
  }
}); const Pu = m((Cg, _u) => {
  const Oe = process.platform === 'win32' || process.env.OSTYPE === 'cygwin' || process.env.OSTYPE === 'msys'; const Fu = require('node:path'); const xm = Oe ? ';' : ':'; const Iu = Au(); const ku = e => Object.assign(new Error(`not found: ${e}`), { code: 'ENOENT' }); const Lu = (e, r) => { const t = r.colon || xm; const n = e.match(/\//) || Oe && e.match(/\\/) ? [''] : [...Oe ? [process.cwd()] : [], ...(r.path || process.env.PATH || '').split(t)]; const i = Oe ? r.pathExt || process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM' : ''; const o = Oe ? i.split(t) : ['']; return Oe && e.includes('.') && o[0] !== '' && o.unshift(''), { pathEnv: n, pathExt: o, pathExtExe: i } }; const Ou = (e, r, t) => {
    typeof r == 'function' && (t = r, r = {}), r || (r = {}); const { pathEnv: n, pathExt: i, pathExtExe: o } = Lu(e, r); const s = []; const u = l => new Promise((c, f) => {
      if (l === n.length)
        return r.all && s.length ? c(s) : f(ku(e)); const p = n[l]; const d = /^".*"$/.test(p) ? p.slice(1, -1) : p; const h = Fu.join(d, e); const y = !d && /^\.[\\\/]/.test(e) ? e.slice(0, 2) + h : h; c(a(y, l, 0))
    }); let a = (l, c, f) => new Promise((p, d) => {
      if (f === i.length)
        return p(u(c + 1)); const h = i[f]; Iu(l + h, { pathExt: o }, (y, g) => {
        if (!y && g) {
          if (r.all)
            s.push(l + h); else return p(l + h) 
} return p(a(l, c, f + 1))
      })
    }); return t ? u(0).then(l => t(null, l), t) : u(0)
  }; const Sm = (e, r) => {
    r = r || {}; const { pathEnv: t, pathExt: n, pathExtExe: i } = Lu(e, r); const o = []; for (let s = 0; s < t.length; s++) {
      const u = t[s]; const a = /^".*"$/.test(u) ? u.slice(1, -1) : u; const l = Fu.join(a, e); const c = !a && /^\.[\\\/]/.test(e) ? e.slice(0, 2) + l : l; for (let f = 0; f < n.length; f++) {
        const p = c + n[f]; try {
          if (Iu.sync(p, { pathExt: i })) {
            if (r.all)
              o.push(p); else return p
          }
        }
        catch {}
      }
    } if (r.all && o.length)
      return o; if (r.nothrow)
      return null; throw ku(e)
  }; _u.exports = Ou; Ou.sync = Sm
}); const yn = m((Tg, hn) => { 'use strict'; const Du = (e = {}) => { const r = e.env || process.env; return (e.platform || process.platform) !== 'win32' ? 'PATH' : Object.keys(r).reverse().find(n => n.toUpperCase() === 'PATH') || 'Path' }; hn.exports = Du; hn.exports.default = Du }); const Mu = m((Ag, Uu) => {
  'use strict'; const Bu = require('node:path'); const Em = Pu(); const bm = yn(); function Nu(e, r) {
    const t = e.options.env || process.env; const n = process.cwd(); const i = e.options.cwd != null; const o = i && process.chdir !== void 0 && !process.chdir.disabled; if (o) {
      try { process.chdir(e.options.cwd) }
      catch {}
    } let s; try { s = Em.sync(e.command, { path: t[bm({ env: t })], pathExt: r ? Bu.delimiter : void 0 }) }
    catch {}
    finally { o && process.chdir(n) } return s && (s = Bu.resolve(i ? e.options.cwd : '', s)), s
  } function Cm(e) { return Nu(e) || Nu(e, !0) }Uu.exports = Cm
}); const Ru = m((Fg, wn) => { 'use strict'; const gn = /([()\][%!^"`<>&|;, *?])/g; function Tm(e) { return e = e.replace(gn, '^$1'), e } function Am(e, r) { return e = `${e}`, e = e.replace(/(\\*)"/g, '$1$1\\"'), e = e.replace(/(\\*)$/, '$1$1'), e = `"${e}"`, e = e.replace(gn, '^$1'), r && (e = e.replace(gn, '^$1')), e }wn.exports.command = Tm; wn.exports.argument = Am }); const $u = m((Ig, qu) => { 'use strict'; qu.exports = /^#!(.*)/ }); const Gu = m((kg, ju) => {
  'use strict'; const Fm = $u(); ju.exports = (e = '') => {
    const r = e.match(Fm); if (!r)
      return null; const [t, n] = r[0].replace(/#! ?/, '').split(' '); const i = t.split('/').pop(); return i === 'env' ? n : n ? `${i} ${n}` : i
  }
}); const Wu = m((Lg, Hu) => {
  'use strict'; const vn = require('node:fs'); const Im = Gu(); function km(e) {
    const t = Buffer.alloc(150); let n; try { n = vn.openSync(e, 'r'), vn.readSync(n, t, 0, 150, 0), vn.closeSync(n) }
    catch {} return Im(t.toString())
  }Hu.exports = km
}); const Ku = m((Og, zu) => {
  'use strict'; const Lm = require('node:path'); const Yu = Mu(); const Vu = Ru(); const Om = Wu(); const _m = process.platform === 'win32'; const Pm = /\.(?:com|exe)$/i; const Dm = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i; function Bm(e) { e.file = Yu(e); const r = e.file && Om(e.file); return r ? (e.args.unshift(e.file), e.command = r, Yu(e)) : e.file } function Nm(e) {
    if (!_m)
      return e; const r = Bm(e); const t = !Pm.test(r); if (e.options.forceShell || t) { const n = Dm.test(r); e.command = Lm.normalize(e.command), e.command = Vu.command(e.command), e.args = e.args.map(o => Vu.argument(o, n)); const i = [e.command].concat(e.args).join(' '); e.args = ['/d', '/s', '/c', `"${i}"`], e.command = process.env.comspec || 'cmd.exe', e.options.windowsVerbatimArguments = !0 } return e
  } function Um(e, r, t) { r && !Array.isArray(r) && (t = r, r = null), r = r ? r.slice(0) : [], t = Object.assign({}, t); const n = { command: e, args: r, options: t, file: void 0, original: { command: e, args: r } }; return t.shell ? n : Nm(n) }zu.exports = Um
}); const Xu = m((_g, Zu) => {
  'use strict'; const xn = process.platform === 'win32'; function Sn(e, r) { return Object.assign(new Error(`${r} ${e.command} ENOENT`), { code: 'ENOENT', errno: 'ENOENT', syscall: `${r} ${e.command}`, path: e.command, spawnargs: e.args }) } function Mm(e, r) {
    if (!xn)
      return; const t = e.emit; e.emit = function (n, i) {
      if (n === 'exit') {
        const o = Ju(i, r, 'spawn'); if (o)
          return t.call(e, 'error', o)
      } return t.apply(e, arguments)
    }
  } function Ju(e, r) { return xn && e === 1 && !r.file ? Sn(r.original, 'spawn') : null } function Rm(e, r) { return xn && e === 1 && !r.file ? Sn(r.original, 'spawnSync') : null }Zu.exports = { hookChildProcess: Mm, verifyENOENT: Ju, verifyENOENTSync: Rm, notFoundError: Sn }
}); const ra = m((Pg, _e) => { 'use strict'; const Qu = require('node:child_process'); const En = Ku(); const bn = Xu(); function ea(e, r, t) { const n = En(e, r, t); const i = Qu.spawn(n.command, n.args, n.options); return bn.hookChildProcess(i, n), i } function qm(e, r, t) { const n = En(e, r, t); const i = Qu.spawnSync(n.command, n.args, n.options); return i.error = i.error || bn.verifyENOENTSync(i.status, n), i }_e.exports = ea; _e.exports.spawn = ea; _e.exports.sync = qm; _e.exports._parse = En; _e.exports._enoent = bn }); const na = m((Dg, ta) => {
  'use strict'; ta.exports = (e) => {
    const r = typeof e == 'string'
      ? `
`
      : 10; const t = typeof e == 'string' ? '\r' : 13; return e[e.length - 1] === r && (e = e.slice(0, e.length - 1)), e[e.length - 1] === t && (e = e.slice(0, e.length - 1)), e
  }
}); const sa = m((Bg, cr) => { 'use strict'; const ar = require('node:path'); const ia = yn(); const oa = (e) => { e = { cwd: process.cwd(), path: process.env[ia()], execPath: process.execPath, ...e }; let r; let t = ar.resolve(e.cwd); const n = []; for (;r !== t;)n.push(ar.join(t, 'node_modules/.bin')), r = t, t = ar.resolve(t, '..'); const i = ar.resolve(e.cwd, e.execPath, '..'); return n.push(i), n.concat(e.path).join(ar.delimiter) }; cr.exports = oa; cr.exports.default = oa; cr.exports.env = (e) => { e = { env: process.env, ...e }; const r = { ...e.env }; const t = ia({ env: r }); return e.path = r[t], r[t] = cr.exports(e), r } }); const aa = m((Ng, Cn) => { 'use strict'; const ua = (e, r) => { for (const t of Reflect.ownKeys(r))Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t)); return e }; Cn.exports = ua; Cn.exports.default = ua }); const la = m((Ug, Yr) => {
  'use strict'; const $m = aa(); const Wr = new WeakMap(); const ca = (e, r = {}) => {
    if (typeof e != 'function')
      throw new TypeError('Expected a function'); let t; let n = 0; const i = e.displayName || e.name || '<anonymous>'; const o = function (...s) {
      if (Wr.set(o, ++n), n === 1)
        t = e.apply(this, s), e = null; else if (r.throw === !0)
        throw new Error(`Function \`${i}\` can only be called once`); return t
    }; return $m(o, e), Wr.set(o, n), o
  }; Yr.exports = ca; Yr.exports.default = ca; Yr.exports.callCount = (e) => {
    if (!Wr.has(e))
      throw new Error(`The given function \`${e.name}\` is not wrapped by the \`onetime\` package`); return Wr.get(e)
  }
}); const fa = m((Vr) => { 'use strict'; Object.defineProperty(Vr, '__esModule', { value: !0 }); Vr.SIGNALS = void 0; const jm = [{ name: 'SIGHUP', number: 1, action: 'terminate', description: 'Terminal closed', standard: 'posix' }, { name: 'SIGINT', number: 2, action: 'terminate', description: 'User interruption with CTRL-C', standard: 'ansi' }, { name: 'SIGQUIT', number: 3, action: 'core', description: 'User interruption with CTRL-\\', standard: 'posix' }, { name: 'SIGILL', number: 4, action: 'core', description: 'Invalid machine instruction', standard: 'ansi' }, { name: 'SIGTRAP', number: 5, action: 'core', description: 'Debugger breakpoint', standard: 'posix' }, { name: 'SIGABRT', number: 6, action: 'core', description: 'Aborted', standard: 'ansi' }, { name: 'SIGIOT', number: 6, action: 'core', description: 'Aborted', standard: 'bsd' }, { name: 'SIGBUS', number: 7, action: 'core', description: 'Bus error due to misaligned, non-existing address or paging error', standard: 'bsd' }, { name: 'SIGEMT', number: 7, action: 'terminate', description: 'Command should be emulated but is not implemented', standard: 'other' }, { name: 'SIGFPE', number: 8, action: 'core', description: 'Floating point arithmetic error', standard: 'ansi' }, { name: 'SIGKILL', number: 9, action: 'terminate', description: 'Forced termination', standard: 'posix', forced: !0 }, { name: 'SIGUSR1', number: 10, action: 'terminate', description: 'Application-specific signal', standard: 'posix' }, { name: 'SIGSEGV', number: 11, action: 'core', description: 'Segmentation fault', standard: 'ansi' }, { name: 'SIGUSR2', number: 12, action: 'terminate', description: 'Application-specific signal', standard: 'posix' }, { name: 'SIGPIPE', number: 13, action: 'terminate', description: 'Broken pipe or socket', standard: 'posix' }, { name: 'SIGALRM', number: 14, action: 'terminate', description: 'Timeout or timer', standard: 'posix' }, { name: 'SIGTERM', number: 15, action: 'terminate', description: 'Termination', standard: 'ansi' }, { name: 'SIGSTKFLT', number: 16, action: 'terminate', description: 'Stack is empty or overflowed', standard: 'other' }, { name: 'SIGCHLD', number: 17, action: 'ignore', description: 'Child process terminated, paused or unpaused', standard: 'posix' }, { name: 'SIGCLD', number: 17, action: 'ignore', description: 'Child process terminated, paused or unpaused', standard: 'other' }, { name: 'SIGCONT', number: 18, action: 'unpause', description: 'Unpaused', standard: 'posix', forced: !0 }, { name: 'SIGSTOP', number: 19, action: 'pause', description: 'Paused', standard: 'posix', forced: !0 }, { name: 'SIGTSTP', number: 20, action: 'pause', description: 'Paused using CTRL-Z or "suspend"', standard: 'posix' }, { name: 'SIGTTIN', number: 21, action: 'pause', description: 'Background process cannot read terminal input', standard: 'posix' }, { name: 'SIGBREAK', number: 21, action: 'terminate', description: 'User interruption with CTRL-BREAK', standard: 'other' }, { name: 'SIGTTOU', number: 22, action: 'pause', description: 'Background process cannot write to terminal output', standard: 'posix' }, { name: 'SIGURG', number: 23, action: 'ignore', description: 'Socket received out-of-band data', standard: 'bsd' }, { name: 'SIGXCPU', number: 24, action: 'core', description: 'Process timed out', standard: 'bsd' }, { name: 'SIGXFSZ', number: 25, action: 'core', description: 'File too big', standard: 'bsd' }, { name: 'SIGVTALRM', number: 26, action: 'terminate', description: 'Timeout or timer', standard: 'bsd' }, { name: 'SIGPROF', number: 27, action: 'terminate', description: 'Timeout or timer', standard: 'bsd' }, { name: 'SIGWINCH', number: 28, action: 'ignore', description: 'Terminal window size changed', standard: 'bsd' }, { name: 'SIGIO', number: 29, action: 'terminate', description: 'I/O is available', standard: 'other' }, { name: 'SIGPOLL', number: 29, action: 'terminate', description: 'Watched event', standard: 'other' }, { name: 'SIGINFO', number: 29, action: 'ignore', description: 'Request for process information', standard: 'other' }, { name: 'SIGPWR', number: 30, action: 'terminate', description: 'Device running out of power', standard: 'systemv' }, { name: 'SIGSYS', number: 31, action: 'core', description: 'Invalid system call', standard: 'other' }, { name: 'SIGUNUSED', number: 31, action: 'terminate', description: 'Invalid system call', standard: 'other' }]; Vr.SIGNALS = jm }); const Tn = m((Pe) => { 'use strict'; Object.defineProperty(Pe, '__esModule', { value: !0 }); Pe.SIGRTMAX = Pe.getRealtimeSignals = void 0; const Gm = function () { const e = pa - da + 1; return Array.from({ length: e }, Hm) }; Pe.getRealtimeSignals = Gm; var Hm = function (e, r) { return { name: `SIGRT${r + 1}`, number: da + r, action: 'terminate', description: 'Application-specific signal (realtime)', standard: 'posix' } }; var da = 34; var pa = 64; Pe.SIGRTMAX = pa }); const ma = m((zr) => { 'use strict'; Object.defineProperty(zr, '__esModule', { value: !0 }); zr.getSignals = void 0; const Wm = require('node:os'); const Ym = fa(); const Vm = Tn(); const zm = function () { const e = (0, Vm.getRealtimeSignals)(); return [...Ym.SIGNALS, ...e].map(Km) }; zr.getSignals = zm; var Km = function ({ name: e, number: r, description: t, action: n, forced: i = !1, standard: o }) { const { signals: { [e]: s } } = Wm.constants; const u = s !== void 0; return { name: e, number: u ? s : r, description: t, supported: u, action: n, forced: i, standard: o } } }); const ya = m((De) => {
  'use strict'; Object.defineProperty(De, '__esModule', { value: !0 }); De.signalsByNumber = De.signalsByName = void 0; const Jm = require('node:os'); const ha = ma(); const Zm = Tn(); const Xm = function () { return (0, ha.getSignals)().reduce(Qm, {}) }; var Qm = function (e, { name: r, number: t, description: n, supported: i, action: o, forced: s, standard: u }) { return { ...e, [r]: { name: r, number: t, description: n, supported: i, action: o, forced: s, standard: u } } }; const eh = Xm(); De.signalsByName = eh; const rh = function () { const e = (0, ha.getSignals)(); const r = Zm.SIGRTMAX + 1; const t = Array.from({ length: r }, (n, i) => th(i, e)); return Object.assign({}, ...t) }; var th = function (e, r) {
    const t = nh(e, r); if (t === void 0)
      return {}; const { name: n, description: i, supported: o, action: s, forced: u, standard: a } = t; return { [e]: { name: n, number: e, description: i, supported: o, action: s, forced: u, standard: a } }
  }; var nh = function (e, r) { const t = r.find(({ name: n }) => Jm.constants.signals[n] === e); return t !== void 0 ? t : r.find(n => n.number === e) }; const ih = rh(); De.signalsByNumber = ih
}); const wa = m((jg, ga) => {
  'use strict'; const { signalsByName: oh } = ya(); const sh = ({ timedOut: e, timeout: r, errorCode: t, signal: n, signalDescription: i, exitCode: o, isCanceled: s }) => e ? `timed out after ${r} milliseconds` : s ? 'was canceled' : t !== void 0 ? `failed with ${t}` : n !== void 0 ? `was killed with ${n} (${i})` : o !== void 0 ? `failed with exit code ${o}` : 'failed'; const uh = ({ stdout: e, stderr: r, all: t, error: n, signal: i, exitCode: o, command: s, escapedCommand: u, timedOut: a, isCanceled: l, killed: c, parsed: { options: { timeout: f } } }) => {
    o = o === null ? void 0 : o, i = i === null ? void 0 : i; const p = i === void 0 ? void 0 : oh[i].description; const d = n && n.code; const y = `Command ${sh({ timedOut: a, timeout: f, errorCode: d, signal: i, signalDescription: p, exitCode: o, isCanceled: l })}: ${s}`; const g = Object.prototype.toString.call(n) === '[object Error]'; const x = g
      ? `${y}
${n.message}`
      : y; const v = [x, r, e].filter(Boolean).join(`
`); return g ? (n.originalMessage = n.message, n.message = v) : n = new Error(v), n.shortMessage = x, n.command = s, n.escapedCommand = u, n.exitCode = o, n.signal = i, n.signalDescription = p, n.stdout = e, n.stderr = r, t !== void 0 && (n.all = t), 'bufferedData' in n && delete n.bufferedData, n.failed = !0, n.timedOut = !!a, n.isCanceled = l, n.killed = c && !a, n
  }; ga.exports = uh
}); const xa = m((Gg, An) => {
  'use strict'; const Kr = ['stdin', 'stdout', 'stderr']; const ah = e => Kr.some(r => e[r] !== void 0); const va = (e) => {
    if (!e)
      return; const { stdio: r } = e; if (r === void 0)
      return Kr.map(n => e[n]); if (ah(e))
      throw new Error(`It's not possible to provide \`stdio\` in combination with one of ${Kr.map(n => `\`${n}\``).join(', ')}`); if (typeof r == 'string')
      return r; if (!Array.isArray(r))
      throw new TypeError(`Expected \`stdio\` to be of type \`string\` or \`Array\`, got \`${typeof r}\``); const t = Math.max(r.length, Kr.length); return Array.from({ length: t }, (n, i) => r[i])
  }; An.exports = va; An.exports.node = (e) => { const r = va(e); return r === 'ipc' ? 'ipc' : r === void 0 || typeof r == 'string' ? [r, r, r, 'ipc'] : r.includes('ipc') ? r : [...r, 'ipc'] }
}); const Sa = m((Hg, Jr) => { Jr.exports = ['SIGABRT', 'SIGALRM', 'SIGHUP', 'SIGINT', 'SIGTERM']; process.platform !== 'win32' && Jr.exports.push('SIGVTALRM', 'SIGXCPU', 'SIGXFSZ', 'SIGUSR2', 'SIGTRAP', 'SIGSYS', 'SIGQUIT', 'SIGIOT'); process.platform === 'linux' && Jr.exports.push('SIGIO', 'SIGPOLL', 'SIGPWR', 'SIGSTKFLT', 'SIGUNUSED') }); const Aa = m((Wg, Ue) => {
  const F = global.process; const he = function (e) { return e && typeof e == 'object' && typeof e.removeListener == 'function' && typeof e.emit == 'function' && typeof e.reallyExit == 'function' && typeof e.listeners == 'function' && typeof e.kill == 'function' && typeof e.pid == 'number' && typeof e.on == 'function' }; he(F)
    ? (Ea = require('node:assert'), Be = Sa(), ba = /^win/i.test(F.platform), lr = require('node:events'), typeof lr != 'function' && (lr = lr.EventEmitter), F.__signal_exit_emitter__ ? P = F.__signal_exit_emitter__ : (P = F.__signal_exit_emitter__ = new lr(), P.count = 0, P.emitted = {}), P.infinite || (P.setMaxListeners(1 / 0), P.infinite = !0), Ue.exports = function (e, r) {
        if (!he(global.process))
          return function () {}; Ea.equal(typeof e, 'function', 'a callback must be provided for exit handler'), Ne === !1 && Fn(); let t = 'exit'; r && r.alwaysLast && (t = 'afterexit'); const n = function () { P.removeListener(t, e), P.listeners('exit').length === 0 && P.listeners('afterexit').length === 0 && Zr() }; return P.on(t, e), n
      }, Zr = function () {
        !Ne || !he(global.process) || (Ne = !1, Be.forEach((r) => {
          try { F.removeListener(r, Xr[r]) }
          catch {}
        }), F.emit = Qr, F.reallyExit = In, P.count -= 1)
      }, Ue.exports.unload = Zr, ye = function (r, t, n) { P.emitted[r] || (P.emitted[r] = !0, P.emit(r, t, n)) }, Xr = {}, Be.forEach((e) => { Xr[e] = function () { if (he(global.process)) { const t = F.listeners(e); t.length === P.count && (Zr(), ye('exit', null, e), ye('afterexit', null, e), ba && e === 'SIGHUP' && (e = 'SIGINT'), F.kill(F.pid, e)) } } }), Ue.exports.signals = function () { return Be }, Ne = !1, Fn = function () {
        Ne || !he(global.process) || (Ne = !0, P.count += 1, Be = Be.filter((r) => {
          try { return F.on(r, Xr[r]), !0 }
          catch { return !1 }
        }), F.emit = Ta, F.reallyExit = Ca)
      }, Ue.exports.load = Fn, In = F.reallyExit, Ca = function (r) { he(global.process) && (F.exitCode = r || 0, ye('exit', F.exitCode, null), ye('afterexit', F.exitCode, null), In.call(F, F.exitCode)) }, Qr = F.emit, Ta = function (r, t) {
        if (r === 'exit' && he(global.process)) { t !== void 0 && (F.exitCode = t); const n = Qr.apply(this, arguments); return ye('exit', F.exitCode, null), ye('afterexit', F.exitCode, null), n }
        else { return Qr.apply(this, arguments) }
      })
    : Ue.exports = function () { return function () {} }; let Ea, Be, ba, lr, P, Zr, ye, Xr, Ne, Fn, In, Ca, Qr, Ta
}); const Ia = m((Yg, Fa) => {
  'use strict'; const ch = require('node:os'); const lh = Aa(); const fh = 1e3 * 5; const dh = (e, r = 'SIGTERM', t = {}) => { const n = e(r); return ph(e, r, t, n), n }; var ph = (e, r, t, n) => {
    if (!mh(r, t, n))
      return; const i = yh(t); const o = setTimeout(() => { e('SIGKILL') }, i); o.unref && o.unref()
  }; var mh = (e, { forceKillAfterTimeout: r }, t) => hh(e) && r !== !1 && t; var hh = e => e === ch.constants.signals.SIGTERM || typeof e == 'string' && e.toUpperCase() === 'SIGTERM'; var yh = ({ forceKillAfterTimeout: e = !0 }) => {
    if (e === !0)
      return fh; if (!Number.isFinite(e) || e < 0)
      throw new TypeError(`Expected the \`forceKillAfterTimeout\` option to be a non-negative integer, got \`${e}\` (${typeof e})`); return e
  }; const gh = (e, r) => { e.kill() && (r.isCanceled = !0) }; const wh = (e, r, t) => { e.kill(r), t(Object.assign(new Error('Timed out'), { timedOut: !0, signal: r })) }; const vh = (e, { timeout: r, killSignal: t = 'SIGTERM' }, n) => {
    if (r === 0 || r === void 0)
      return n; let i; const o = new Promise((u, a) => { i = setTimeout(() => { wh(e, t, a) }, r) }); const s = n.finally(() => { clearTimeout(i) }); return Promise.race([o, s])
  }; const xh = ({ timeout: e }) => {
    if (e !== void 0 && (!Number.isFinite(e) || e < 0))
      throw new TypeError(`Expected the \`timeout\` option to be a non-negative integer, got \`${e}\` (${typeof e})`)
  }; const Sh = async (e, { cleanup: r, detached: t }, n) => {
    if (!r || t)
      return n; const i = lh(() => { e.kill() }); return n.finally(() => { i() })
  }; Fa.exports = { spawnedKill: dh, spawnedCancel: gh, setupTimeout: vh, validateTimeout: xh, setExitHandler: Sh }
}); const La = m((Vg, ka) => { 'use strict'; const X = e => e !== null && typeof e == 'object' && typeof e.pipe == 'function'; X.writable = e => X(e) && e.writable !== !1 && typeof e._write == 'function' && typeof e._writableState == 'object'; X.readable = e => X(e) && e.readable !== !1 && typeof e._read == 'function' && typeof e._readableState == 'object'; X.duplex = e => X.writable(e) && X.readable(e); X.transform = e => X.duplex(e) && typeof e._transform == 'function'; ka.exports = X }); const _a = m((zg, Oa) => { 'use strict'; const { PassThrough: Eh } = require('node:stream'); Oa.exports = (e) => { e = { ...e }; const { array: r } = e; let { encoding: t } = e; const n = t === 'buffer'; let i = !1; r ? i = !(t || n) : t = t || 'utf8', n && (t = null); const o = new Eh({ objectMode: i }); t && o.setEncoding(t); let s = 0; const u = []; return o.on('data', (a) => { u.push(a), i ? s = u.length : s += a.length }), o.getBufferedValue = () => r ? u : n ? Buffer.concat(u, s) : u.join(''), o.getBufferedLength = () => s, o } }); const Pa = m((Kg, fr) => {
  'use strict'; const { constants: bh } = require('node:buffer'); const Ch = require('node:stream'); const { promisify: Th } = require('node:util'); const Ah = _a(); const Fh = Th(Ch.pipeline); const et = class extends Error {constructor() { super('maxBuffer exceeded'), this.name = 'MaxBufferError' }}; async function kn(e, r) {
    if (!e)
      throw new Error('Expected a stream'); r = { maxBuffer: 1 / 0, ...r }; const { maxBuffer: t } = r; const n = Ah(r); return await new Promise((i, o) => {
      const s = (u) => { u && n.getBufferedLength() <= bh.MAX_LENGTH && (u.bufferedData = n.getBufferedValue()), o(u) }; (async () => {
        try { await Fh(e, n), i() }
        catch (u) { s(u) }
      })(), n.on('data', () => { n.getBufferedLength() > t && s(new et()) })
    }), n.getBufferedValue()
  }fr.exports = kn; fr.exports.buffer = (e, r) => kn(e, { ...r, encoding: 'buffer' }); fr.exports.array = (e, r) => kn(e, { ...r, array: !0 }); fr.exports.MaxBufferError = et
}); const Ba = m((Jg, Da) => { 'use strict'; const { PassThrough: Ih } = require('node:stream'); Da.exports = function () { let e = []; const r = new Ih({ objectMode: !0 }); return r.setMaxListeners(0), r.add = t, r.isEmpty = n, r.on('unpipe', i), Array.prototype.slice.call(arguments).forEach(t), r; function t(o) { return Array.isArray(o) ? (o.forEach(t), this) : (e.push(o), o.once('end', i.bind(null, o)), o.once('error', r.emit.bind(r, 'error')), o.pipe(r, { end: !1 }), this) } function n() { return e.length == 0 } function i(o) { e = e.filter((s) => { return s !== o }), !e.length && r.readable && r.end() } } }); const Ra = m((Zg, Ma) => {
  'use strict'; const Ua = La(); const Na = Pa(); const kh = Ba(); const Lh = (e, r) => { r === void 0 || e.stdin === void 0 || (Ua(r) ? r.pipe(e.stdin) : e.stdin.end(r)) }; const Oh = (e, { all: r }) => {
    if (!r || !e.stdout && !e.stderr)
      return; const t = kh(); return e.stdout && t.add(e.stdout), e.stderr && t.add(e.stderr), t
  }; const Ln = async (e, r) => {
    if (e) {
      e.destroy(); try { return await r }
      catch (t) { return t.bufferedData }
    }
  }; const On = (e, { encoding: r, buffer: t, maxBuffer: n }) => {
    if (!(!e || !t))
      return r ? Na(e, { encoding: r, maxBuffer: n }) : Na.buffer(e, { maxBuffer: n })
  }; const _h = async ({ stdout: e, stderr: r, all: t }, { encoding: n, buffer: i, maxBuffer: o }, s) => {
    const u = On(e, { encoding: n, buffer: i, maxBuffer: o }); const a = On(r, { encoding: n, buffer: i, maxBuffer: o }); const l = On(t, { encoding: n, buffer: i, maxBuffer: o * 2 }); try { return await Promise.all([s, u, a, l]) }
    catch (c) { return Promise.all([{ error: c, signal: c.signal, timedOut: c.timedOut }, Ln(e, u), Ln(r, a), Ln(t, l)]) }
  }; const Ph = ({ input: e }) => {
    if (Ua(e))
      throw new TypeError('The `input` option cannot be a stream in sync mode')
  }; Ma.exports = { handleInput: Lh, makeAllStream: Oh, getSpawnedResult: _h, validateInputSync: Ph }
}); const $a = m((Xg, qa) => { 'use strict'; const Dh = (async () => {})().constructor.prototype; const Bh = ['then', 'catch', 'finally'].map(e => [e, Reflect.getOwnPropertyDescriptor(Dh, e)]); const Nh = (e, r) => { for (const [t, n] of Bh) { const i = typeof r == 'function' ? (...o) => Reflect.apply(n.value, r(), o) : n.value.bind(r); Reflect.defineProperty(e, t, { ...n, value: i }) } return e }; const Uh = e => new Promise((r, t) => { e.on('exit', (n, i) => { r({ exitCode: n, signal: i }) }), e.on('error', (n) => { t(n) }), e.stdin && e.stdin.on('error', (n) => { t(n) }) }); qa.exports = { mergePromise: Nh, getSpawnedPromise: Uh } }); const Ha = m((Qg, Ga) => { 'use strict'; const ja = (e, r = []) => Array.isArray(r) ? [e, ...r] : [e]; const Mh = /^[\w.-]+$/; const Rh = /"/g; const qh = e => typeof e != 'string' || Mh.test(e) ? e : `"${e.replace(Rh, '\\"')}"`; const $h = (e, r) => ja(e, r).join(' '); const jh = (e, r) => ja(e, r).map(t => qh(t)).join(' '); const Gh = / +/g; const Hh = (e) => { const r = []; for (const t of e.trim().split(Gh)) { const n = r[r.length - 1]; n && n.endsWith('\\') ? r[r.length - 1] = `${n.slice(0, -1)} ${t}` : r.push(t) } return r }; Ga.exports = { joinCommand: $h, getEscapedCommand: jh, parseCommand: Hh } }); const Za = m((ew, Me) => {
  'use strict'; const Wh = require('node:path'); const _n = require('node:child_process'); const Yh = ra(); const Vh = na(); const zh = sa(); const Kh = la(); const rt = wa(); const Ya = xa(); const { spawnedKill: Jh, spawnedCancel: Zh, setupTimeout: Xh, validateTimeout: Qh, setExitHandler: e0 } = Ia(); const { handleInput: r0, getSpawnedResult: t0, makeAllStream: n0, validateInputSync: i0 } = Ra(); const { mergePromise: Wa, getSpawnedPromise: o0 } = $a(); const { joinCommand: Va, parseCommand: za, getEscapedCommand: Ka } = Ha(); const s0 = 1e3 * 1e3 * 100; const u0 = ({ env: e, extendEnv: r, preferLocal: t, localDir: n, execPath: i }) => { const o = r ? { ...process.env, ...e } : e; return t ? zh.env({ env: o, cwd: n, execPath: i }) : o }; const Ja = (e, r, t = {}) => { const n = Yh._parse(e, r, t); return e = n.command, r = n.args, t = n.options, t = { maxBuffer: s0, buffer: !0, stripFinalNewline: !0, extendEnv: !0, preferLocal: !1, localDir: t.cwd || process.cwd(), execPath: process.execPath, encoding: 'utf8', reject: !0, cleanup: !0, all: !1, windowsHide: !0, ...t }, t.env = u0(t), t.stdio = Ya(t), process.platform === 'win32' && Wh.basename(e, '.exe') === 'cmd' && r.unshift('/q'), { file: e, args: r, options: t, parsed: n } }; const dr = (e, r, t) => typeof r != 'string' && !Buffer.isBuffer(r) ? t === void 0 ? void 0 : '' : e.stripFinalNewline ? Vh(r) : r; const tt = (e, r, t) => {
    const n = Ja(e, r, t); const i = Va(e, r); const o = Ka(e, r); Qh(n.options); let s; try { s = _n.spawn(n.file, n.args, n.options) }
    catch (d) { const h = new _n.ChildProcess(); const y = Promise.reject(rt({ error: d, stdout: '', stderr: '', all: '', command: i, escapedCommand: o, parsed: n, timedOut: !1, isCanceled: !1, killed: !1 })); return Wa(h, y) } const u = o0(s); const a = Xh(s, n.options, u); const l = e0(s, n.options, a); const c = { isCanceled: !1 }; s.kill = Jh.bind(null, s.kill.bind(s)), s.cancel = Zh.bind(null, s, c); const p = Kh(async () => {
      const [{ error: d, exitCode: h, signal: y, timedOut: g }, x, v, D] = await t0(s, n.options, l); const re = dr(n.options, x); const je = dr(n.options, v); const Ge = dr(n.options, D); if (d || h !== 0 || y !== null) {
        const yr = rt({ error: d, exitCode: h, signal: y, stdout: re, stderr: je, all: Ge, command: i, escapedCommand: o, parsed: n, timedOut: g, isCanceled: c.isCanceled, killed: s.killed }); if (!n.options.reject)
          return yr; throw yr
      } return { command: i, escapedCommand: o, exitCode: 0, stdout: re, stderr: je, all: Ge, failed: !1, timedOut: !1, isCanceled: !1, killed: !1 }
    }); return r0(s, n.options.input), s.all = n0(s, n.options), Wa(s, p)
  }; Me.exports = tt; Me.exports.sync = (e, r, t) => {
    const n = Ja(e, r, t); const i = Va(e, r); const o = Ka(e, r); i0(n.options); let s; try { s = _n.spawnSync(n.file, n.args, n.options) }
    catch (l) { throw rt({ error: l, stdout: '', stderr: '', all: '', command: i, escapedCommand: o, parsed: n, timedOut: !1, isCanceled: !1, killed: !1 }) } const u = dr(n.options, s.stdout, s.error); const a = dr(n.options, s.stderr, s.error); if (s.error || s.status !== 0 || s.signal !== null) {
      const l = rt({ stdout: u, stderr: a, error: s.error, signal: s.signal, exitCode: s.status, command: i, escapedCommand: o, parsed: n, timedOut: s.error && s.error.code === 'ETIMEDOUT', isCanceled: !1, killed: s.signal !== null }); if (!n.options.reject)
        return l; throw l
    } return { command: i, escapedCommand: o, exitCode: 0, stdout: u, stderr: a, failed: !1, timedOut: !1, isCanceled: !1, killed: !1 }
  }; Me.exports.command = (e, r) => { const [t, ...n] = za(e); return tt(t, n, r) }; Me.exports.commandSync = (e, r) => { const [t, ...n] = za(e); return tt.sync(t, n, r) }; Me.exports.node = (e, r, t = {}) => { r && !Array.isArray(r) && typeof r == 'object' && (t = r, r = []); const n = Ya.node(t); const i = process.execArgv.filter(u => !u.startsWith('--inspect')); const { nodePath: o = process.execPath, nodeOptions: s = i } = t; return tt(o, [...s, e, ...Array.isArray(r) ? r : []], { ...t, stdin: void 0, stdout: void 0, stderr: void 0, stdio: n, shell: !1 }) }
}); const Lc = require('node:fs'); const mt = we(require('node:process'), 1); const rc = require('node:child_process'); const tc = require('node:fs/promises'); const nc = require('node:path'); const ic = require('node:fs'); const qe = we(require('node:process'), 1); const oc = require('esbuild')

const sc = we(mu(), 1)

const Xa = we(Za(), 1); async function Qa(e) {
  if (process.platform !== 'darwin')
    throw new Error('macOS only'); const { stdout: r } = await (0, Xa.default)('osascript', ['-e', e]); return r
} function Re(e) {
  if (typeof e != 'string')
    throw new TypeError(`Expected a string, got ${typeof e}`); return e.replace(/[\\"]/g, '\\$&')
} async function Pn({ title: e = '', text: r = '', subtitle: t = '', sound: n } = {}) {
  if (process.platform !== 'darwin')
    throw new Error('macOS only'); if (!e && !r)
    throw new Error('`title` or `text` required'); let i = `display notification "${Re(r)}" with title "${Re(e)}" subtitle "${Re(t)}"`; typeof n == 'string' && (i += ` sound name "${Re(n)}"`), await Qa(i)
} const ec = ['fs', 'fsevents', 'notifier', 'node-notifier', 'esbuild', 'lightningcss']; async function uc(e) {
  const r = [(0, sc.yamlPlugin)({})]; if (!e.build) {
    const a = setInterval(() => {}, 1e3); let l; let c; let f; Object.keys({ SIGHUP: 1, SIGINT: 2, SIGTERM: 15 }).forEach((y) => {
      qe.default.on(y, () => {
        c || (console.log(`

Zerva: Received a ${y} signal`), d().then(() => { a && (a.unref(), clearInterval(a)) }).catch((g) => { console.error('Zerva: Exit error', g) }))
      })
    }); async function d() {
      c
        ? await c
        : l && (c = new Promise(y => f = y), e.debug && console.log('Zerva: Will stop node process'), l.kill('SIGTERM'), await c, e.debug
          ? console.log(`Zerva: Did stop node process
`)
          : console.log(`Zerva: Stopped app
`)), c = void 0
    } async function h() {
      await d(); const y = qe.default.cwd(); let g = qe.default.execPath; let x = ['--enable-source-maps', ...e.node, e.outfile]; e.bun ? (g = 'bun', x = ['run', e.outfile]) : e.deno && (g = 'deno', x = ['run', '--allow-read', '--allow-write=./', '--allow-env', e.outfile]), e.debug && console.info(`Zerva: Spawn ${g} in ${y} with args:`, x), l = (0, rc.spawn)(g, x, { cwd: y, stdio: 'inherit', detached: !0, shell: !1, killSignal: 'SIGKILL', env: { ...qe.default.env, ZERVA_MODE: 'development', ZERVA_VERSION: e.version } }), console.info(`
Zerva: Starting app`), l.on('error', (v) => { console.error('Zerva: Node process error:', v) }), l.on('close', (v) => { console.info('Zerva: Node process exits with code:', v), f && f(v ?? 0), l = void 0 })
    }r.push({ name: 'zerva-rebuild', setup(y) {
      y.onStart(d), y.onEnd((g) => {
        if (g.errors?.length > 0) { console.log(`build ended with ${g.errors.length} errors`), t(g.errors?.[0]); return } try { (0, ic.chmodSync)(e.outfile, 493) }
        catch {}h()
      }), y.onDispose(d)
    } })
  } async function t(a) {
    try { e.build || await Pn({ subtitle: 'Zerva Build Error', text: a?.text ?? 'Error', sound: 'Bottle' }) }
    catch {}
  } function n(a) { const l = (0, nc.normalize)(a); const c = qe.default.env.HOME; return c && l.startsWith(c) ? `~${l.slice(c.length)}` : l }console.info(`Zerva: Building from "${n(e.entry)}"`); let i = `/*  Generated by Zerva <https://github.com/holtwick/zerva> */
`;e.esm && (i += `
// Fix for ESM issues, see https://github.com/evanw/esbuild/issues/1921#issuecomment-1720348876
const require = (await import("node:module")).createRequire(import.meta.url)
const __filename = (await import("node:url")).fileURLToPath(import.meta.url)
const __dirname = (await import("node:path")).dirname(__filename)`); const o = { bundle: !0, platform: 'node', target: 'node18', format: e.esm ? 'esm' : 'cjs', entryPoints: [e.entry], legalComments: 'none', outfile: e.outfile, metafile: e.metafile, sourcemap: !e.build || e.sourcemap, jsxFactory: 'h', loader: { '.json': 'json', ...e.loader }, plugins: r, banner: { js: i }, define: { 'ZERVA_DEVELOPMENT': String(!e.build), 'ZERVA_PRODUCTION': String(e.build), 'ZERVA_VERSION': `"${e.version}"`, 'process.env.ZERVA_DEVELOPMENT': String(!e.build), 'process.env.ZERVA_PRODUCTION': String(e.build), 'process.env.ZERVA_VERSION': `"${e.version}"`, ...e.define }, minify: e.build, external: e.build ? [...ec, ...e.external] : [...ec, 'vite', ...e.external], ...e.esbuild }; e.debug && console.log('build =', o); const s = await (0, oc.context)(o); if (!e.build) { console.info('Zerva: Watching...'), await s.watch(); return }s.rebuild().then(async (a) => {
    try { await (0, tc.chmod)(e.outfile, 493) }
    catch {}console.info(`Zerva: Building to "${n(e.outfile)}" succeeded.`), await s.dispose()
  }).catch((a) => { t(a) })
} const Ic = require('node:fs'); const ge = require('node:path'); const hr = we(require('node:process'), 1)

function Mn(e) { return e.length > 0 && (/^[A-Z0-9_\-\ ]*$/g.test(e) && (e = e.toLowerCase()), e = e.replace(/^[-_\ ]+/gi, '').replace(/[-_\ ]+$/gi, '').replace(/[-_\ ]+([a-z0-9])/gi, (r, t) => t.toUpperCase()), e = e[0].toLowerCase() + e.substring(1)), e } const wc = we(require('node:process'), 1)

function Rn(e = {}) {
  const { args: r = wc.default.argv.slice(1), alias: t = {}, normalize: n = Mn, booleanArgs: i = [], listArgs: o = [], numberArgs: s = [] } = e; const u = Object.entries(t).reduce((p, d) => { let [h, y] = d; typeof y == 'string' && (y = [y]); for (const g of y)p[n(g)] = n(h); return p }, {}); const a = { _: [] }; function l(p, d) { a[p] == null || typeof a[p] == 'boolean' ? a[p] = d : Array.isArray(a[p]) ? a[p].push(d) : a[p] = [a[p], d] } const c = [...r]; let f; for (;f = c.shift();) {
    let p; if (/^--?/.test(f)) { let d = f.replace(/^--?/, ''); if (f.includes('=')) { const [h, y] = d.split('=', 2); d = h.trim(), p = y.trim() }d = n(d), d = u[d] ?? d, i.includes(d) ? l(d, !0) : (p = p ?? c.shift() ?? '', s.includes(d) && (p = Number(p ?? 0)), o.includes(d) ? Array.isArray(a[d]) ? a[d].push(p) : a[d] = [p] : l(d, p)) }
    else { a._.push(f) }
  } return a
} function ct(e, r) { if (e && Array.isArray(e)) { let t; for (;(t = e.indexOf(r)) !== -1;)e.splice(t, 1); return e } return [] } const Fc = ['zerva.ts', 'zerva.js', 'zerva/main.ts', 'zerva/main.js', 'src/zerva.ts', 'src/zerva.js', 'zerva/index.ts', 'zerva/index.js', 'service.ts', 'service.js', 'service/main.ts', 'service/main.js', 'src/service.ts', 'src/service.js', 'service/index.ts', 'service/index.js', 'index.ts', 'index.js', 'main.ts', 'main.js', 'src/main.ts', 'src/main.js', 'src/index.ts', 'src/index.js']; function kc() {
  const e = { build: !1, bun: !1, deno: !1, help: !1, esm: !0, cjs: !1, version: '', metafile: !0, sourcemap: !0, debug: !1, open: !1, external: [], define: {}, loader: {}, esbuild: {}, node: [], args: {} }; try { const n = require((0, ge.resolve)(hr.default.cwd(), 'package.json')); e.version = n.version }
  catch {} try { const n = require((0, ge.resolve)(hr.default.cwd(), 'zerva.conf.js')); n && Object.assign(e, n) }
  catch {} const r = Rn({ args: hr.default.argv.slice(2), alias: { build: ['b'], debug: ['d'], esm: ['e'], help: ['h', '?'] }, booleanArgs: ['build', 'noSourcemap', 'debug', 'help', 'esm', 'cjs', 'bun', 'deno'], listArgs: ['external', 'loader', 'define', 'esbuild', 'node', 'lightningcss'] }); e.debug = !!r.debug, e.args = r, e.help = r.help, e.sourcemap = !r.noSourcemap, e.metafile = !r.metafile, e.external = r.external ?? [], e.node = r.node ?? [], e.build = r.build ?? r._.includes('build'), e.esm = r.cjs !== !0, e.bun = r.bun, e.deno = r.deno, e.loader = Object.fromEntries((r.loader ?? []).map(n => n.split(':', 2))), e.define = Object.fromEntries((r.define ?? []).map(n => n.split(':', 2))), e.esbuild = Object.fromEntries((r.esbuild ?? []).map(n => n.split(':', 2))), e.debug && console.log('argv =', hr.default.argv), r._ = ct(r._, 'build'); const t = e.esm ? 'mjs' : 'cjs'; if (e.build ? (e.outfile = r.outfile ?? (0, ge.resolve)(`dist/main.${t}`), e.build = !0) : (e.outfile = r.outfile ?? (0, ge.resolve)(`.out.${t}`), e.sourcemap = !0), r._.length > 0)
    e.entry = (0, ge.resolve)(r._[0]); else for (const n of Fc) if ((0, Ic.existsSync)((0, ge.resolve)(n))) { e.entry = n; break } return e.debug && console.log('config =', e), e
} async function ay() {
  const e = kc(); if (e.help) {
    console.info(`usage: ${mt.default.argv?.[1]?.trim()?.toLocaleLowerCase() || ''} [options] <entryFile>

Node:    ${mt.default.argv?.[0] ?? '-'}
Version: ${e.version}

If started without arguments, the entry file is searched in default locations and the
debug server will be started. The files will be watched for changes and the debug server
is restarted on every update.

--build, -b         Build, else run debug server
--outfile, -o       Target file
--cjs               Build CJS, default is ESM
--open, -s          Open browser
--no-sourcemap      Do not emit source maps
--external=name     Exclude package from bundle (see esbuild)      
--loader=.suf:type  Loaders for file types (see esbuild)     
--define=key:value  Text replacement before compiling (see esbuild)
--esbuild=key:value Additional esbuild configs
--node=arg          Command line argument to be added to node execution
--bun               Execute with bun.sh
--deno              Execute with deno.com
`); return
  }(!e.entry || !(0, Lc.existsSync)(e.entry)) && (console.error(`Zerva: Cannot find entry file: ${e.entry}`), mt.default.exit(1)), await uc(e)
}ay()
