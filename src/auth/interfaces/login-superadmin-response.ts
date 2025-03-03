import { SuperAdmin } from '../entities/super-admin.entity.schema';

export interface LoginSuperAdminResponse {
    superAdmin: Omit<SuperAdmin, 'password'>;
    token: string;
}