import { $dropdown$ } from "../dropdown"

export function useMenuBlock(props,command) {
  let dropdownMenuList
  const onContextMenuBlock = (event,block) => {
    event.preventDefault()
    const dropdown = $dropdown$({
      el: event.target,
      render: () => {
        if(dropdownMenuList) {
          return dropdownMenuList
        }
        return dropdownMenuList = props.config.dropdownMenuList.map(dropdownMenu => dropdownMenu({block,command}))
      }
    })
    dropdown.showDropdown()
  }

  return {
    onContextMenuBlock
  }
}