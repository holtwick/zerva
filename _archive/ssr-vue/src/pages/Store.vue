<script>
import { createStore } from 'vuex'

export default {
  async setup() {
    const store = createStore({
      state: {
        foo: 'bar',
      },
    })
    return store.state
  },
}
</script>

<template>
  <h1>{{ foo }}</h1>
</template>

<style scoped>
h1 {
  color: red;
}
</style>
