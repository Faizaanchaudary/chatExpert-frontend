export interface IItem<T> {
  status: 'success' | 'error';
  data: T;
  meta: null;
}
