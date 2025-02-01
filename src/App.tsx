import { useMemo, useState } from 'react';
import useTasks from '@/hooks/useTasks';
import Container from '@/components/Container';
import Loading from '@/components/Loading';
import TaskDialog from '@/components/TaskDialog';
import TaskDropdown from '@/components/TaskDropdown';
import TaskFilter from '@/components/TaskFilter';
import TaskCount from '@/components/TaskCount';
import { List, ListLine } from '@/components/List';
import { FaPlus } from 'react-icons/fa6';
import { IoCheckmarkOutline } from 'react-icons/io5';
import { IoPencil } from 'react-icons/io5';
import { GoTrash } from 'react-icons/go';
import { Task, FilterValue } from '@/types/types';



const App = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null); //task to edit
  const [filter, setFilter] = useState<FilterValue>(FilterValue.ALL);
  const { tasks, loadingTasks, handleCompleteTask, handleCompleteAllTasks, handleDeleteTask, handleDeleteCompletedTasks } = useTasks();

  // Update filter value
  const handleFilterChange = (value: FilterValue) => setFilter(value);

  // Clear edited task
  const clearEditedTask = () => setEditedTask(null);

  // Open/close dialog & clear edited task on close
  const handleToggleDialog = () => {
    setDialogOpen(previousState => {
      const isDialogOpen = previousState === true;
      if (isDialogOpen) clearEditedTask(); //if dialog is closing clear editedTask if any
      return !previousState;
    }); 
  }

  // Open task dialog in edit mode
  const handleEditTask = (task: Task) => {
    setEditedTask(task);
    setDialogOpen(true);
  }

  // show tasks by filter value
  const shownTasks = useMemo(() => {
    switch (filter) {
      case FilterValue.COMPLETED:
        return tasks?.filter(t => t.completed);
      case FilterValue.INCOMPLETE:
        return tasks?.filter(t => !t.completed);
      default:
        return tasks;
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
            <FaPlus onClick={handleToggleDialog} />
            <TaskDropdown 
              onAddTask={handleToggleDialog} 
              onCompleteAll={handleCompleteAllTasks}
              onDeleteCompleted={handleDeleteCompletedTasks}
            />
          </div>
        </ListLine>
        {
          shownTasks?.map((task) => (
            <ListLine key={task.id} className={'flex justify-between items-center '}>
              <p style={{overflowWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'normal'}}>{task.text}</p>
              <div className='flex gap-2 cursor-pointer'>
                {!task.completed && <IoCheckmarkOutline onClick={() => handleCompleteTask(task.id)} />}
                <IoPencil onClick={() => handleEditTask(task)} />
                <GoTrash onClick={() => handleDeleteTask(task.id)} />
              </div>
            </ListLine>
          ))
        }
      </List>

      {/* Footer */}
      <TaskCount />

      {/* Dialog */}
      <TaskDialog isOpen={dialogOpen} onOpenChange={handleToggleDialog} task={editedTask} />
    </Container>
  );
}

export default App
