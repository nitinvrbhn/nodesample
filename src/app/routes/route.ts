import { Request, Response } from 'express';
import { UserController } from '../controllers/UserController';
import { UserRepository } from '../repositories/UserRepository';
import { Authentication } from '../authentication/Authentication';
import { MediaController } from '../controllers/MediaController';



export class Route {
    userController: UserController = new UserController(new UserRepository());
    authenticationInstance: Authentication = new Authentication();
    mediaController: MediaController = new MediaController();
    constructor() { }
    public routes(app): void {
        app.route('/')
            .get((req: Request, res: Response) => {
                res.status(200).send({
                    message: 'Server request successfulll!!!!'
                })
            });

        app.route('/user')
            .post(this.userController.post)
            .put(this.authenticationInstance.authenticate, this.userController.updateUserInfo);
        app.route('/user/login')
            .post(this.userController.login);

        /** All routes goes here */

    }

}