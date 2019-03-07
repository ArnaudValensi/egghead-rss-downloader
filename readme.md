# Egghead RSS Downloader

A little script to download egghead's videos from course RSS file.
The RSS files are only available for pro accounts.
This script only allows course RSS files and not "watch later" for example.

No credentials needed.

## How To

- Download a course rss file.
- Clone this repo
- `cd egghead-rss-downloader`
- `yarn install` or `npm install`
- `node index.js <rss_file.xml>`

Your videos will be available in `./videos/<course name>/`.
