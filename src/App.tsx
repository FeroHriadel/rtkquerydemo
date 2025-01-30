import { useEffect, useState } from 'react';
import { useGetTasksQuery, useDeleteTaskMutation, useUpdateTaskMutation } from '@/store/taskApi';
import { useToast } from "@/hooks/use-toast";
import Container from '@/components/Container';
import Loading from '@/components/Loading';
import TaskDialog from '@/components/TaskDialog';
import { List, ListLine } from './components/List';
import { FaPlus } from "react-icons/fa6";
import { IoCheckmarkOutline } from "react-icons/io5";
import { IoPencil } from "react-icons/io5";
import { GoTrash } from "react-icons/go";
import { MdOutlineMoreVert } from "react-icons/md";


const App = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: tasks, isLoading: loadingTasks, error: getTasksError } = useGetTasksQuery();
  const [deleteTask] = useDeleteTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const { toast } = useToast();


  // Open/close dialog
  const toggleDialog = () => setDialogOpen(!dialogOpen);

  // Delete task optimistically
  const handleDeleteTask = (id: number) => deleteTask(id);

  // Update to completed optimistically
  const handleCompleteTask = (id: number) => updateTask({ id, completed: true });


  // Show Errors
  useEffect(() => {
    if (getTasksError) toast({title: "Error", description: "Failed to load tasks" });
  }, [getTasksError, toast]);


  // Render
  if (loadingTasks) return <Loading className='text-center' />

  return (
    <Container>    
      {/* Task List */}
      <List>
        <ListLine className='flex justify-between items-center text-gray-500'>
          <p>Toggle</p>
          <div className='flex gap-2 cursor-pointer'>
            <FaPlus onClick={toggleDialog} />
            <MdOutlineMoreVert />
          </div>
        </ListLine>
        {
          tasks?.map((task) => (
            <ListLine key={task.id} className={'flex justify-between items-center '}>
              <p>{task.text}</p>
              <div className='flex gap-2 cursor-pointer'>
                {!task.completed && <IoCheckmarkOutline onClick={() => handleCompleteTask(task.id)} />}
                <IoPencil />
                <GoTrash onClick={() => handleDeleteTask(task.id)} />
              </div>
            </ListLine>
          ))
          }
      </List>

      {/* Dialog */}
      <TaskDialog isOpen={dialogOpen} onOpenChange={toggleDialog} />
    </Container>
  );
}

export default App
