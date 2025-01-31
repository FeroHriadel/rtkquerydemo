import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Task } from "@/types/types";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAddTaskMutation, useUpdateTaskMutation } from "@/store/taskApi";



interface TaskDialogProps {
  isOpen: boolean;
  onOpenChange: () => void;
  task?: Task | null;
}



const TaskDialog = ({ isOpen, onOpenChange, task }: TaskDialogProps) => {
  const isEditing = task?.id;
  const title = isEditing ? "Edit Task" : "Add Task";
  const [text, setText] = useState("");
  const { toast } = useToast();
  const [addTask] = useAddTaskMutation();
  const [updateTask] = useUpdateTaskMutation();

  
  // Update input text
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value);

  // Clear input text
  const clearInput = () => setText("");

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
  const createTask = async () => {
    try {
      toast({ description: "Creating task" }); //takes a while (not optimistic) - toast keeps user entertained
      await addTask({ text }).unwrap();
    } catch (error) {
      console.log(error);
      toast({ title: "Error", description: "Failed to create task" });
    }
  }

  // Change task text
  const editTask = async () => {
    if (!task) return;
    try {
      await updateTask({ id: task.id, text }).unwrap();
    } catch (error) {
      console.log(error);
      toast({ title: "Error", description: "Failed to update task" });
    }
  }
  
  // Submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateText()) return;
    if (isEditing) editTask();
    else createTask();
    onOpenChange();
    clearInput();
  };


  // Populate input if editing task
  useEffect(() => {
    if (task) setText(task.text);
  }, [task]);


  // Render
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>

        {/* Header */}
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Change task name." : "Add new task"}
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <form className="w-[100%] flex flex-col gap-2" id="task-form" onSubmit={handleSubmit}>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={text} onChange={handleChange} />
        </form>

        {/* Footer */}
        <DialogFooter>
          <Button onClick={onOpenChange} className="mb-1">Close</Button>
          <Button type="submit" form="task-form" className="mb-1">Save</Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}

export default TaskDialog