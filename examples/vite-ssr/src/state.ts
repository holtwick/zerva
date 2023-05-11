import { reactive } from 'vue'

export const state = reactive({
  counter: Math.floor(Math.random() * 1000),
})
