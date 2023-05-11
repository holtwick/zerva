<script setup lang="ts">
import { useHead } from '@vueuse/head'
import logo from '../assets/logo.png'
import { state } from '../state'
import { ClientOnly } from './ClientOnly'

const isClient = typeof window !== 'undefined'

useHead({
  title: 'Website Title',
  meta: [
    {
      name: 'description',
      content: 'Website description',
    },
  ],
})
</script>

<template>
  <h1>Hello World</h1>

  <ClientOnly> CLIENT ONLY </ClientOnly>

  <p>
    <a href="/sub">Sub Page</a>
  </p>

  <p>
    <router-link to="/sub">
      Sub Page via Vue
    </router-link>
  </p>

  <p>
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut tenetur
    accusantium dolorem distinctio, rem asperiores consequatur fugiat laborum
    cumque laudantium ullam quibusdam ad dolor facilis repellendus dolores
    suscipit exercitationem quidem.
  </p>

  <p>See <code>README.md</code> for more information.</p>

  <p>
    <a href="https://vitejs.dev/guide/features.html" target="_blank">
      Vite Docs
    </a>
    |
    <a href="https://v3.vuejs.org/" target="_blank">Vue 3 Docs</a>
  </p>

  <button type="button" @click="state.counter++">
    count is: {{ state.counter }}
  </button>
  <p>Static counter: {{ state.counter }}</p>
  <p>
    Edit
    <code>components/HelloWorld.vue</code> to test hot module replacement.
  </p>

  <img :src="logo">
</template>

<style>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
