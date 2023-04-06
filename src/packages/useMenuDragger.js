import {events} from './events'
export function useMenuDragger(containerRef,data){
    let currentComponent = null;
    const dragstart = (e, component) => {
      // dragenter 进入元素中，添加一个移动的标识
      // dragover 在目标元素经过，必须要组织默认行为，否则不能触发drop
      // dragleave 离开元素的时候，必须增加一个禁用标识
      // drop 松手的时候，根据拖拽的组件，添加一个组件
      containerRef.value.addEventListener("dragEnter", dragEnter);
      containerRef.value.addEventListener("dragover", dragover);
      containerRef.value.addEventListener("dragleave", dragleave);
      containerRef.value.addEventListener("drop", drop);
      currentComponent = component;
      events.emit('start')
    };
    
    const dragend = (e) => {
      containerRef.value.removeEventListener("dragEnter", dragEnter);
      containerRef.value.removeEventListener("dragover", dragover);
      containerRef.value.removeEventListener("dragleave", dragleave);
      containerRef.value.removeEventListener("drop", drop);
      events.emit('end')
    }
    
    const dragEnter = (e) => {
      e.dataTransfer.dropEffect = "move";
    };
    const dragover = (e) => {
      e.preventDefault();
    };
    const dragleave = (e) => {
      e.dataTransfer.dropEffect = "none";
    };
    const drop = (e) => {
      let blocks = data.value.blocks;
      data.value = {
        ...data.value,
        blocks: [
          ...blocks,
          {
            top: e.offsetY,
            left: e.offsetX,
            zIndex: 1,
            key: currentComponent.key,
            alignCenter:true
          },
        ],
      };
      currentComponent = null;
    };
    return {
        dragstart,
        dragend 
    }
}