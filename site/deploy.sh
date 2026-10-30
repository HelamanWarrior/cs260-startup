#!/bin/sh

service="startup"

# Step 1
printf "\n----> Build the distribution package\n"
rm -rf build
mkdir build
npm install # make sure vite is installed so that we can bundle
npm run build # build the React front end
cp -rf dist build/public # move the React front end to the target distribution
cp service/*.js build # move the back end service to the target distribution
cp service/*.json build

# Step 2
printf "\n----> Clearing out previous distribution on the target\n"
ssh -i "$key" parker@freenas.home.lan << ENDSSH
rm -rf ~/Docker/cs260/services/${service}
mkdir -p ~/Docker/cs260/services/${service}
ENDSSH

# Step 3
printf "\n----> Copy the distribution package to the target\n"
scp -r -i "$key" build/* parker@freenas.home.lan:~/Docker/cs260/services/$service

# Step 4
printf "\n----> Deploy the service on the target\n"
ssh -i "$key" parker@freenas.home.lan << ENDSSH
cd ~/Docker/cs260
docker compose restart
ENDSSH

# Step 5
printf "\n----> Removing local copy of the distribution package\n"
rm -rf build
rm -rf dist

