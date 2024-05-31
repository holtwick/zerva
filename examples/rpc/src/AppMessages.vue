<script lang="ts" setup>
import { onMounted } from 'vue'
import { Logger } from 'zeed'
import { useAppRpc } from './hub'

const log = Logger('app')
log('app')

const { counter, rpc } = useAppRpc()

onMounted(async () => {
  const v = await rpc.helloIAmNew(navigator.userAgent)
  log('received', v)
})
</script>

<template>
  <div class="AppMessages">
    <pre>counter = {{ counter }}</pre>
  </div>
</template>
