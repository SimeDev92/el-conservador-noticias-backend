import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class User {

    _id?: string; 

    @Prop({ unique: true, required: true })
    email: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    surname: string;

    @Prop({ minlength: 6, required: true })
    password?: string;

    @Prop({ required: false })
    telegramUserId: string; 

    @Prop({ default: true })
    isActive: boolean;
    
    @Prop({ type: [String], default: ['user'] })
    roles: string[];

    @Prop()
    stripeCustomerId?: string;

    @Prop({ type: Boolean, default: false })
    termsAccepted: boolean;

    @Prop({ type: Date })
    termsAcceptedDate: Date;

    @Prop()
    resetPasswordToken?: string;

    @Prop()
    resetPasswordExpires?: Date; 

}

export const UserSchema = SchemaFactory.createForClass(User);