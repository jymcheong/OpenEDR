#!/bin/bash
if [[ "$1" == *.uploaded ]]; then
   f=${1/".uploaded"/""}
   mv $f /home/tobeinserted
   mv $1 /home/tobeinserted
fi
