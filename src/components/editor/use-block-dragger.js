import { reactive } from "vue"
import { events } from "./events"

export function useBlockDragger(containerRef,focusData,lastSelectBlock) {
  let dragState
  const markline = reactive({
    x: null,
    y: null
  })
  const mousedown = (event) => {
    const block = lastSelectBlock.value
    const lsbLeft = parseFloat(block.left)
    const lsbTop = parseFloat(block.top)
    const lsbWidth = parseFloat(block.width)
    const lsbHeight = parseFloat(block.height)
    dragState = {
      dragging: false,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: lsbLeft,
      startTop: lsbTop,
      startPos: focusData.value.focus.map(({top,left}) => ({top,left})),
      lines: (() => {
        const { unfocus } = focusData.value
        const lines = { x: [], y: [] }
        const unfocusBlocks = [
          ...unfocus,
          {
            top: 0,
            left: 0,
            width: containerRef.value.offsetWidth,
            height: containerRef.value.offsetHeight
          }
        ]
        unfocusBlocks.forEach(block => {
          const top = parseFloat(block.top)
          const left = parseFloat(block.left)
          const width = parseFloat(block.width)
          const height = parseFloat(block.height)

          lines.y.push({ showTop: top,top })
          lines.y.push({ showTop: top,top: top - lsbHeight})
          lines.y.push({ showTop: top + height / 2,top: top + height / 2 - lsbHeight / 2 })
          lines.y.push({ showTop: top + height,top: top + height })
          lines.y.push({ showTop: top + height,top: top + height - lsbHeight })

          lines.x.push({ showLeft: left,left })
          lines.x.push({ showLeft: left + width,left: left + width})
          lines.x.push({ showLeft: left + width / 2,left: left + width / 2 - lsbWidth / 2 })
          lines.x.push({ showLeft: left + width,left: left + width - lsbWidth })
          lines.x.push({ showLeft: left,left: left - lsbWidth })
        })
        return lines
      })()
    }
    document.addEventListener("mousemove",mousemove)
    document.addEventListener("mouseup",mouseup)
  }
  const mousemove = (event) => {
    if(!dragState.dragging) {
      dragState.dragging = true
      events.emit("componentDragStart")
    }

    let { clientX,clientY } = event
    const { startX,startY,startLeft,startTop,lines } = dragState
    const lsbLeft = clientX - startX + startLeft
    const lsbTop = clientY - startY + startTop

    let x = null
    for(let i = 0; i < lines.x.length; i++) {
      const { showLeft,left } = lines.x[i]
      if(Math.abs(left - lsbLeft) < 5) {
        x = showLeft
        clientX = startX - startLeft + left
        break
      }
    }
    let y = null
    for(let i = 0; i < lines.y.length; i++) {
      const { showTop,top } = lines.y[i]
      if(Math.abs(top - lsbTop) < 5) {
        y = showTop
        clientY = startY - startTop + top
        break
      }
    }
    markline.x = x
    markline.y = y

    const durX = clientX - startX
    const durY = clientY - startY
    focusData.value.focus.map((block,index) => {
      block.top = `${parseFloat(dragState.startPos[index].top) + durY}px`
      block.left = `${parseFloat(dragState.startPos[index].left) + durX}px`
    })
  }
  const mouseup = (event) => {
    if(dragState.dragging) {
      events.emit("componentDragEnd")
    }
    document.removeEventListener("mousemove",mousemove)
    document.removeEventListener("mouseup",mouseup)
    markline.x = null
    markline.y = null
  }

  return {
    markline,
    mousedown,
  }
}