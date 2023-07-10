import "./index.scss"
import { defineComponent } from "vue" 

export default defineComponent({
  name: "BlockResize",
  props: {
    block: {
      type: Object,
    },
    component: {
      type: Object
    }
  },
  setup(props,ctx) {
    const { width,height } =  props.component.resize || {}
    let data
    const onMousedown = (event,direction) => {
      event.stopPropagation()
      data = {
        startX: event.clientX,
        startY: event.clientY,
        startWidth: parseFloat(props.block.width),
        startHeight: parseFloat(props.block.height),
        startLeft: parseFloat(props.block.left),
        startTop: parseFloat(props.block.top),
        direction
      }
      document.body.addEventListener("mousemove",mousemove)
      document.body.addEventListener("mouseup",mouseup)
    }
    const mousemove = (event) => {
      let { clientX,clientY } = event
      const { startX,startY,startWidth,startHeight,startLeft,startTop,direction } = data
      if(direction.horizontal === "center") {
        clientX = startX
      }
      if(direction.vertical === "center") {
        clientY = startY
      }
      let durX = clientX - startX
      let durY = clientY - startY

      if(direction.vertical === "start") {
        durY = -durY
        props.block.top = `${startTop - durY}px`
      }
      if(direction.horizontal === "start") {
        durX = -durX
        props.block.left = `${startLeft - durX}px`
      }
      const width = startWidth + durX
      const height = startHeight + durY
      props.block.width = `${width}px`
      props.block.height = `${height}px`
      props.block.isResize = true
    }
    const mouseup = (event) => {
      document.body.removeEventListener("mousemove",mousemove)
      document.body.removeEventListener("mouseup",mouseup)
    }
    return () => {
      return <>
        {
          width && <>
            <div class="block-resize left" 
              onMousedown={event => onMousedown(event,{horizontal: "start",vertical: "center"})}
            ></div>
            <div class="block-resize right"
              onMousedown={event => onMousedown(event,{horizontal: "end",vertical: "center"})}
            ></div>
          </>
        }
        {
          height && <>
            <div class="block-resize top"
              onMousedown={event => onMousedown(event,{horizontal: "center",vertical: "start"})}
            ></div>
            <div class="block-resize bottom"
              onMousedown={event => onMousedown(event,{horizontal: "center",vertical: "end"})}            
            ></div>
          </>
        }
        {
          (width && height) && <>
            <div class="block-resize top-left"
              onMousedown={event => onMousedown(event,{horizontal: "start",vertical: "start"})}            
            ></div>
            <div class="block-resize top-right"
              onMousedown={event => onMousedown(event,{horizontal: "end",vertical: "start"})}            
            ></div>
            <div class="block-resize bottom-left"
              onMousedown={event => onMousedown(event,{horizontal: "start",vertical: "end"})}            
            ></div>
            <div class="block-resize bottom-right"
              onMousedown={event => onMousedown(event,{horizontal: "end",vertical: "end"})}            
            ></div>
          </>
        }
      </>
    }
  }
})