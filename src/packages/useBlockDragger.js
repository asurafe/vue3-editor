// @ts-nocheck

import { reactive } from "vue";
import { events } from "./events";

export function useBlockDragger(focusData, lastSelectBlock) {
    let dragState = {
        startX: 0,
        startY: 0,
        // 默认不是正在拖拽
        dragging:false
    };
    let markLine = reactive({
        x:null,
        y:null
    })
    const mousedown = (e) => {
        // 最后拖动的元素
        const { width: BWidth, height: BHeight } = lastSelectBlock.value
        dragState = {
            // 记住每一个的选中位置
            startX: e.clientX,
            startY: e.clientY,
            // b点拖拽前的位置 left 和 top
            startLeft: lastSelectBlock.value.left,
            startTop: lastSelectBlock.value.top,
            dragging:false,
            startPos: focusData.value.focus.map(({ top, left }) => ({ top, left })),
            // 辅助线
            lines: (() => {
                // 获取其他没选中的以他们的位置做辅助线
                const { unfocus } = focusData.value;
                // 计算横线的位置用y来存放，x存的是纵向
                let lines = { x: [], y: [] }
                unfocus.forEach((block) => {
                    const { top: ATop, left: ALeft, width: AWidth, height: AHegiht } = block
                    // showTop是辅助线出现的位置，top是自身距离顶部的距离
                    // 当此元素拖拽到和A元素top一致的时候，要显示这根辅助线，辅助线的位置就是ATop
                    lines.y.push({ showTop: ATop, top: ATop })
                    // 顶对底
                    lines.y.push({ showTop: ATop, top: ATop - BHeight })
                    // 中间对中间
                    lines.y.push({ showTop: ATop + AHegiht / 2, top: ATop + AHegiht / 2 - BHeight / 2 })
                    // 底对顶
                    lines.y.push({ showTop: ATop + AHegiht, top: ATop + AHegiht })
                    // 底对底
                    lines.y.push({ showTop: ATop + AHegiht, top: ATop + AHegiht - BHeight })

                    // 左对左
                    lines.x.push({ showLeft: ALeft, left: ALeft })
                    // 右对左
                    lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth })
                    // 中间对中间
                    lines.x.push({ showLeft: ALeft + AWidth / 2, left: ALeft + AWidth / 2 - BWidth / 2 })
                    // 右对右
                    lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth - BWidth })
                    // 左对右
                    lines.x.push({ showLeft: ALeft, left: ALeft - BWidth })
                })
                return lines
            })()
        };
        document.addEventListener("mousemove", mousemove);
        document.addEventListener("mouseup", mouseup);
    };
    const mousemove = (e) => {
        let { clientX: moveX, clientY: moveY } = e;
        if(!dragState.dragging){
            dragState.dragging = true;
            // 触发事件，记住拖拽前的位置
            events.emit('start')
        }
        // 计算当前元素最新的left和top,去线里面找,找到显示线
        // 鼠标移动后 - 鼠标移动前 + left
        let left = moveX - dragState.startX + dragState.startLeft
        let top = moveY - dragState.startY + dragState.startTop
        // 先计算横线 距离参照物元素还有5像素时显示这个线

        let y = null;
        let x = null;

        for (let i = 0; i < dragState.lines.y.length; i++) {
            // 获取每一根线
            const { top: t, showTop: s } = dragState.lines.y[i]
            // 如果小于5，说明接近了
            if (Math.abs(t - top) < 5) {
                // 线显示的位置
                y = s;
                // 实现快速和这个元素贴在一起
                // 容器距离顶部的距离 + 目标的高度就是最新的moveY
                moveY = dragState.startY - dragState.startTop + t;
                break;
            }
        }
        for (let i = 0; i < dragState.lines.x.length; i++) {
            // 获取每一根线
            const { left: l, showLeft: s } = dragState.lines.x[i]
            // 如果小于5，说明接近了
            if (Math.abs(l - left) < 5) {
                // 线显示的位置
                x = s;
                // 实现快速和这个元素贴在一起
                // 容器距离顶部的距离 + 目标的高度就是最新的moveY
                moveX = dragState.startX - dragState.startLeft + l;
                break;
            }
        }
        // markLine是一个响应式数据，x，y更新导致视图更新
        markLine.x = x;
        markLine.y = y;
        let durX = moveX - dragState.startX;
        let durY = moveY - dragState.startY;
        focusData.value.focus.forEach((block, index) => {
            block.top = dragState.startPos[index].top + durY;
            block.left = dragState.startPos[index].left + durX;
        });
    };
    const mouseup = () => {
        document.removeEventListener("mousemove", mousemove);
        document.removeEventListener("mouseup", mouseup);
        markLine.x = null;
        markLine.y = null;
        if(dragState.dragging){
            events.emit('end')
        }
    };
    return {
        markLine,
        mousedown
    }
}