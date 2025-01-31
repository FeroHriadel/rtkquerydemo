import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MdOutlineMoreVert } from "react-icons/md";



interface TaskDropdownProps {
  onAddTask: () => void;
  onCompleteAll: () => void;
  onDeleteAll: () => void;
}



const TaskDropdown = ({ onAddTask, onCompleteAll, onDeleteAll }: TaskDropdownProps) => {

  // Open 'Add task' dialog
  const openDialog = () => {
    requestAnimationFrame(() => onAddTask()); //defers execution to the next browser repaint (else Shadcn DropdownMenu breaks) - Shadcn shines yet again
  }

  return (
    <DropdownMenu>
      {/* Open-dropdown button */}
      <DropdownMenuTrigger>
        <MdOutlineMoreVert />
      </DropdownMenuTrigger>

      {/* Dropdown content*/}
      <DropdownMenuContent>
        <DropdownMenuLabel>Manage Tasks</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={openDialog}>Add new</DropdownMenuItem>
        <DropdownMenuItem onClick={onCompleteAll}>All as done</DropdownMenuItem>
        <DropdownMenuItem onClick={onDeleteAll}>Remove all</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

  )
}

export default TaskDropdown