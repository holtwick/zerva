import {
  L as h,
  C as g,
  i as w,
  g as f,
  e as v,
  d as y,
  a as p,
  r as l,
  c as b,
  b as r,
  t as u,
  u as d,
  o as T,
  f as _,
} from "./vendor.72830e7c.js"
const C = function () {
  const s = document.createElement("link").relList
  if (s && s.supports && s.supports("modulepreload")) return
  for (const e of document.querySelectorAll('link[rel="modulepreload"]')) o(e)
  new MutationObserver((e) => {
    for (const t of e)
      if (t.type === "childList")
        for (const c of t.addedNodes)
          c.tagName === "LINK" && c.rel === "modulepreload" && o(c)
  }).observe(document, { childList: !0, subtree: !0 })
  function n(e) {
    const t = {}
    return (
      e.integrity && (t.integrity = e.integrity),
      e.referrerpolicy && (t.referrerPolicy = e.referrerpolicy),
      e.crossorigin === "use-credentials"
        ? (t.credentials = "include")
        : e.crossorigin === "anonymous"
        ? (t.credentials = "omit")
        : (t.credentials = "same-origin"),
      t
    )
  }
  function o(e) {
    if (e.ep) return
    e.ep = !0
    const t = n(e)
    fetch(e.href, t)
  }
}
C()
var m = "/zerva-websocket",
  L = new Uint8Array([9]),
  R = new Uint8Array([10]),
  S = 0,
  k = 1,
  M = (i = m) => `ws${location.protocol.substr(4)}//${location.host}${i}`
h("channel")
var a = h("websocket"),
  $ = 1200,
  E = 2500,
  B = 3e4,
  x = class extends g {
    constructor(i, s = {}) {
      super()
      ;(this.shouldConnect = !0),
        (this.isConnected = !1),
        (this.lastMessageReceived = 0),
        (this.unsuccessfulReconnects = 0),
        (this.pingCount = 0)
      var n, o
      let e = (n = s.path) != null ? n : m
      e.startsWith("/") || (e = `/${e}`),
        (this.opt = s),
        (this.debug = (o = s.debug) != null ? o : !1),
        (this.url = i != null ? i : M(e)),
        w()
          ? (window.addEventListener("beforeunload", () => this.disconnect()),
            window.addEventListener("focus", () => this.ping()))
          : typeof process != "undefined" &&
            process.on("exit", () => this.disconnect()),
        this._connect()
    }
    postMessage(i) {
      var s, n
      if (
        this.ws &&
        (this.ws.readyState != null
          ? this.ws.readyState === S || this.ws.readyState === k
          : !0)
      )
        try {
          this.ws.send(i)
          return
        } catch (o) {
          a.warn(`send failed with error=${String(o)}`)
        }
      else
        a.warn(
          `connection state issue, readyState=${
            (s = this.ws) == null ? void 0 : s.readyState
          }`
        )
      ;(n = this.ws) == null || n.close(), this._connect()
    }
    ping() {
      a("ping ->"), this.postMessage(L)
    }
    disconnect() {
      var i
      a("disconnect"),
        clearTimeout(this.pingTimeout),
        clearTimeout(this.reconnectTimout),
        (this.shouldConnect = !1),
        this.ws != null &&
          ((i = this.ws) == null || i.close(), (this.ws = void 0))
    }
    dispose() {
      this.disconnect()
    }
    close() {
      this.disconnect()
    }
    _connect() {
      const {
        reconnectTimeoutBase: i = $,
        maxReconnectTimeout: s = E,
        messageReconnectTimeout: n = B,
      } = this.opt
      if (this.shouldConnect && this.ws == null) {
        a("=> connect", this.url, this.unsuccessfulReconnects)
        const o = new WebSocket(this.url)
        ;(this.ws = o),
          (this.ws.binaryType = "arraybuffer"),
          (this.isConnected = !1),
          o.addEventListener("message", (t) => {
            a("onmessage", typeof t), (this.lastMessageReceived = f())
            const c = t.data
            clearTimeout(this.pingTimeout),
              v(c, R)
                ? (a("-> pong"),
                  this.pingCount++,
                  n > 0 &&
                    (this.pingTimeout = setTimeout(() => this.ping(), n / 2)))
                : this.emit("message", { data: c })
          })
        const e = (t) => {
          if ((clearTimeout(this.pingTimeout), this.ws != null)) {
            ;(this.ws = void 0),
              t ? a.warn("onclose with error") : a("onclose"),
              this.isConnected
                ? ((this.isConnected = !1), this.emit("disconnect"))
                : this.unsuccessfulReconnects++
            {
              const c = Math.min(
                Math.log10(this.unsuccessfulReconnects + 1) * i,
                s
              )
              ;(this.reconnectTimout = setTimeout(() => this._connect(), c)),
                a(`reconnect retry in ${c}ms`)
            }
          }
        }
        o.addEventListener("close", () => e()),
          o.addEventListener("error", (t) => e(t)),
          o.addEventListener("open", () => {
            a("onopen"),
              this.ws === o &&
                ((this.lastMessageReceived = f()),
                (this.isConnected = !0),
                (this.unsuccessfulReconnects = 0),
                n > 0 &&
                  (a(`schedule next ping in ${n / 2}ms`),
                  (this.pingTimeout = setTimeout(() => this.ping(), n / 2))),
                this.emit("connect"))
          })
      }
    }
    connect() {
      a("connect"),
        (this.shouldConnect = !0),
        !this.isConnected && this.ws == null && this._connect()
    }
  }
const F = r("h1", null, "zerva-websocket demo", -1),
  O = y({
    setup(i) {
      const s = p("app")
      s("app")
      let n = l(!1),
        o = l({}),
        e = l({})
      const t = new x()
      return (
        t.on("message", (c) => {
          ;(e.value = c.data), s("message", JSON.parse(c.data))
        }),
        t.on("disconnect", () => {
          s("channel disconnect"), (n.value = !1)
        }),
        t.on("close", () => {
          s("channel close"), (n.value = !1)
        }),
        t.on("connect", () => {
          s("channel connect"), (n.value = !0)
        }),
        (c, A) => (
          T(),
          b("div", null, [
            F,
            r("pre", null, "connected = " + u(d(n)), 1),
            r("pre", null, "directFeedback = " + u(d(o)), 1),
            r("pre", null, "pushedFeedback = " + u(d(e)), 1),
          ])
        )
      )
    },
  }),
  N = p("main")
N("app starts")
_(O).mount("#app")
