<script setup lang="ts">
import { WebSocketConnection } from '@zerva/websocket'
import { ref } from 'vue'
import { jsonToUint8Array, Logger, Uint8ArrayToJson } from 'zeed'

const log = Logger('app')
log('app')

const connected = ref(false)
const directFeedback = ref({})
const pushedFeedback = ref({})

let counter = 0

const channel = new WebSocketConnection(undefined, { log: 0 })

if (true) {
  channel.on('message', (msg) => {
    pushedFeedback.value = msg.data
    log('message', Uint8ArrayToJson(msg.data))
  })

  channel.on('disconnect', () => {
    log('channel disconnect')
    connected.value = false
  })

  channel.on('close', () => {
    log('channel close')
    connected.value = false
  })

  channel.on('connect', () => {
    log('channel connect')
    connected.value = true
    // return
    counter++
    channel.postMessage(
      jsonToUint8Array({
        from: 'client',
        counter,
      }),
    )
  })

  // setInterval(() => {
  //   counter++
  //   channel.postMessage(
  //     JSON.stringify({
  //       from: "clientPing",
  //       counter,
  //     })
  //   )
  // }, 5000)

  // } else {
  //   // conn.on("serverPong", (data) => log("serverPong", data))
  //   // conn.emit("serverPing", { echo: uuid() }).then((r: any) => {
  //   //   log("pong", r)
  //   //   pong.value = r
  //   // })
  //   // useMessageHub({ channel }).listen<Messages>({
  //   //   viteEcho(data) {
  //   //     log("received", data)
  //   //     pushedFeedback.value = data
  //   //     return data
  //   //   },
  //   // })

  //   const msg = useMessageHub({ channel }).send<Messages>()
  //   channel.on("connect", () => {
  //     ++counter
  //     msg.viteEcho({ fromClient: counter }).then((data: any) => {
  //       log("viteEcho direct", data)
  //       directFeedback.value = data
  //     })
  //   })
}
</script>

<template>
  <div>
    <h1>zerva-websocket demo</h1>
    <pre>connected = {{ connected }}</pre>
    <pre>directFeedback = {{ directFeedback }}</pre>
    <pre>pushedFeedback = {{ pushedFeedback }}</pre>
  </div>
</template>
