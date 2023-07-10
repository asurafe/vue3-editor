import "./index.scss"
import { computed, createVNode, defineComponent, reactive, render, renderSlot, onMounted, onBeforeUnmount, ref, inject, provide } from "vue"

export const DropdownItem = defineComponent({
  name: "DropdownItem",
  props: {

  },
  setup(props,ctx) {
    const slots = ctx.slots
    const hideDropdown = inject("hideDropdown")
    return () => <div class="dropdown-item" onClick={hideDropdown}>
      {
        slots.default()
      }
    </div>
  }
})

const DropdownComponent = defineComponent({
  name: "DropdownComponent",
  props: {
    option: {
      type: Object
    }
  },
  setup(props,ctx) {
    const dropdownRef = ref(null)
    const state = reactive({
      option: props.option,
      isShow: false,
      top: 0,
      left: 0
    })
    const updateOption = (option) => {
      state.option = option
      const { top,left,width,height } = option.el.getBoundingClientRect()
      state.top = top + height
      state.left = left
    }
    const showDropdown = () => {
      state.isShow = true
    }
    const hideDropdown = () => {
      state.isShow = false
    }
    provide("hideDropdown",hideDropdown)
    ctx.expose({
      updateOption,
      showDropdown,
      hideDropdown
    })
    const classes = computed(() => [
      "dropdown-component",
      {
        "dropdown-isShow": state.isShow
      }
    ])
    const style = computed(() => ({
      top: `${state.top}px`,
      left: `${state.left}px`
    }))
    const onMousedownDocument = (event) => {
      if(!dropdownRef.value.contains(event.target)) {
        state.isShow = false
      }
    }
    onMounted(() => {
      document.body.addEventListener("mousedown",onMousedownDocument,true)
    })
    onBeforeUnmount(() => {
      document.body.removeEventListener("mousedown",onMousedownDocument)
    }) 
    return () => {
      return <div ref={dropdownRef} class={classes.value} style={style.value}>
        {
          state.option.render()
        }
      </div>
    }
  }
})

let vnode
export function $dropdown$(option) {
  if(!vnode) {
    const el = document.createElement("div")
    vnode = createVNode(DropdownComponent,{option})
    render(vnode,el)
    document.body.appendChild(el)
  }
  const exposed = vnode.component.exposed
  exposed.updateOption(option)
  return exposed
}