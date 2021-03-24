import * as mongoose from 'mongoose';
import {Common} from '../../helpers/common';
import { Role } from '../enums/userRole.enum';

export const User = new mongoose.Schema({
    fullName:{type:String, required: "FullName is Required"},
    phoneNo:{type:String, required:"Phone Number is Required"},
    password:{type:String, required:"Password is Required"},
    emailID:{type:String },
    createdAt: { type: Date, default: Date.now },
    role:{type:Number, validate: Common.EnumValidator(Role) },
    imageurl:{type:String}
});