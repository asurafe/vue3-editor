import "./index.scss"
import { defineComponent, computed } from "vue" 
import deepcopy from "deepcopy"
import { ElButton, ElTag } from "element-plus"
import { $tableDialog$ } from "../table-dialog"

export default defineComponent({
  name: "EditorTable",
  props: {
    propsConfig: {
      type: Object
    },
    modelValue: {
      type: Array
    }
  },
  emits: ["update:modelValue"],
  setup(props,ctx) {
    const data = computed({
      get() {
        return props.modelValue || []
      },
      set(newValue) {
        ctx.emit("update:modelValue",deepcopy(newValue))
      }
    })
    const add = () => {
      const tableDialog = $tableDialog$({
        title: "下拉选项",
        config: props.propsConfig,
        data: data.value,
        onConfirm(value) {
          data.value = value
        }
      })
      tableDialog.showTableDialog()
    }

    return () => {
      return <div class="editor-table">
        {
          (!data.value || data.value.length === 0) && <ElButton onClick={add}>添加</ElButton>
        }
        {
          (data.value || []).map(item => <ElTag onClick={add}>{item[props.propsConfig.table.key]}</ElTag>)
        }
      </div>
    }
  }
})