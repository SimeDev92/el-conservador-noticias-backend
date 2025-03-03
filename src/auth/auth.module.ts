import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from './entities/user.entity.schema';
import { SuperAdmin, SuperAdminSchema } from './entities/super-admin.entity.schema';
import { SuperAdminGuard } from '../auth/guards/auth/super-admin.guard';
import { MailsModule } from 'src/mails/mails.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, SuperAdminGuard],
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema
      },
      {
        name: SuperAdmin.name,
        schema: SuperAdminSchema
      }
    ]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SEED,
      signOptions: { expiresIn: '1h' },
    }),
    MailsModule
  ],
  exports: [AuthService, JwtModule]
})
export class AuthModule {}