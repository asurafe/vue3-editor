import "./index.scss"
import { defineComponent, inject, reactive, watch } from "vue" 
import { ElButton, ElForm, ElFormItem, ElInput } from "element-plus"
import deepcopy from "deepcopy"
import { useComponentRender } from "./use-component-render"

export default defineComponent({
  name: "EditorOperator",
  props: {
    block: {
      type: Object,
      require: true
    },
    data: {
      type: Object
    },
    updateContainer: {
      type: Function
    },
    updateBlockComponent: {
      type: Function
    }
  },
  setup(props,ctx) {
    const config = inject("config")
    const state = reactive({
      editData: {}
    })
    const reset = () => {
      if(!props.block) {
        state.editData = deepcopy(props.data.container)
      } else {
        state.editData = deepcopy(props.block)
      }
    }
    const apply = () => {
      if(!props.block) {
        props.updateContainer({...props.data,container: state.editData})
      } else {
        props.updateBlockComponent(state.editData,props.block)
      }
    }
    watch(() => props.block,reset,{immediate: true})

    const containerRender = <>
      <ElFormItem label="容器宽度">
        <ElInput v-model={state.editData.width}></ElInput>
      </ElFormItem>
      <ElFormItem label="容器高度">
        <ElInput v-model={state.editData.height}></ElInput>
      </ElFormItem>
    </>
    const componentRender = useComponentRender()

    return () => {
      const content = []
      if(!props.block) {
        content.push(containerRender)
      } else {
        const component = config.componentMap[props.block.key]
        if(component && component.props) {
          content.push(Object.entries(component.props).map(([propName,propsConfig]) => {
            return <ElFormItem label={propsConfig.label}>
              {
                componentRender[propsConfig.type](state,propName,propsConfig)
              }
            </ElFormItem>
          }))
        }

        if(component && component.model) {
         content.push(Object.entries(component.model).map(([modelName,label]) => {
           return <ElFormItem label={label}>
             <ElInput v-model={state.editData.model[modelName]}></ElInput>
           </ElFormItem>
         }))
        }
      }
      
      return <div class="editor-operator">
        <ElForm labelPosition="top">
          { content }
          <ElFormItem>
            <ElButton type="primary" onClick={apply}>保存</ElButton>
            <ElButton onClick={reset}>重置</ElButton>
          </ElFormItem>
        </ElForm>
      </div>
    }
  }
})