import "./index.scss"
import { defineComponent, computed, inject, ref, onMounted} from "vue" 
import BlockResize from "../block-resize"

export default defineComponent({
  name: "Block",
  props: {
    block: {
      type: Object,
      require: true
    },
    formData: {
      type: Object,
    },
  },
  setup(props) {

    const config = inject("config")
    const blockRef = ref(null)
    const blockStyle = computed(() => ({
      top: props.block.top,
      left: props.block.left,
      zIndex: props.block.zIndex
    }))

    onMounted(() => {
      const { offsetWidth,offsetHeight } = blockRef.value
      if(props.block.alignCenter) {
        props.block.top = `${parseFloat(props.block.top) - offsetHeight / 2}px`
        props.block.left = `${parseFloat(props.block.left) - offsetWidth / 2}px`
        props.block.alignCenter = false
      }
      props.block.width = `${offsetWidth}px`
      props.block.height = `${offsetHeight}px`
    })

    return () => {
      const component = config.componentMap[props.block.key]
      const RenderComponent = component.render({
        style: {
          width: props.block.isResize ? props.block.width : "",
          height: props.block.isResize ? props.block.height : "",
        },
        props: props.block.props,
        model: Object.keys(component.model || {}).reduce((prev,modelName) => {
          const propName = props.block.model[modelName]
          prev[modelName] = {
            modelValue: props.formData[propName],
            "onUpdate:modelValue": value => props.formData[propName] = value
          }
          return prev
        },{})
      })
      return <div ref={blockRef} class="editor-block" style={blockStyle.value}>
        {
          RenderComponent
        }
        {
          props.block.focus && component.resize && (
            <BlockResize
              block={props.block}
              component={component}
            ></BlockResize>
          )
        }
      </div>
    }
  }
})