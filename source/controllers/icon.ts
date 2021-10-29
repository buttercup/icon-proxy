import express from "express";
import createRouter from "express-promise-router";
import isValidDomain from "is-valid-domain";
import { Layerr } from "layerr";
import { getIcon } from "../library/page";
import { ERR_DOMAIN_INVALID, ERR_DOMAIN_NO_ICON } from "../symbols";

const { CACHE_CONTROL } = process.env;

export function createIconRouter(): express.Router {
    const router = createRouter();
    router.get("/:domain", handleIconRequest);
    return router;
}

async function handleIconRequest(req: express.Request, res: express.Response) {
    const { domain } = req.params;
    if (!domain || !isValidDomain(domain)) {
        throw new Layerr({
            info: {
                domain,
                code: ERR_DOMAIN_INVALID
            }
        }, "Invalid domain");
    }
    const icon = await getIcon(domain);
    if (!icon) {
        throw new Layerr({
            info: {
                domain,
                code: ERR_DOMAIN_NO_ICON
            }
        }, "No icon found");
    }
    res.status(200)
        .set("Cache-Control", CACHE_CONTROL)
        .set("Content-Type", icon.mime || "application/octet-stream")
        .set("Content-Length", icon.data.length.toString())
        .set("X-Icon-Ext", icon.ext)
        .send(icon.data);
}
