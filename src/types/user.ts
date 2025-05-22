export interface IUser {
  id?: string;
  email: string;
  name: string;
  rol: string;
}

export interface IGetUserByRolBody {
  rol: string;
}
