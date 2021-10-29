import express from "express";
import { monotonicFactory } from "ulidx";
import onFinished from "on-finished";
import { createIconRouter } from "./controllers/icon";
import { handleError } from "./controllers/error";
import { getLogger } from "./logging";

export function buildApp(): express.Application {
    const ulid = monotonicFactory();
    const app = express();
    const log = getLogger();
    app.disable("x-powered-by");
    app.use(express.json());
    app.use((req, res, next) => {
        req.id = ulid();
        req.log = log.child({
            requestID: req.id
        });
        if (/^(HEAD|OPTIONS)$/i.test(req.method) === false) {
            req.log.info(
                {
                    requestURL: req.originalUrl,
                    requestMethod: req.method
                },
                "new_request"
            );
        }
        next();
    });
    createRoutes(app);
    return app;
}

function createRoutes(app: express.Application) {
    handleMisc(app);
    app.use("/icon", createIconRouter());
    app.use(handleError);
}

function handleMisc(app: express.Application) {
    app.get("/", (req, res) => {
        res.set("Content-Type", "application/json")
            .set("Cache-Control", "no-store")
            .send(
                JSON.stringify({
                    status: "ok",
                    time: new Date().toUTCString()
                })
            );
    });
    app.get("/robots.txt", (req, res) => {
        res.status(200)
            .set("Content-Type", "text/plain")
            .set("Cache-Control", "public, max-age=900, must-revalidate")
            .send(`User-agent: *\nDisallow: /\n`);
    });
    app.get("/humans.txt", (req, res) => {
        res.status(200)
            .set("Content-Type", "text/plain")
            .set("Cache-Control", "public, max-age=900, must-revalidate")
            .send(
                `This is an icon proxy service, designed to return website fav-icons to Buttercup (a password manager).`
            );
    });
}
