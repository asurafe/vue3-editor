import "./index.scss"
import { ElButton, ElDialog, ElInput } from "element-plus";
import { createVNode, defineComponent, reactive, render } from "vue";
import { JsonViewer } from "vue3-json-viewer/dist/bundle.cjs";
import "vue3-json-viewer/dist/index.css"

const DialogComponent = defineComponent({
  name: "DialogComponent",
  props: {
    option: {
      type: Object
    }
  },
  setup(props,ctx) {
    const state = reactive({
      option: props.option,
      isShow: false
    })
    const updateOption = (option) => {
      state.option = option
    }
    const showDialog = () => {
      state.isShow = true
    }
    const hideDialog = () => {
      state.isShow = false
    }
    ctx.expose({
      updateOption,
      showDialog,
      hideDialog
    })
    const onCancel = () => {
      hideDialog()
    }
    const conConfirm = () => {
      state.option.onConfirm && state.option.onConfirm(state.option.content)
      hideDialog()
    }
    return () => {
      return <ElDialog v-model={state.isShow} title={state.option.title}>
        {
          {
            default: () => state.option.preview ?
            <JsonViewer value={state.option.content} expanded={true} expand-depth={5} copyable boxed></JsonViewer>
            :
            <ElInput type="textarea" v-model={state.option.content} rows={10}></ElInput>,
            footer: () => state.option.footer && <div>
              <ElButton onClick={onCancel}>取消</ElButton>
              <ElButton onClick={conConfirm} type="primary">确定</ElButton>
            </div>
          }
        }
      </ElDialog>
    }
  }
})
let vnode
export function $dialog$(option) {
  if(!vnode) {
    const el = document.createElement("div")
    vnode = createVNode(DialogComponent,{option})
    render(vnode,el)
    document.body.appendChild(el)
  }
  const exposed = vnode.component.exposed
  exposed.updateOption(option)
  return exposed
}