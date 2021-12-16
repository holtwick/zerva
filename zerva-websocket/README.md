# 🌱 Zerva WebSocket module

**This is a side project of [Zerva](https://github.com/holtwick/zerva)**

Plain resilient WebSocket connections with Zerva.

## Get started

```ts
import { useWebSocket } from "zerva-websocket"

useHttp({ port: 8080 })
useWebSocket()
```

## Communication

### Variant A: Channel

By establishing a connection you get a [Zeed Channel](https://github.com/holtwick/zeed/tree/master/src/common/msg#channel) to send raw string or binary data between server and client. The interfaces are the same for client and server side. On server side minimal code looks like this:

```ts
on("webSocketConnect", ({ channel }) => {
  channel.postMessage("Hello World")
  channel.on("message", (msg) => {
    console.log(msg.data)
  })
})
```

Client side like this:

```ts
const channel = new WebSocketConnection()
channel.on("connect", () => {
  channel.postMessage("Hello World")
})
channel.on("message", (msg) => {
  console.log(msg.data)
})
```

### Variant B: Message Interface

You can also use the [Zeed Message](https://github.com/holtwick/zeed/tree/master/src/common/msg#messages) overlay to have a convenient messaging infrastructure. First define the methods the server should listen to:

```ts
interface Messages {
  echo(msg: string): string
}
```

Then implement them in on the server side:

```ts
on("webSocketConnect", ({ channel }) => {
  useMessageHub({ channel }).listen<Messages>({
    echo(message) {
      return message
    },
  })
})
```

On the client side you may connect easily and call the messages:

```ts
const channel = new WebSocketConnection()
const send = useMessageHub({ channel }.send<Messages>()

let response = await send.echo("Hello World")
expect(response).toBe("Hello World")
```

### Variant C: PubSub Interface

Similar to Messages is the [PubSub](https://github.com/holtwick/zeed/tree/master/src/common/msg#pubsub) interface.

## Features

### Reconnection / Resilience

For a connection you always receive one Channel. This channel might be disconnected due to network issues, but once it reconnects you can continue to use the same Channel. You can check the state via `channel.isConnected`.

Both the client and the server try to stay connected and send ping/pong (heart beat) messages. On failure the client tries to reconnect. The Channel events `connect` and `disconnect` help to manage states in your app in case the connection is lost. You don't need to reconnect yourself.

### Encoding

Communication uses binary data. Encoding is usually provided by Message, PubSub and others using JSON. You can plug in any other encoding, e.g. crypto or compression.

## Alternatives

Similar projects:

- [Socket.io](https://socket.io/)
- [SocketCluster](https://socketcluster.io/)
- [SockJS](https://github.com/sockjs/sockjs-client)
