import useTasks from '@/hooks/useTasks';



const TaskCount = () => {
  const { tasks, getCompletedTasks } = useTasks();
  const tasksCount = tasks?.length || 0;
  const completedTasksCount = getCompletedTasks()?.length || 0;

  return (
    <aside className='m-4 text-gray-400'>
      {`${completedTasksCount} of ${tasksCount} complete`}
    </aside>
  )
}

export default TaskCount