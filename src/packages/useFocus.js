import { computed } from 'vue'
export function useFocus(data, callback) {
    // 判断获取焦点的block
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
    const blockMouseDown = (e, block) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.shiftKey) {
            block.focus = !block.focus;
        } else {
            if (!block.focus) {
                clearBlockFocus();
                block.focus = true;
            } else {
                block.focus = false;
            }
        }
        callback(e)
        // block上规划一个属性focus，获取焦点后就将focus变为true
    };



    const containerMouseDown = () => {
        clearBlockFocus();
    };

    return {
        blockMouseDown,
        focusData,
        containerMouseDown
    }
}