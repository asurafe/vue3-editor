import deepcopy from "deepcopy"
import { onUnmounted } from "vue"
import { $dialog$ } from "../dialog"
import { events } from "./events"

export function useCommand(data,focusData) {

  const state = {
    current: -1,
    queue: [],
    commands: {},
    commandArray: [],
    destroyArray: [],
  }

  const registry = (command) => {
    const { commandArray,commands,queue } = state
    commandArray.push(command)
    commands[command.name] = (...args) => {
      const { redo,undo } = command.execute(...args)
      redo()
      if(!command.pushQueue) {
        return
      }
      if(queue.length > 0) {
        queue.slice(0,state.current + 1)
      }
      queue.push({ redo,undo });
      state.current++
    }
  }

  registry({
    name: "redo",
    keyboard: "ctrl+y",
    execute() {
      return {
        redo() {
          const { current,queue } = state
          const operation = queue[current + 1]
          if(!operation) return
          operation.redo && operation.redo()
          state.current++
        }
      }
    }
  })
  registry({
    name: "undo",
    keyboard: "ctrl+z",
    execute() {
      return {
        redo() {
          const { current,queue } = state
          if(current === -1) return
          const operation = queue[current]
          if(!operation) return
          operation.undo && operation.undo()
          state.current--
        }
      }
    }
  })
  registry({
    name: "componentDrag",
    pushQueue: true,
    init() {
      this.before = null
      const start = () => this.before = deepcopy(data.value.blocks)
      const end = () => state.commands.componentDrag()
      events.on("componentDragStart",start)
      events.on("componentDragEnd",end)
      return () => {
        events.off("componentDragStart",start)
        events.off("componentDragEnd",end)
      }
    },
    execute() {
      const before = this.before
      const after = data.value.blocks
      return {
        redo() {
          data.value = { ...data.value,blocks: after }
        },
        undo() {
          data.value = { ...data.value,blocks: before }
        }
      }
    }
  })
  registry({
    name: "export",
    keyboard: "ctrl+c",
    execute() {
      const dialog = $dialog$({
        title: "导出",
        preview: true,
        content: deepcopy(data.value)
      })
      return {
        redo() {
          dialog.showDialog()
        }
      }
    }
  })
  registry({
    name: "import",
    keyboard: "ctrl+i",
    execute() {
      const dialog = $dialog$({
        title: "导入",
        content: "",
        footer: true,
        onConfirm(content) {
          state.commands.updateContainer(JSON.parse(content))
        }
      })
      return {
        redo() {
          dialog.showDialog()
        }
      }
    }
  })
  registry({
    name: "updateContainer",
    pushQueue: true,
    execute(newValue) {
      const before = data.value
      const after = newValue
      return {
        redo() {
          data.value = after
        },
        undo() {
          data.value = before
        }
      }
    }
  })
  registry({
    name: "updateBlockComponent",
    pushQueue: true,
    execute(newBlock,oldBlock) {
      const before = data.value.blocks
      const after = (() => {
        const blocks = [...data.value.blocks]
        const index = data.value.blocks.indexOf(oldBlock)
        if(index != -1) {
          blocks.splice(index,1,newBlock)
        }
        return blocks
      })()
      return {
        redo() { 
          data.value = {...data.value, blocks: after }
        },
        undo() {
          data.value = {...data.value, blocks: before }
        }
      }
    }
  })
  registry({
    name: "placeTop",
    pushQueue: true,
    execute() {
      const before = deepcopy(data.value.blocks)
      const after = (() => {
        const { focus,unfocus } = focusData.value
        const maxZIndex = unfocus.reduce((prev,block) => {
          return Math.max(prev,block.zIndex)
        },-Infinity)
        focus.forEach(block => block.zIndex = maxZIndex + 1)
        return data.value.blocks
      })()
      return {
        redo() {
          data.value = { ...data.value, blocks: after }
        },
        undo() {
          data.value = { ...data.value, blocks: before }
        }
      }
    }
  })
  registry({
    name: "placeBottom",
    pushQueue: true,
    execute() {
      const before = deepcopy(data.value.blocks)
      const after = (() => {
        const { focus,unfocus } = focusData.value
        let minZIndex = unfocus.reduce((prev,block) => {
          return Math.min(prev,block.zIndex)
        },-Infinity) - 1
        if(minZIndex < 0) {
          minZIndex = 0
          const dur = Math.abs(minZIndex)
          unfocus.forEach(block => block.zIndex += dur)
        }
        focus.forEach(block => block.zIndex = minZIndex)
        return data.value.blocks
      })()
      return {
        redo() {
          data.value = { ...data.value, blocks: after }
        },
        undo() {
          data.value = { ...data.value, blocks: before }
        }
      }
    }
  })
  registry({
    name: "deleteComponent",
    pushQueue: true,
    execute() {
      const before = deepcopy(data.value.blocks)
      const after = focusData.value.unfocus
      return {
        redo() {
          data.value = { ...data.value, blocks: after }
        },
        undo() {
          data.value = { ...data.value, blocks: before }
        }
      }
    }
  })
  
  const keyboardEvent = (() => {
    const keyCodes = {
      67: "c",
      73: "i",
      89: "y",
      90: "z"
    }
    const onKeyDow = (event) => {
      const { ctrlKey,keyCode } = event
      const keyStringArray = []
      if(ctrlKey) keyStringArray.push("ctrl")
      keyStringArray.push(keyCodes[keyCode])
      const keyString = keyStringArray.join("+")
      state.commandArray.forEach(({keyboard,name}) => {
        if(!keyboard) return
        if(keyboard === keyString) {
          state.commands[name]()
          event.preventDefault()
        }
      })
    }
    return () => {
      window.addEventListener("keydown",onKeyDow)
      return () => {
        window.removeEventListener("keydown",onKeyDow)
      }
    }
  })()
  state.destroyArray.push(keyboardEvent())
  state.commandArray.forEach(command => command.init && state.destroyArray.push(command.init()))
  
  onUnmounted(() => {
    state.destroyArray.forEach(fn => fn && fn())
  })
  return state
}