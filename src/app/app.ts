/**
 * File defines the properties of API
 */
import * as express from "express";
import * as bodyParser from "body-parser";
import * as mongoose from "mongoose";
import * as path from "path";
import { Route } from "./routes/Route";
import { config } from "@code/config/config";
import * as fs from "fs";
// import { DaemonMaster } from "@code/daemon/DaemonMaster";

class App {

    public app: express.Application;
    public routePrv: Route = new Route();
    // public daemonRunner: DaemonMaster = new DaemonMaster();

    constructor() {
        this.init();
    }
    init() {
        this.app = express();
        this.config();
        this.routePrv.routes(this.app);
        this.mongoSetup();
        // this.daemonRunner.init();
    }

    private config(): void {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        // serving static files 
        // this.app.use(express.static('public'));
        this.app.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization,Origin,Accept');
            next();
        });
        this.app.use('/assets', express.static(path.join(__dirname, '../../../src/assets')));
        // this.app.use('/api-doc', express.static(path.join(__dirname,'../../../src/assets/api-doc.json')));
        this.app.get('/logs', this.getRecordFiles);
        this.app.get('/errors', this.getRecordFiles);
        this.app.get('/logs/:lastNumber', this.getRecordFiles);
        this.app.get('/errors/:lastNumber', this.getRecordFiles);
        this.app.get('/api-doc', function (req, res) {
            res.redirect(config.documentation);
            res.end();
        });
    }

    private mongoSetup(): void {
        (<any>mongoose).Promise = global.Promise;
        mongoose.connect(config.mongodb, { useNewUrlParser: true });
        mongoose.set('useCreateIndex', true);
        mongoose.set("debug", false);
    }

    private getRecordFiles(req, res) {
        var date = new Date(),
            filePath,
            forLog = req.path.indexOf('logs') !== -1;
        if (req.params.lastNumber) {
            if (req.params.lastNumber === 'last') {
                if (forLog) {
                    date.setUTCDate(date.getUTCDate() - 1);
                } else {
                    date.setUTCMonth(date.getUTCMonth() - 1);
                }
            } else {
                if (parseInt(req.params.lastNumber) !== 0 && Boolean(parseInt(req.params.lastNumber))) {
                    if (forLog) {
                        date.setUTCDate(date.getUTCDate() - parseInt(req.params.lastNumber));
                    } else {
                        date.setUTCMonth(date.getUTCMonth() - parseInt(req.params.lastNumber));
                    }
                } else {
                    res.send(400);
                    return;
                }
            }
        }
        if (forLog) {
            filePath = path.join(__dirname, '../../../src/scribble/logs/log_' + date.getUTCDate() + "_" + date.getUTCMonth() + "_" + date.getUTCFullYear() + ".txt");
        } else {
            filePath = path.join(__dirname, '../../../src/scribble/errors/error_' + date.getUTCMonth() + "_" + date.getUTCFullYear() + ".txt");
        }
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.send(404);
        }
    }

}

export default new App().app;