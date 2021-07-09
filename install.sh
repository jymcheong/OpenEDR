#!/bin/bash

if ! command -v curl &> /dev/null
then
    echo "curl is missing... pls install in order to proceed further"
    exit
fi

if ! command -v docker &> /dev/null
then
    echo "docker is missing... pls install in order to proceed further"
    exit
fi

if ! command -v docker-compose &> /dev/null
then
    echo "docker-compose is missing... pls install in order to proceed further"
    exit
fi

curl -L https://github.com/jymcheong/OpenEDR/tarball/master | tar xz && mv jymcheong* openEDR
cd openEDR && ./installcontainers.sh
