#!/bin/bash

if ! command -v docker-compose &> /dev/null
then
    echo "docker and docker-compose must be installed"
    exit 1
fi

docker-compose up -d