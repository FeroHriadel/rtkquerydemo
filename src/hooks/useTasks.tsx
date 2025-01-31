import { useEffect } from 'react';
import { useGetTasksQuery, useDeleteTaskMutation, useCompleteTaskMutation, useAddTaskMutation, useUpdateTaskMutation } from '@/store/taskApi';
import { useToast } from "@/hooks/use-toast";
import { Task } from '@/types/types';



const useTasks = () => {
  const { data: tasks, isLoading: loadingTasks, error: getTasksError } = useGetTasksQuery();
  const [completeTask] = useCompleteTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [addTask] = useAddTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const { toast } = useToast();

  // Create a new task
  const handleCreateTask = async (text: string) => {
    try {
      toast({ description: "Creating task" }); //takes a while (not optimistic) - toast keeps user entertained
      await addTask({ text }).unwrap();
    } catch (error) {
      console.log(error);
      toast({ title: "Error", description: "Failed to create task" });
    }
  }

  // Update task text
  const handleEditTask = async (task: Task | null | undefined, text: string) => {
    if (!task) return;
    try {
      await updateTask({ id: task.id, text }).unwrap();
    } catch (error) {
      console.log(error);
      toast({ title: "Error", description: "Failed to update task" });
    }
  }

  // Get incomplete tasks
  const getIncompleteTasks = () => {
    const incompleteTasks = tasks?.filter(t => t.completed === false);
    return incompleteTasks;
  }

  // Update tasks to 'completed' optimistically
  const handleCompleteTask = async (id: number) => {
    try {
      await completeTask({ id, completed: true }).unwrap();
    } catch (error) {
      console.log(error);
      toast({title: "Error", description: "Failed to update task" });
    }
  }

  // Update all tasks to 'completed'
  const handleCompleteAllTasks = () => {
    const incompleteTasks = getIncompleteTasks();
    incompleteTasks?.forEach(t => handleCompleteTask(t.id));
  }

  // Delete task optimistically
  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id).unwrap(); //unwrap throws an error if mutation fails
    } catch (error) {
      console.log(error);
      toast({title: "Error", description: "Failed to delete task" });
    }
  }

  // Delete all tasks 
  const handleDeleteAllTasks = () => {
    tasks?.forEach(t => handleDeleteTask(t.id));
  }


  // Show load tasks error
  useEffect(() => {
    if (getTasksError) toast({title: "Error", description: "Failed to load tasks" });
  }, [getTasksError, toast]);


  //Expose values and functions
  return {
    tasks,
    loadingTasks,
    getTasksError,
    handleCreateTask,
    handleEditTask,
    handleCompleteTask,
    handleCompleteAllTasks,
    handleDeleteTask,
    handleDeleteAllTasks,
  }
}

export default useTasks