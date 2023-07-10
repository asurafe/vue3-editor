import "./index.scss"
import { ElButton, ElDialog, ElInput } from "element-plus";
import { createVNode, defineComponent, reactive, render } from "vue";
import { ElTable } from "element-plus";
import deepcopy from "deepcopy";
import { ElTableColumn } from "element-plus";

const TableDialogComponent = defineComponent({
  name: "TableDialogComponent",
  props: {
    option: {
      type: Object
    }
  },
  setup(props,ctx) {
    const state = reactive({
      option: props.option,
      isShow: false,
      editData: []
    })
    const updateOption = (option) => {
      state.option = option
      state.editData = deepcopy(option.data)
    }
    const showTableDialog = () => {
      state.isShow = true
    }
    const hideTableDialog = () => {
      state.isShow = false
    }
    ctx.expose({
      updateOption,
      showTableDialog,
      hideTableDialog
    })
    const onCancel = () => {
      hideTableDialog()
    }
    const onConfirm = () => {
      state.option.onConfirm && state.option.onConfirm(state.editData)
      hideTableDialog()
    }
    const add = () => {
      state.editData.push({})
    }
    const del = (index) => {
      state.editData.splice(index,1)
    }
    const reset = () => {
      state.editData = []
    }
    return () => {
      return <ElDialog v-model={state.isShow} title={state.option.title}>
        {{
            default: () => <>
              <ElButton onClick={add}>添加</ElButton>
              <ElButton onClick={reset}>重置</ElButton>
              <ElTable
                data={state.editData}
              >
                <ElTableColumn type="index"></ElTableColumn>
                {
                  state.option.config.table.options.map((item,index) => {
                    return <ElTableColumn label={item.label}>
                      {{
                          default: ({row}) => <ElInput v-model={row[item.field]}></ElInput>
                      }}
                    </ElTableColumn>
                  })
                }
                <ElTableColumn label="操作">
                    {{
                      default: ({$index}) => <ElButton type="danger" onClick={() => del($index)}>删除</ElButton>
                    }}
                </ElTableColumn>
              </ElTable>
            </>,
            footer: () => <>
              <ElButton onClick={onCancel}>取消</ElButton>
              <ElButton onClick={onConfirm} type="primary">确定</ElButton>
            </>
        }}
      </ElDialog>
    }
  }
})
let vnode
export function $tableDialog$(option) {
  if(!vnode) {
    const el = document.createElement("div")
    vnode = createVNode(TableDialogComponent,{option})
    render(vnode,el)
    document.body.appendChild(el)
  }
  const exposed = vnode.component.exposed
  exposed.updateOption(option)
  return exposed
}