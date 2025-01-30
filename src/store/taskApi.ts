import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Task } from '@/types/types';



const apiUrl = import.meta.env.VITE_API_ENDPOINT;



export const taskApi = createApi({
  reducerPath: 'taskApi',
  baseQuery: fetchBaseQuery({ baseUrl: apiUrl }),
  tagTypes: ['Tasks'],
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], void>({
      query: () => '/tasks',
      providesTags: ['Tasks'],
    }),
    addTask: builder.mutation<Task, Partial<Task>>({
      query: (newTask) => ({
        url: '/tasks',
        method: 'POST',
        body: newTask,
      }),
      invalidatesTags: ['Tasks'],
    }),
    updateTask: builder.mutation<Task, Partial<Task>>({
      query: ({ id, ...updatedTask }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        body: updatedTask,
      }),
      invalidatesTags: ['Tasks'],
    }),
    deleteTask: builder.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tasks'],
    }),
  }),
});

export const { useGetTasksQuery, useAddTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } = taskApi;
