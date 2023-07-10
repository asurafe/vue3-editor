import EditorTable from "../editor-table"
import { ElColorPicker, ElInput, ElOption, ElSelect } from "element-plus"


export function useComponentRender() {
  return {
    input: (state,propName,propsConfig) => <ElInput v-model={state.editData.props[propName]}></ElInput>,
    color: (state,propName,propsConfig) => <ElColorPicker v-model={state.editData.props[propName]}></ElColorPicker>,
    select: (state,propName,propsConfig) => <ElSelect v-model={state.editData.props[propName]}>
      {
        propsConfig.options.map(opt => {
          return <ElOption label={opt.label} value={opt.value}></ElOption>
        })
      }
    </ElSelect>,
    table: (state,propName,propsConfig) => <EditorTable propsConfig={propsConfig} v-model={state.editData.props[propName]}></EditorTable>
  }
}