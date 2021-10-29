import bunyan from "bunyan";

const { LOG_FILE } = process.env;

let __logger: any;

export function getLogger() {
    if (__logger) return __logger;
    const config: any = {
        name: "icon-proxy",
        streams: [
            {
                stream: process.stdout,
                level: "info"
            }
        ]
    };
    if (LOG_FILE) {
        config.streams.push({
            path: LOG_FILE,
            level: "info",
            type: "rotating-file",
            period: "1d"
        });
    }
    __logger = bunyan.createLogger(config);
    return __logger;
}
