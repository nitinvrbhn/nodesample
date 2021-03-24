import { Response } from 'express';
import { BaseController } from '../controllers/BaseController';
import { UserRepository } from '../repositories/UserRepository';





export class UserController extends BaseController {
    constructor(private repo: UserRepository) {
        super();
    }

    post = (req: Request, res: Response) => {
        this.requestManager(req, res, this.repo.post);
    }
    login = (req: Request, res: Response) => {
        this.requestManager(req, res, this.repo.login);
    }
    updateUserInfo = (req:Request, res:Response) =>{
        this.requestManager(req, res, this.repo.updateUserInfo);
    }
}