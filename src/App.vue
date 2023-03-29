<template>
  <div class="app">
    <Editor v-model="state" />
  </div>
</template>

<script setup>
import data from "./data.json";
import { provide, ref } from "vue";
import Editor from "./packages/editor.vue";
import {registerConfig as config} from './utils/editor.config'

const state = ref(data);

provide('config',config)

</script>

<style scoped lang="less">
.app {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
}
</style>
