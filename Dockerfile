FROM node:14

ARG PORT=10000
ENV PORT=$PORT

# Setup directories
RUN mkdir -p /data
WORKDIR /data

# Init project
COPY package.json package-lock.json tsconfig.json /data/
COPY source /data/source
RUN npm install && npm run build && npm prune --production && rm -r /data/source

# Copy assets
COPY scripts/start.sh /data/

EXPOSE $PORT

ENTRYPOINT [ "/data/start.sh" ]
