import { computed,ref } from 'vue'
export function useFocus(data, callback) {
    // 当selectIndex为-1时，表示没有任何一个元素被选中
    const selectIndex = ref(-1);

    // 最后选中的元素
    const lastSelectBlock = computed(()=>{
       return data.value.blocks[selectIndex.value]
    })
    // 判断获取焦点的元素
    const focusData = computed(() => {
        const focus = [];
        const unfocus = [];
        data.value.blocks.forEach((block) =>
            (block.focus ? focus : unfocus).push(block)
        );
        return { focus, unfocus };
    });
    const clearBlockFocus = () => {
        data.value.blocks.forEach((block) => (block.focus = false));
    };
    // 让所有选中的元素失去焦点
    const containerMouseDown = () => {
        clearBlockFocus();
        selectIndex.value = -1
    };
    const blockMouseDown = (e, block,index) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) {
            if (focusData.value.focus.length <= 1) {
                block.focus = true
            } else {
                block.focus = !block.focus;
            }
        } else {
            if (!block.focus) {
                clearBlockFocus();
                block.focus = true;
            }
        }
        selectIndex.value = index
        callback(e)
        // block上规划一个属性focus，获取焦点后就将focus变为true
    };

    return {
        blockMouseDown,
        focusData,
        containerMouseDown,
        lastSelectBlock
    }
}