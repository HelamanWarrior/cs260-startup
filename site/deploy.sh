#!/bin/bash

printf "Deploying React bundle startup to startup.plug-world.com\n"

# Step 1
printf "Build the distribution package\n"
rm -rf build
mkdir build
npm install
npm run build
cp -rf dist/* build

# Step 2
printf "Clearing out previous distribution on the target\n"
ssh parker@192.168.1.196 << ENDSSH
rm -rf /home/parker/Docker/Swag/config/www/liquidnotes/
mkdir -p /home/parker/Docker/Swag/config/www/liquidnotes
ENDSSH

# Step 3
printf "Copy the distribution package to the target\n"
scp -r build/* parker@192.168.1.196:/home/parker/Docker/Swag/config/www/liquidnotes

# Step 4 
printf "Removing local copy of the distribution package\n"
rm -rf build
rm -rf dist
