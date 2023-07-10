<script setup>
  import { ref } from "vue"
  import data from "./config/data.json"
  import { registerConfig } from "./config/editor-config.jsx"
  import Editor from "./components/editor"
  const state = ref(data)
  const formData = ref({
    userName: "用户名称",
    start: 0,
    end: 100,
  })
</script>

<template>
  <div class="app">
    <Editor v-model="state" :config="registerConfig" :formData="formData"></Editor>
  </div>
</template>

<style lang="scss">
  * {
    padding: 0;
    margin: 0;
  }
  .app {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
</style>
