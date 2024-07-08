import { Error } from './error.interface';

export interface Response {
  code: number;
  message: string | Error;
  data: unknown | null;
}
