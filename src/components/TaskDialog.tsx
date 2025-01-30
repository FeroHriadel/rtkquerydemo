import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Task } from "@/types/types";
import { Button } from "./ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAddTaskMutation } from "@/store/taskApi";



interface TaskDialogProps {
  isOpen: boolean;
  onOpenChange: () => void;
  task?: Task;
}



const TaskDialog = ({ isOpen, onOpenChange, task }: TaskDialogProps) => {
  const isEditing = task?.id;
  const title = isEditing ? "Edit Task" : "Add Task";
  const [text, setText] = useState(task?.text || "");
  const { toast } = useToast();
  const [addTask] = useAddTaskMutation();


  // Update text
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value);

  // Check text
  const validateText = () => {
    if (!text.trim()) {
      toast({ title: "Error", description: "Task name is required" });
      return false;
    }
    if (text.length > 50) {
      toast({ title: "Error", description: "Task name is too long" });
      return false;
    }
    return true;
  };

  // Create new task
  const createTask = () => {
    addTask({ text });
    toast({ description: "Saving task" });
  }
  
  // Submit form
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateText()) return;
    if (isEditing) console.log('editing')
    else createTask();
    onOpenChange();
  };


  // Render
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>

        {/* Header */}
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Form */}
        <form className="w-[100%] flex flex-col gap-2" id="task-form" onSubmit={handleSubmit}>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={text} onChange={handleChange} />
        </form>

        {/* Footer */}
        <DialogFooter>
          <Button onClick={onOpenChange}>Close</Button>
          <Button type="submit" form="task-form">Save</Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}

export default TaskDialog