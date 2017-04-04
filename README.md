# Udacity FSND 6th Project: Neighbourhood Map
A project for Javascript Design Pattern course. It's an app that provides interactive information about an area using google street view, knockout.js and an API-of-choice (to be added later).

## Table of Contents
- Pre-requisites
- Installation
- Usage

## Pre-requisites
- Google App Engine

## Installation
### Downloading Project Files
1. Navigate to a directory of choice
2. Download the repository
```
git clone https://github.com/hyungmogu/udacity-neighbourhood-map
```

### Setting up Google Map API
1. Follow [this](https://developers.google.com/maps/documentation/javascript/get-api-key) instruction, and obtain a key
2. Navigate to the folder containing `index.html`
```
cd <PROJECT REPO>/neighborhood-map/
```
3. Open `app.js`, and replace `<INSERT GOOGLE MAP API KEY HERE>` with the key from step 1

### Setting up Eventbrite API
1. Follow [this](https://www.eventbrite.com/support/articles/en_US/How_To/how-to-locate-your-eventbrite-api-user-key?lg=en_US) instruction, and obtain a key
2. Navigate to the folder containing `app.js`
```
cd <PROJECT REPO>/neighborhood-map/static/js/
```
3. Open `app.js`, and replace `<INSERT EVENTBRITE API KEY HERE>` with the key from step 1

## Usage 
### Viewing Demo
1. Navigate to `<PROJECT_REPO>/neighborhood_map/`
2. Start Google App Engine local server
```
dev_appserver.py app.yaml
``` 

### Closing Server
1. Press `Ctrl` + `c` in window where the local server is running
