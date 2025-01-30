import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MdOutlineMoreVert } from "react-icons/md";




const TaskDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger> <MdOutlineMoreVert /> </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Manage Tasks</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Add new</DropdownMenuItem>
        <DropdownMenuItem>All as done</DropdownMenuItem>
        <DropdownMenuItem>Remove all</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

  )
}

export default TaskDropdown