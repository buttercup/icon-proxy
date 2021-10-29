# Icon Proxy
> Self-hosted website icon proxy for Buttercup

A self-hosted website icon (favicon) proxy service for use with the [Buttercup password manager](https://buttercup.pw).

This proxy uses an ExpressJS API to receive requests for the icon of a domain, for which it responds with the detected favicon. The proxy scrapes the HTML from the remote **root** page, detecting the best possible icon. Using the proxy will obscure the request from the client (password manager), potentially negating their IP, user-agent and target web page.

This proxy exists for privacy and compatibility. By hosting it you agree that it is entirely your responsibility as to its efficacy, not the maintainer's.

See the [GitHub Repository](https://github.com/buttercup/icon-proxy) or the [Docker Hub page](https://hub.docker.com/r/buttercuppw/icon-proxy).

## Setup

This proxy is designed to be used as a docker image. View the Docker Hub page for installation details.

Currently only the `PORT` option is available. More will follow soon.
