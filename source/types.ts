import type { ULID } from "ulidx";
import * as Logger from "bunyan";

declare global {
    namespace Express {
        export interface Request {
            id?: ULID;
            log?: Logger;
        }
    }
}

export interface Attributes {
    [attribute: string]: string;
}

export interface FetchedIcon {
    url: string;
    size: number;
}

export interface Headers {
    [key: string]: string;
}

export interface HeadInfo {
    status: number;
    statusText: string;
    headers: Headers;
}

export interface ProcessedIcon extends FetchedIcon {
    data: Buffer;
    ext: string;
    mime: string;
}
