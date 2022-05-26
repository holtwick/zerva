import { on, serve } from "@zerva/core"
import { useHttp } from "@zerva/http"
import { useVite } from "@zerva/vite"
import { useWebSocket } from "@zerva/websocket"
import { Logger, useInterval } from "zeed"
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
    // useMessageHub({
    //   channel,
    // }).listen<Messages>({
    //   viteEcho(data) {
    //     log.info("viteEcho from server", data)
    //     ++counter
    //     // return { fromServer: counter }
    //   },
    // })
    // const msg = useMessageHub({
    //   channel,
    // }).send<Messages>()
    // ++counter
    // msg.viteEcho({ pushCounter: counter })
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
function useMessageHub(arg0: any) {
  throw new Error("Function not implemented.")
}
