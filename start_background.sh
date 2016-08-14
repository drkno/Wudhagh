#!/bin/bash

nohup node wudhagh.js & disown 2>&1 > /dev/null
exit 0