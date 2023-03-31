<template>
  <div class="editor-block" :style="blockStyles" ref="blockRef">
    <RenderComponent />
  </div>
</template>

<script setup>
// @ts-nocheck

import { defineProps, computed, inject, onMounted, ref } from "vue";

const props = defineProps({
  block: {
    type: Object,
  },
});

const blockStyles = computed(() => ({
  top: `${props.block?.top}px`,
  left: `${props.block?.left}px`,
  zIndex: props.block?.zIndex,
}));

const config = inject("config");
const component = config.componentMap[props.block?.key];
const RenderComponent = component.render();

const blockRef = ref(null);
// 让拖拽的元素居中
onMounted(() => {
  let { offsetWidth, offsetHeight } = blockRef.value;
  if (props.block.alignCenter) {
    props.block.left = props.block.left - offsetWidth / 2;
    props.block.top = props.block.top - offsetHeight / 2;
    props.block.alignCenter = false; // 让渲染后的结果才能去居中
  }
  props.block.width = offsetWidth;
  props.block.height = offsetHeight;
});
</script>

<style lang="scss" scoped>
.editor-block {
  position: absolute;
}
</style>
