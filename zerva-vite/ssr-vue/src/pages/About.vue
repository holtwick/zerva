<template>
  <h1>{{ msg }}</h1>
  <p class="import-meta-url">{{ url }}</p>
</template>

<script>
export default {
  async setup() {
    const url = import.meta.env.SSR
      ? import.meta.url
      : document.querySelector(".import-meta-url").textContent
    return {
      msg: "About",
      url,
    }
  },
}
</script>

<style>
h1 {
  color: red;
}
</style>
