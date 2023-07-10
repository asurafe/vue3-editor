import { events } from "./events"

export function useMenuDragger(containerRef,data) {

  let currentComponent = null

  const dragenter = (event) => {
    event.dataTransfer.dropEffect = "move"
  }
  const dragover = (event) => {
    event.preventDefault()
  }
  const dragleave = (event) => {
    event.dataTransfer.dropEffect = "none"
  }
  const drop = (event) => {
    const blocks = data.value.blocks
    data.value = {
      ...data.value,
      blocks: [
        ...blocks,
        {
          key: currentComponent.key,
          top: `${event.offsetY}px`,
          left: `${event.offsetX}px`,
          zIndex: 1,
          alignCenter: true,
          model: {

          },
          props: {
          }
        }
      ]
    }
    currentComponent = null
  }

  const dragstart = (event,component) => {
    containerRef.value.classList.add("hover")
    containerRef.value.addEventListener("dragenter",dragenter)
    containerRef.value.addEventListener("dragover",dragover)
    containerRef.value.addEventListener("dragleave",dragleave)
    containerRef.value.addEventListener("drop",drop)
    currentComponent = component
    events.emit("componentDragStart")
  }
  const dragend = (event) => {
    containerRef.value.classList.remove("hover")
    containerRef.value.removeEventListener("dragenter",dragenter)
    containerRef.value.removeEventListener("dragover",dragover)
    containerRef.value.removeEventListener("dragleave",dragleave)
    containerRef.value.removeEventListener("drop",drop)
    events.emit("componentDragEnd")
  }

  return {
    dragstart,
    dragend
  }
}