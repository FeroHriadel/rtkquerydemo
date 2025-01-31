import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Task } from '@/types/types';



const apiUrl = import.meta.env.VITE_API_ENDPOINT;



export const taskApi = createApi({
  reducerPath: 'taskApi',
  baseQuery: fetchBaseQuery({ baseUrl: apiUrl }),
  tagTypes: ['Tasks'], // tag (triggers refetch when invlaidated)
  endpoints: (builder) => ({
    // Get tasks
    getTasks: builder.query<Task[], void>({
      query: () => '/tasks',
      providesTags: ['Tasks'],
    }),
    // Add task (not optimistically - we need id from backend)
    addTask: builder.mutation<Task, Partial<Task>>({
      query: (newTask) => ({
        url: '/tasks',
        method: 'POST',
        body: newTask,
      }),
      invalidatesTags: ['Tasks'], //trigerrs re-fetch when call finishes
    }),
    // Update task (completed = true) optimistically
    completeTask: builder.mutation<Task, Partial<Task>>({
      query: ({ id, ...updatedTask }) => ({
        url: `/tasks/${id}/complete`,
        method: 'POST',
        body: updatedTask,
      }),
      async onQueryStarted({ id, ...updatedTask }, { dispatch, queryFulfilled }) { //update in cache optimistically instead of re-fetch
        const patchResult = dispatch(
          taskApi.util.updateQueryData("getTasks", undefined, (draft) => {
            const taskIndex = draft.findIndex((task) => task.id === id);
            if (taskIndex !== -1) { draft[taskIndex] = { ...draft[taskIndex], ...updatedTask }; }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    // Update task (new text) optimistically
    updateTask: builder.mutation<Task, Partial<Task>>({
      query: ({ id, ...updatedTask }) => ({
        url: `/tasks/${id}`,
        method: 'POST',
        body: updatedTask,
      }),
      async onQueryStarted({ id, ...updatedTask }, { dispatch, queryFulfilled }) { //update in cache optimistically instead of re-fetch
        const patchResult = dispatch(
          taskApi.util.updateQueryData("getTasks", undefined, (draft) => {
            const taskIndex = draft.findIndex((task) => task.id === id);
            if (taskIndex !== -1) { draft[taskIndex] = { ...draft[taskIndex], ...updatedTask }; }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    // Delete task optimistically
    deleteTask: builder.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) { //remove from cache optimistically instead of re-fetch
      const patchResult = dispatch(
        taskApi.util.updateQueryData("getTasks", undefined, (draft) => {
          return draft.filter(task => task.id !== id);
        })
      );
      try {
        await queryFulfilled;
      } catch {
        patchResult.undo();
      }
    }
    }),
  }),
});

export const { useGetTasksQuery, useAddTaskMutation, useCompleteTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } = taskApi;
