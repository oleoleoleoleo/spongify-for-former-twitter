#!/bin/bash

# Define paths
IMG_DIR="./img"
JS_DIR="./js"
JSON_FILE="./manifest.json"
CHROME_ZIP_OUTPUT="../dist/spongify_chrome.zip"
MOZILLA_ZIP_OUTPUT="../dist/spongify_mozilla.zip"
KEY_TO_REMOVE="browser_specific_settings"

# Ensure the zip package is installed
if ! command -v zip &> /dev/null || ! command -v jq &> /dev/null; then
    echo "Error: 'zip' and 'jq' are required. Install them with 'sudo apt-get install zip jq'."
    exit 1
fi

# create tmp and dist folder
mkdir -p tmp dist

# remove any existing zip file
rm -f "$CHROME_ZIP_OUTPUT" 
rm -f "$MOZILLA_ZIP_OUTPUT" 

# move src/* into tmp and cd into it, so we're free to mutate json
cp -r ./src/* ./tmp/
cd tmp

# create mozilla zip without modifying json
zip -r "$MOZILLA_ZIP_OUTPUT" "$IMG_DIR" "$JS_DIR" "$JSON_FILE"

# create a modified json and then overwrite current one with it (this is tmp folder we'll delete everything afterwards)
jq --arg key "$KEY_TO_REMOVE" 'del(.[$key])' "$JSON_FILE" > tmp_json && mv tmp_json "$JSON_FILE"

# create chrome zip with modified json
zip -r "$CHROME_ZIP_OUTPUT" "$IMG_DIR" "$JS_DIR" "$JSON_FILE"

# cd out of tmp, delete it
cd ..
rm -rf ./tmp

echo "Successfully created $CHROME_ZIP_OUTPUT and $MOZILLA_ZIP_OUTPUT"