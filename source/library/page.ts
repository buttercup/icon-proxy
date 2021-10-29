import { strict as assert } from "assert";
import { parse as parseURL, resolve as resolveURL } from "url";
import fetch from "node-fetch";
import { fromBuffer as fileType } from "file-type";
import { parseFragment } from "parse5";
import { Attributes, FetchedIcon, HeadInfo, ProcessedIcon } from "../types";

const ICON_REL = /(apple-touch-icon|\bicon\b)/;
const EXT_WHITELIST = ["jpg", "png", "gif", "ico", "bmp", "svg"];

async function fetchIconData(url: string): Promise<Buffer> {
    const result = await fetch(url);
    return result.buffer();
}

function fetchLinkAttributes(linkHTML: string): Attributes {
    const struct = parseFragment(linkHTML).childNodes[0];
    const attributes =
        (struct &&
            // @ts-ignore
            struct.attrs &&
            // @ts-ignore
            struct.attrs.reduce((output, nextAttr) => {
                output[nextAttr.name] = nextAttr.value;
                return output;
            }, {})) ||
        {};
    return attributes;
}

function getBaseURL(url: string): string {
    const { protocol, host } = parseURL(url);
    return `${protocol}//${host}`;
}

async function getHeadInfo(url: string): Promise<HeadInfo> {
    let result;
    try {
        result = await fetch(url, {
            method: "HEAD"
        });
        assert(result.status !== 405);
    } catch (err) {
        result = await fetch(url);
    }
    return {
        status: result.status,
        statusText: result.statusText,
        headers: result.headers.raw()
    };
}

export async function getIcon(domain: string): Promise<ProcessedIcon | null> {
    const pageURL = await resolvePageURL(domain);
    if (!pageURL) return null;
    const icons = await getIcons(pageURL);
    const [icon] = icons;
    if (icon) {
        const iconData = await fetchIconData(icon.url);
        const dataType = await fileType(iconData);
        const urlParts = icon.url.split(".");
        const origExt = urlParts[urlParts.length - 1];
        if (
            !!dataType &&
            (EXT_WHITELIST.indexOf(dataType.ext) >= 0 || EXT_WHITELIST.indexOf(origExt) >= 0)
        ) {
            return Object.assign(icon, { data: iconData }, dataType);
        }
    }
    return null;
}

async function getIcons(url: string): Promise<Array<FetchedIcon>> {
    return getRawLinks(url).then(links => {
        const icons = links
            .filter(link => ICON_REL.test(link.rel || ""))
            .map(link => ({
                url: processIconHref(url, link.href),
                size: processIconSize(link.sizes)
            }));
        icons.push({
            url: `${getBaseURL(url)}/favicon.ico`,
            size: 0
        });
        return icons.sort((iconA, iconB) => {
            if (iconA.size > iconB.size) {
                return -1;
            } else if (iconB.size > iconA.size) {
                return 1;
            }
            return 0;
        });
    });
}

async function getPageSource(url: string): Promise<string> {
    const result = await fetch(url);
    return result.text();
}

async function getRawLinks(url: string): Promise<Array<Attributes>> {
    const linkRexp = /<link(\s|[^\s>]+)+(\/>|>)/gi;
    const source = await getPageSource(url);
    const linkEls = [];
    let match: RegExpMatchArray;
    while ((match = linkRexp.exec(source))) {
        linkEls.push(match[0]);
    }
    return linkEls.map(linkEl => fetchLinkAttributes(linkEl));
}

function processIconHref(page: string, url: string): string {
    if (/^https?:\/\//i.test(url) !== true) {
        return resolveURL(page, url);
    }
    return url;
}

function processIconSize(size: string): number {
    const targetSize = size || "";
    const [width] = targetSize.split(/x/i);
    return (width && parseInt(width, 10)) || 0;
}

async function resolvePageURL(domain: string): Promise<string | null> {
    const tryURL = async (url: string) => {
        const info = await getHeadInfo(url);
        assert.ok(info.status >= 200 && info.status < 300, `Status code invalid: ${info.status}`);
        assert.ok(
            /text\/html/.test(info.headers["content-type"]),
            `Invalid content type: ${info.headers["content-type"]}`
        );
    };
    let wip = `https://${domain}`;
    try {
        await tryURL(wip);
        return wip;
    } catch (err1) {
        wip = `http://${domain}`;
        try {
            await tryURL(wip);
            return wip;
        } catch (err2) {}
    }
    return null;
}
