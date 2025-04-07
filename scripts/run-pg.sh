#/usr/bin/env bash

docker run --rm \
    --name pg \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=postgres \
    -p 5432:5432 \
    postgres:17.4-alpine3.21
