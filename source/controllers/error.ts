import express from "express";
import { Layerr } from "layerr";
import {
    ERR_DOMAIN_INVALID,
    ERR_DOMAIN_NO_ICON
} from "../symbols";

export function handleError(
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) {
    let responseCode = 500,
        responseText = "Internal server error";
    const errorInfo = Layerr.info(err);
    const { code = null, found = null, responseHeaders = null } = errorInfo;
    switch (code) {
        case ERR_DOMAIN_INVALID:
            responseCode = 400;
            responseText = "Bad request";
            break;
        case ERR_DOMAIN_NO_ICON:
            responseCode = 404;
            responseText = "Not found";
            break;
    }
    if (responseCode === 500 && found === false) {
        // Most likely a database error where a result wasn't found,
        // so change to 404
        responseCode = 404;
        responseText = "Not found";
        req.log.info("requested_resource_not_found");
    }
    if (responseCode === 500) {
        req.log.error(
            {
                errorCode: code,
                errorInfo,
                errorStack: Layerr.fullStack(err),
                responseCode,
                responseText
            },
            "request_error"
        );
    } else {
        req.log.info(
            {
                errorCode: code,
                errorInfo,
                errorStack: Layerr.fullStack(err),
                responseCode,
                responseText
            },
            "request_failed"
        );
    }
    if (responseHeaders && typeof responseHeaders === "object") {
        Object.keys(responseHeaders).forEach(hdr => {
            res.set(hdr, responseHeaders[hdr]);
        });
    }
    res.status(responseCode)
        .set("Content-Type", "text/plain")
        .send(responseText);
}
