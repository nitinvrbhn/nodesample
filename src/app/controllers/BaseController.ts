import { Request, Response } from "express";
import { UserRole } from "@model/enums/userRole.enum";
import { Constant } from "@helper/Constant";
import { message } from "@code/config/message";


export class BaseController {
    constructor() { }

    requestManager(req: Request, res: Response, repoFunction: IRepoFunction, accessCode?: number, checkParam?: boolean): boolean {
        var send;
        send = (code, data) => {
            let response: ICustomResponse = {
                error: "",
                data: "",
                code: code,
                status: "failure"
            }
            if (Math.floor(code / 100) === 2) {
                response.status = "success";
                response.data = data;
            } else {
                if (typeof data === "string") {
                    var parts = data.split(".");
                    if (parts.length === 2 && message[parts[0]] && message[parts[0]][parts[1]]) {
                        response.error = {
                            name: data,
                            message: message[parts[0]][parts[1]]
                        }
                    } else {
                        response.error = {
                            name: "",
                            message: data
                        }
                    }
                } else {
                    response.error = data;
                }
            }
            res.status(code).send(response);
        }
        if (accessCode) {
            let isAuthenticated = false;
            for (let section in Constant.OPERATION_ACCESS) {
                for (let key in Constant.OPERATION_ACCESS[section]) {
                    if (accessCode === Constant.OPERATION_ACCESS[section][key]
                        && req.authToken
                        && req.authToken.access
                        && req.authToken.access[section]) {
                        let accessUnit = Math.pow(2, Constant.OPERATION_ACCESS[section][key] % 100),
                            series = Math.floor(Constant.OPERATION_ACCESS[section][key] / 100);
                        isAuthenticated = Boolean(req.authToken.access[series] & accessUnit);
                    }
                }
            }
            if (req.authToken && req.authToken.role === UserRole.Admin) {
                isAuthenticated = true;
            }
            if (!isAuthenticated) {
                send(403, "base.forbidden");
                return;
            }
        }
        if (checkParam && (!req.authToken || (req.authToken.role !== UserRole.Master && req.params.id !== req.authToken.id))) {
            send(403, "base.forbidden");
            return;
        }
        try {
            repoFunction(req)
                .then((data) => {
                    send(200, data);
                    return true;
                }).catch((err) => {
                    if (typeof err === "string") {
                        send(400, err);
                    } else if (err && err.message) {
                        send(400, err.message);
                    } else {
                        send(err[1] || 400, err[0]);
                    }
                    return false;
                })
        } catch (ex) {
            send(400, ex && ex.message);
            return false;
        }
    }
}