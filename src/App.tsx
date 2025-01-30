import { useGetTasksQuery, useDeleteTaskMutation } from '@/store/taskApi';



const App = () => {
  const { data: tasks, isLoading, error } = useGetTasksQuery();
  const [deleteTask] = useDeleteTaskMutation();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching tasks</p>;

  return (
    <ul>
      {tasks?.map((task) => (
        <li key={task.id}>
          {task.text} - {task.completed ? 'Completed' : 'Pending'}
          <button onClick={() => deleteTask(task.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

export default App
