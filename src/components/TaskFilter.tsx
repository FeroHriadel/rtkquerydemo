import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterValue } from "@/types/types";



interface TaskFilterProps {
  onChange: (filter: FilterValue) => void;
}




const TaskFilter = ({ onChange }: TaskFilterProps) => {
  // Set filter value to selected value
  const handleChange = (e: FilterValue) => {
    onChange(e);
  }

  // Render
  return (
    <Select defaultValue={FilterValue.ALL} onValueChange={handleChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter tasks" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={FilterValue.ALL}>Show all</SelectItem>
        <SelectItem value={FilterValue.COMPLETED}>Show completed</SelectItem>
        <SelectItem value={FilterValue.INCOMPLETE}>Show incomplete</SelectItem>
      </SelectContent>
    </Select>
  )
}

export default TaskFilter