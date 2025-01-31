import { useEffect, useState } from 'react';
import { useGetTasksQuery, useDeleteTaskMutation, useCompleteTaskMutation } from '@/store/taskApi';
import { useToast } from "@/hooks/use-toast";
import Container from '@/components/Container';
import Loading from '@/components/Loading';
import TaskDialog from '@/components/TaskDialog';
import TaskDropdown from '@/components/TaskDropdown';
import { List, ListLine } from '@/components/List';
import { FaPlus } from "react-icons/fa6";
import { IoCheckmarkOutline } from "react-icons/io5";
import { IoPencil } from "react-icons/io5";
import { GoTrash } from "react-icons/go";
import { Task, FilterValue } from '@/types/types';
import TaskFilter from './components/TaskFilter';



const App = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null); //task to edit
  const [filter, setFilter] = useState<FilterValue>(FilterValue.ALL);
  const [shownTasks, setShowntasks] = useState<Task[]>(); //tasks shown to user based on filter
  const { data: tasks, isLoading: loadingTasks, error: getTasksError } = useGetTasksQuery(); //all tasks
  const [deleteTask] = useDeleteTaskMutation();
  const [completeTask] = useCompleteTaskMutation();
  const { toast } = useToast();


  // Update filter value
  const handleFilterChange = (value: FilterValue) => setFilter(value);

  // Clear edited task
  const clearEditedTask = () => setEditedTask(null);

  // Open/close dialog & clear edited task on close
  const toggleDialog = () => {
    setDialogOpen(prev => {
      if (prev) clearEditedTask(); //if dialog is closing clear editedTask if any
      return !prev;
    }); 
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

  // Update to completed optimistically
  const handleCompleteTask = async (id: number) => {
    try {
      await completeTask({ id, completed: true }).unwrap();
    } catch (error) {
      console.log(error);
      toast({title: "Error", description: "Failed to update task" });
    }
  }

  // Open edit task dialog in edit mode
  const handleEditTask = (task: Task) => {
    setEditedTask(task);
    setDialogOpen(true);
  }

  // Get incomplete tasks
  const getIncompleteTasks = () => {
    const incompleteTasks = tasks?.filter(t => t.completed === false);
    return incompleteTasks;
  }

  // Update all tasks to 'completed'
  const completeAllTasks = () => {
    const incompleteTasks = getIncompleteTasks();
    incompleteTasks?.forEach(t => handleCompleteTask(t.id));
  }

  // Delete all tasks
  const deleteAllTasks = () => {
    tasks?.forEach(t => handleDeleteTask(t.id));
  }


  // Show load task error
  useEffect(() => {
    if (getTasksError) toast({title: "Error", description: "Failed to load tasks" });
  }, [getTasksError, toast]);

  // Set tasks to show to user by filter value
  useEffect(() => {
    switch (filter) {
      case FilterValue.ALL:
        setShowntasks(tasks);
        break;
      case FilterValue.COMPLETED:
        setShowntasks(tasks?.filter(t => t.completed));
        break;
      case FilterValue.INCOMPLETE:
        setShowntasks(tasks?.filter(t => !t.completed));
        break;
    }
  }, [filter, tasks]);


  // Render
  return (
    <Container>
      {/* Header */}
      {loadingTasks ? <Loading className='text-center mb-8' /> : <h1 className='text-center mb-8 text-md'>TASKS</h1>}

      {/* Task List */}
      <List>
        <ListLine className='flex justify-between items-center text-gray-500'>
          <TaskFilter onChange={handleFilterChange} />
          <div className='flex gap-2 cursor-pointer'>
            <FaPlus onClick={toggleDialog} />
            <TaskDropdown 
              onAddTask={toggleDialog} 
              onCompleteAll={completeAllTasks}
              onDeleteAll={deleteAllTasks}
            />
          </div>
        </ListLine>
        {
          shownTasks?.map((task) => (
            <ListLine key={task.id} className={'flex justify-between items-center '}>
              <p>{task.text}</p>
              <div className='flex gap-2 cursor-pointer'>
                {!task.completed && <IoCheckmarkOutline onClick={() => handleCompleteTask(task.id)} />}
                <IoPencil onClick={() => handleEditTask(task)} />
                <GoTrash onClick={() => handleDeleteTask(task.id)} />
              </div>
            </ListLine>
          ))
        }
      </List>

      {/* Dialog */}
      <TaskDialog isOpen={dialogOpen} onOpenChange={toggleDialog} task={editedTask} />
    </Container>
  );
}

export default App
