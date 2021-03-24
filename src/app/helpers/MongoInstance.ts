import * as mongoose from "mongoose";
import {User} from '../models/collections/User';
import { MediaDeletionQueue } from "../models/collections/MediaDeletionQueue";




export const MongoInstance:IMongoInstance = mongoose;

export const UserInstance = mongoose.model('user', User);
export const MediaDeletionQueueInstance = mongoose.model('mediaDeletionQueue', MediaDeletionQueue);
