export interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdDate: string
}

export enum FilterValue {
  ALL = 'all',
  COMPLETED = 'completed',
  INCOMPLETE = 'incomplete'
}