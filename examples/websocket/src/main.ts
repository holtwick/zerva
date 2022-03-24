import { Logger } from "zeed"
const log = Logger("main")

log("app starts")

import { createApp } from "vue"
import App from "./App.vue"

createApp(App).mount("#app")
