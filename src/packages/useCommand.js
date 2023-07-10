// @ts-nocheck
import { events } from "./events";
import deepcopy from "deepcopy";
import { onUnmounted } from "vue";

export function useCommand(data) {
  // 前进后退需要指针
  const state = {
    // 前进后退的索引值
    current: -1,
    // 存放所有的操作命令
    queue: [],
    // 制作命令和执行功能的一个映射表 undo: ()=>{} redo:()=>{}
    commands: {},
    // 存放所有的命令
    commandArray: [],
    // 销毁列表
    destroyedArray: [],
  };
  const registry = (command) => {
    state.commandArray.push(command);
    //命令名字对应执行函数
    state.commands[command.name] = () => {
      const { redo, undo } = command.execute();
      redo();
      // 如果不需要放在队列中，直接跳过即可
      if (!command.pushQueue) {
        return;
      }
      let { queue, current } = state;
      if (queue.length > 0) {
        // 可能在放置的过程中有撤销操作，所以根据当前最新的current值来计算新的队列
        queue.slice(0, current + 1);
        state.queue = queue;
      }
      // 保存指令的前进和后退
      queue.push({ redo, undo });
      state.current = current + 1;
    };
  };
  // 注册我们需要的命令
  registry({
    name: "redo",
    keyboard: "ctrl+y",
    execute() {
      return {
        redo() {
          // 找到下一步
          const item = state.queue[state.current + 1];
          if (item) {
            item.redo && item.redo();
            state.current++;
          }
        },
      };
    },
  });
  registry({
    name: "undo",
    keyboard: "ctrl+z",
    execute() {
      return {
        redo() {
          // 找到上一步
          if (state.current == -1) return;
          const item = state.queue[state.current];
          if (item) {
            item.undo && item.undo();
            state.current--;
          }
        },
      };
    },
  });

  registry({
    // 如果希望将操作放到队列中，可以增加一个属性，标识等会要放到队列中
    name: "drag",
    pushQueue: true,
    // 初始化，默认就会执行
    init() {
      // 之前的数据
      this.before = null;
      // 监控拖拽开始事件，保持状态
      const start = () => (this.before = deepcopy(data.value.blocks));
      // 拖拽之后需要触发对应的指令
      const end = () => state.commands.drag();
      events.on("start", start);
      events.on("end", end);
      return () => {
        events.off("start", start);
        events.off("end", end);
      };
    },
    execute() {
      let before = this.before;
      let after = data.value.blocks;
      return {
        // 默认一松手，就把当前事件完成
        redo() {
          data.value = { ...data.value, blocks: after };
        },
        // 前一步的
        undo() {
          data.value = { ...data.value, blocks: before };
        },
      };
    },
  });

  const keyboardEvent = (() => {
    const keyCodes = {
      89: "y",
      90: "z",
    };
    const onKeydown = (e) => {
      const { ctrlKey, keyCode } = e;
      let keyString = [];
      if (ctrlKey) keyString.push("ctrl");
      keyString.push(keyCodes[keyCode]);
      keyString = keyString.join("+");

      state.commandArray.forEach(({ keyboard, name }) => {
        if (!keyboard) return;
        if (keyboard == keyString) {
          state.commands[name]();
          e.preventDefault();
        }
      });
    };
    const init = () => {
      window.addEventListener("keydown", onKeydown);
      return () => {
        window.removeEventListener("keydown", onKeydown);
      };
    };
    return init;
  })();
  (() => {
    state.destroyedArray.push(keyboardEvent());
    state.commandArray.forEach(
      (command) => command.init && state.destroyedArray.push(command.init())
    );
  })();

  // 清空绑定的事件
  onUnmounted(() => {
    state.destroyedArray.forEach((fn) => fn && fn());
  });
  return state;
}
