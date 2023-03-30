<template>
  <div class="edtior">
    <!-- 左侧物料区 -->
    <div class="editor-left">
      <div
        class="editor-left-item"
        v-for="item in componentList"
        :draggable="true"
        @dragstart="(e) => dragstart(e, item)"
        @dragend="(e)=>{dragend(e)}"
      >
        <span>{{ item.label }}</span>
        <component :is="item.preview()"></component>
      </div>
    </div>
    <!-- 菜单栏 -->
    <div class="editor-top"></div>
    <!-- 属性控制栏目 -->
    <div class="editor-right"></div>
    <div class="editor-container">
      <!-- 产生滚动条 -->
      <div class="editor-container-canvas">
        <!-- 内容区 -->
        <div
          class="editor-container-canvas__content"
          ref="containerRef"
          :style="containerStyles"
        >
          <div v-for="item in data?.blocks">
            <EditorBlock :block="item"></EditorBlock>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// @ts-nocheck

import { defineProps, computed, inject, ref, defineEmits,onMounted } from "vue";
import EditorBlock from "./editor-block.vue";
import { useMenuDragger } from "./useMenuDragger";
import deepcopy from 'deepcopy'
const props = defineProps({
  modelValue: {
    type: Object,
  },
});
const emits = defineEmits(["update:modelValue"]);
const data = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    emits("update:modelValue", deepcopy(newValue) );
  },
});

const containerStyles = computed(() => ({
  width: data.value?.container.width + "px",
  height: data.value?.container.height + "px",
}));

const config = inject("config");
const componentList = config.componentList;

const containerRef = ref(null);

// 实现菜单的拖拽功能
const {dragstart,dragend} = useMenuDragger(containerRef,data)
</script>

<style lang="scss" scoped>
.editor {
  width: 100%;
  height: 100%;
  &-left,
  &-right {
    position: absolute;
    width: 270px;
    background-color: #f00;
    top: 0;
    bottom: 0;
  }
  &-left {
    left: 0;
    &-item {
      position: relative;
      width: 250px;
      margin: 20px auto;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #fff;
      padding: 20px;
      box-sizing: border-box;
      cursor: move;
      user-select: none;
      min-height: 100px;
      > span {
        position: absolute;
        top: 0;
        left: 0;
        background-color: rgb(96, 205, 224);
        color: #fff;
        padding: 4px;
      }
      &::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        opacity: 0.2;
      }
    }
  }
  &-right {
    right: 0;
  }
  &-top {
    position: absolute;
    left: 280px;
    right: 280px;
    height: 80px;
    background-color: blue;
  }
  &-container {
    padding: 80px 270px 0;
    height: 100%;
    box-sizing: border-box;
    &-canvas {
      height: 100%;
      overflow: scroll;
      &__content {
        margin: 20px auto;
        background-color: yellow;
        position: relative;
      }
    }
  }
}
</style>
