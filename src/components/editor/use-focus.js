import { computed, ref } from "vue" 

export function useFocus(data,callback) {
  const selectIndex = ref(null)
  const lastSelectBlock = computed(() => {
    return data.value.blocks[selectIndex.value]
  })
  const focusData = computed(() => {
    const focus = []
    const unfocus = []
    data.value.blocks.forEach(block => {
      if(block.focus) {
        focus.push(block)
      } else {
        unfocus.push(block)
      }
    })
    return {
      focus,
      unfocus
    }
  })
  const clearBlockFocus = () => {
    data.value.blocks.forEach(block => block.focus = false)
  }
  const blockMousedown = (event,block,index) => {
    event.preventDefault()
    event.stopPropagation()
    if(!block.focus) {
      !event.shiftKey && clearBlockFocus()
      block.focus = true
    } else if(focusData.value.focus.length > 1){
      block.focus = false
    }
    selectIndex.value = index
    callback && callback(event)
  }
  const containerMousedown = () => {
    clearBlockFocus()
    selectIndex.value = null
  }
  return {
    focusData,
    lastSelectBlock,
    blockMousedown,
    containerMousedown,
    clearBlockFocus,
  }
}