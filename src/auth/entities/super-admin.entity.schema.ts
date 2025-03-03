import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class SuperAdmin {
    @Prop({ unique: true, required: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    surname: string;
}

export const SuperAdminSchema = SchemaFactory.createForClass(SuperAdmin);