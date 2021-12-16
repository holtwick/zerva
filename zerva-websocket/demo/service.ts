import { useMessageHub } from "zeed"
import { Logger, useInterval } from "zeed"
import { on, serve, useHttp } from "zerva"
import { useVite } from "zerva-vite"
import { useWebSocket } from "zerva-websocket"
import { Messages } from "./src/protocol"

const log = Logger("service")

useHttp({ port: 8080 })

useWebSocket()

useVite({ root: "." })

let counter = 0

on("webSocketConnect", ({ channel }) => {
  log.info("connected")

  if (true) {
    channel.on("message", (msg) => {
      log.info("message", JSON.parse(msg.data))
    })

    return
    counter++
    channel.postMessage(
      JSON.stringify({
        from: "server",
        hello: "world",
        counter,
      })
    )

    let dispose = useInterval(() => {
      counter++
      channel.postMessage(
        JSON.stringify({
          from: "serverPing",
          counter,
        })
      )
    }, 5000)

    channel.on("close", dispose)
  } else {
    useMessageHub({
      channel,
    }).listen<Messages>({
      viteEcho(data) {
        log.info("viteEcho from server", data)
        ++counter
        // return { fromServer: counter }
      },
    })

    const msg = useMessageHub({
      channel,
    }).send<Messages>()

    ++counter
    msg.viteEcho({ pushCounter: counter })
  }
})

on("httpInit", ({ get, addStatic }) => {
  get("/zerva", `Hello, this is Zerva!`)
  get("/data.json", ({ req, res }) => {
    return { hello: "world" }
  })

  // This will be ignored
  addStatic("test", "test")
})

serve()
