import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SuperAdmin } from '../../entities/super-admin.entity.schema';


@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectModel(SuperAdmin.name) private superAdminModel: Model<SuperAdmin>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const superAdmin = await this.superAdminModel.findById(payload.id);
      if (!superAdmin) {
        throw new UnauthorizedException('Only superadmins can perform this action');
      }
      request['superAdmin'] = superAdmin;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}