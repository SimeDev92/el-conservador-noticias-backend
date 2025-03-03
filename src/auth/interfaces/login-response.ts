import { User } from '../entities/user.entity.schema';

export interface LoginResponse {
    user:User;
    token: string; 
}