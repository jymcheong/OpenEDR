#!/bin/bash
curl -L https://github.com/jymcheong/OpenEDR/tarball/master | tar xz && mv jymcheong* openEDR && cd openEDR && ./installcontainers.sh