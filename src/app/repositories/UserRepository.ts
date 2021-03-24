import { Common } from '../helpers/common';
import { UserInstance } from "../helpers/MongoInstance";
import { UserInfoModel } from '../models/UserInfoModel';
import { JWTService } from '../authentication/JWTService';
import { Role } from '../models/enums/userRole.enum';
import { mediaManager } from '../services/MediaMangerService';
import { response } from 'express';



export class UserRepository {
    jwtService: JWTService;
    constructor() {
        this.jwtService = new JWTService();
    }

    // Registers a User and Vendor
    public post(req: Request): Promise<any> {
        return new Promise((success, error) => {
            UserInstance.find({$and: [{ phoneNo: req.body.phoneNo },{vendorToken:req.body.vendorToken}]}, Common.mongoCallBk(error, response => {
                if (response.length > 0) {
                    error(["user already exist", 405]);
                }
                else {
                    if (!req.body.vendorToken) {
                        req.body.vendorToken = Common.randomNumber(6);
                    }
                    let user = new UserInstance(req.body);
                    user.save(Common.mongoCallBk(error, rUser => {
                        success(rUser._id);
                    }));
                }
            }))
        })

    }
    //Logs in the User And Vendor And Genrate JWT AuthToken 
    public login = (req: Request): Promise<any> => {
        return Common.loadPromise((success, error) => {
            UserInstance.findOne({ phoneNo: req.body.phoneNo }, Common.mongoCallBk(error, response => {
                if (response !== null) {
                    if (response.password === req.body.password) {
                        let user = Common.LoadModel(response, UserInfoModel);
                        user.token = this.jwtService.sign({
                            id: response._id.toString(),
                            role: response.role,
                            phoneNo: response.phoneNo
                        });
                        success(user);
                    } else {
                        error(["Password mismatch", 400]);
                    }
                }
                else {
                    error(["User Not Found", 404]);
                }

            }))
        })
    }
    //Update User Information 
    public updateUserInfo = (req: Request): Promise<any> => {
        return Common.loadPromise((success, error) => {
            if (req.body) {
                UserInstance.updateOne({ _id: req.authToken.id }, req.body, Common.mongoCallBk(error, response => {
                    success(Boolean(response.nModified && response.ok));
                }))
            }
            else {
                error(['No Changes Required', 404]);
            }
        })
    }

    /** User API logic goes here */

}