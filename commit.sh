#!/bin/sh
if [ $# -gt 0 ]
then
    git add *
    git commit -m "$1"
    git push origin master
else
    echo "Enter commit message"
fi