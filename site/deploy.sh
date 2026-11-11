#!/bin/sh
set -eu

service="startup"
host="parker@freenas.home.lan"
dest="Docker/cs260/services/${service}"
compose_dir="Docker/cs260"

# Clean up local build files however the script ends, even on failure
trap 'rm -rf build dist' EXIT

# Step 1
printf "\n----> Build the distribution package\n"
rm -rf build
mkdir build
npm install # make sure vite is installed so that we can bundle
npm run build # build the React front end
cp -rf dist build/public # move the React front end to the target distribution

# Copy the backend service, preserving its module folder structure
# Secrets, local deps, the model, tests, and docs are left behind.
rsync -a \
  --exclude 'node_modules' --exclude 'models' \
  --exclude '.env' --exclude '.env.example' \
  --exclude 'tests' --exclude '*.test.js' \
  --exclude 'README-secrets.md' \
  service/ build/

# Step 2
printf "\n----> Sending the distribution package to the target\n"
ssh "$host" "mkdir -p ${dest}"
rsync -az --delete \
  --exclude 'node_modules' --exclude 'models' --exclude '.env' \
  build/ "${host}:${dest}/"

# Step 3
printf "\n----> Copy the transcription model\n"
ssh "$host" "mkdir -p ${dest}/models"
rsync -ah --partial --progress \
  service/models/nemotron-speech-streaming-en-0.6b-Q8_0.gguf \
  parker@freenas.home.lan:${dest}/models/

# Step 3
printf "\n----> Deploy the service on the target\n"
ssh "$host" "cd ${compose_dir} && docker compose up -d --force-recreate ${service}-service"

# Step 4
printf "\n----> Recent logs\n"
sleep 5
ssh "$host" "cd ${compose_dir} && docker compose logs --tail=20 ${service}-service"
