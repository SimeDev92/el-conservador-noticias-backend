import { SuperAdmin } from '../entities/super-admin.entity.schema';

export type SuperAdminResponse = Omit<SuperAdmin, 'password'>;