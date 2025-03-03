import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';

import { User } from './entities/user.entity.schema';
import { SuperAdmin } from './entities/super-admin.entity.schema';
import { JwtPayload } from './interfaces/jwt.payload';
import { LoginResponse } from './interfaces/login-response';
import { RegisterUserDto, LoginDto, UpdateAuthDto, CreateUserDto } from './dto';
import { MailsService } from '../mails/mails.service';
import { LoginSuperAdminResponse } from './interfaces/login-superadmin-response';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { SuperAdminResponse } from './types/super-admin-response-type';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(SuperAdmin.name) private readonly superAdminModel: Model<SuperAdmin>,
    private readonly jwtService: JwtService,
    private readonly mailsService: MailsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, email, name, ...userData } = createUserDto; 
  
      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        email,
        name, 
        ...userData,
      });
  
      await newUser.save();
  
      await this.mailsService.sendUserConfirmation(name, email);
  
      const { password: _, ...user } = newUser.toJSON();
      return user;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      if (error.code === 11000) {
        throw new BadRequestException(`${createUserDto.email} already exists!`);
      }
  
      throw new InternalServerErrorException('Something horrific happened');
    }
  }

  async register(registerDto: RegisterUserDto): Promise<LoginResponse> {
    const user = await this.create(registerDto);
    return {
      user: user, 
      token: this.getJwtToken({ id: user._id })
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto; 
    const user = await this.userModel.findOne({ email });

    if (!user || !bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('Not valid credentials');
    }

    const { password: _, ...rest } = user.toJSON(); 

    return {
      user: rest, 
      token: this.getJwtToken({ id: user.id }),
    };
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async update(id: string, updateAuthDto: UpdateAuthDto): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, updateAuthDto, {
      new: true,
      runValidators: true,
    });
  }

  getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  async findUserById(id: string) {
    const user = await this.userModel.findById(id); 
    const { password, ...rest } = user.toJSON();
    return rest; 
  }

  async findUserByTelegramId(telegramUserId: string): Promise<User | null> {
    return this.userModel.findOne({ telegramUserId: telegramUserId });
  }

  async updateUserTermsAcceptance(userId: string, accepted: boolean): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { 
      $set: { 
        termsAccepted: accepted,
        termsAcceptedDate: new Date()
      }
    });
  }

  async createOrUpdateUserWithTelegramId(telegramUserId: string, name: string): Promise<User> {
    let user = await this.userModel.findOne({ telegramUserId: telegramUserId });
    if (!user) {
      user = new this.userModel({
        telegramUserId: telegramUserId,
        name: name,
      });
    } else {
      user.name = name;
    }
    await user.save();
    return user;
  }

  async updateUserTelegramId(userId: string, telegramUserId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { telegramUserId: telegramUserId });
  }

  async checkToken() {
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userModel.findOne({ email });
    if (!user) return;
  
    const resetToken = this.jwtService.sign(
      { email: user.email },
      { expiresIn: '15m' }
    );
  
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  
    await user.save();
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    await this.mailsService.sendPasswordReset(user.name, user.email, resetLink);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userModel.findOne({
        email: payload.email, 
        resetPasswordToken: token, 
        resetPasswordExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new BadRequestException('Invalid or expired password reset token');
      }

      user.password = bcryptjs.hashSync(newPassword, 10);
      user.resetPasswordToken = undefined; 
      user.resetPasswordExpires = undefined; 
      await user.save();
    } catch (error) {
      throw new BadRequestException('Invalid or expired password reset token');
    }
  }

  async createSuperAdmin(createSuperAdminDto: CreateSuperAdminDto): Promise<SuperAdminResponse> {
    const { email, password, name, surname } = createSuperAdminDto;
    const hashedPassword = await bcryptjs.hash(password, 10);
  
    const superAdmin = new this.superAdminModel({
      email,
      password: hashedPassword,
      name,
      surname
    });
  
    await superAdmin.save();
  
    const { password: _, ...result } = superAdmin.toJSON();
    return result;
  }

  async loginSuperAdmin(loginDto: LoginDto): Promise<LoginSuperAdminResponse> {
    const { email, password } = loginDto;
    const superAdmin = await this.superAdminModel.findOne({ email });

    if (!superAdmin || !await bcryptjs.compare(password, superAdmin.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = superAdmin.toJSON();
    return {
      superAdmin: result,
      token: this.getJwtToken({ id: superAdmin._id.toString() })
    };
  }

  async deleteUserById(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async banUser( userId: string): Promise<User>{
    const user = await this.userModel.findByIdAndUpdate(
      userId, 
      { isActive: false },
      { new: true }
    );
    if (!user){
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user; 
  }

  async unbanUser(userId: string): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    );
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }
}