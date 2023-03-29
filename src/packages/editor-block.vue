<template>
  <div class="editor-block" :style="blockStyles">
    <RenderComponent />
  </div>
</template>

<script setup>
import { defineProps, computed, inject } from "vue";

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

</script>

<style lang="scss" scoped>
.editor-block {
  position: absolute;
}
</style>
