import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';

import { CreateUserDto, RegisterUserDto, LoginDto, UpdateAuthDto } from './dto';
import { AuthGuard } from './guards/auth/auth.guard';
import { LoginResponse } from './interfaces/login-response';
import { User } from './entities/user.entity.schema';
import { OriginGuard } from './guards/auth/origin.guard';
import { ApiKeyGuard } from 'src/api-key/api-key.guard';
import { SuperAdminGuard } from './guards/auth/super-admin.guard';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post()
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/register')
  register(@Body() registerUserDto: RegisterUserDto) {

    return this.authService.register(registerUserDto)

  }

  @UseGuards(ApiKeyGuard)
  @Get()
  findAll(@Request() req: Request) {
    const user = req['user'];
    // return user;
    return this.authService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('check-token')
  checkToken(@Request() req: Request): LoginResponse {
    const user = req['user'] as User;

    return {
      user,
      token: this.authService.getJwtToken({ id: user._id })
    }
  }

  @UseGuards(OriginGuard) // Para probar con postman hay que descativarlo 
  @Get('user/:id')
  async getUserById(@Param('id') id: string) {
    const user = await this.authService.findUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { name: user.name, surname: user.surname };
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    await this.authService.requestPasswordReset(email);
    return {
      message: 'If the mail exists, a password reset link has been sent'
    };
  }

  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string
  ) {
    await this.authService.resetPassword(token, newPassword);
    return { message: 'Password has been reset successfully' };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(id, updateAuthDto);
  }

  @UseGuards(ApiKeyGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.authService.deleteUserById(id);
  }

  @Post('/create-superadmin')
  @UseGuards(ApiKeyGuard)
  createSuperAdmin(@Body() createSuperAdminDto: CreateSuperAdminDto) {
    return this.authService.createSuperAdmin(createSuperAdminDto);
  }

  @Post('/login-superadmin')
  loginSuperAdmin(@Body() loginDto: LoginDto) {
    return this.authService.loginSuperAdmin(loginDto);
  }

  @Post('ban/:id')
  @UseGuards(ApiKeyGuard) // Próximamente también le añadiré SuperAdminGuard 
  async banUser(@Param('id') id: string) {
    return this.authService.banUser(id);
  }

  @Post('unban/:id')
  @UseGuards(ApiKeyGuard) // Próximamente también le añadiré SuperAdminGuard 
  async unbanUser(@Param('id') id: string) {
    return this.authService.unbanUser(id);
  }

}
