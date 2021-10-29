#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Building and deploying docker image";

cd $DIR/..

PACKAGE_VERSION=$(node -e "console.log(require('./package.json').version)")
echo " • Package version: ${PACKAGE_VERSION}"

DOCKER_PREFIX="buttercuppw/icon-proxy"
export TAG_VER=$DOCKER_PREFIX:v${PACKAGE_VERSION}
export TAG_LATEST=$DOCKER_PREFIX:latest

echo " • Building"
# docker build --build-arg ENV=$ENVIRONMENT -t $TAG .
docker build -t $TAG_VER -t $TAG_LATEST .

echo " • Pushing"
docker push $TAG_VER
docker push $TAG_LATEST

echo "Done"

cd -
