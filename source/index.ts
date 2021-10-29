import { buildApp } from "./app";
import { getLogger } from "./logging";

const { PORT } = process.env;

async function start() {
    getLogger().info(
        {
            port: parseInt(PORT, 10)
        },
        "starting"
    );
    const app = buildApp();
    app.listen(PORT, () => {
        getLogger().info(
            {
                port: parseInt(PORT, 10)
            },
            "started"
        );
    });
}

start().catch(err => {
    getLogger().error(err);
    process.exit(1);
});
