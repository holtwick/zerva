<script setup lang="ts">
import { onMounted } from 'vue'
import { Logger } from 'zeed'
import { counter, rpc } from './hub'

const log = Logger('app')
log('app')

onMounted(async () => {
  const v = await rpc.helloIAmNew(navigator.userAgent)
  log('received', v)
})
</script>

<template>
  <div>
    <h1>zerva-rpc demo</h1>
    <pre>counter = {{ counter }}</pre>
  </div>
</template>
