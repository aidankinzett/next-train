'use strict'/*
function to call gmaps directions based off of the two stations, and the
arrival/departure times from API.AI:
    - need to find out how API.AI gives this info, and how to feed it into a function
    - return each step that involves transit, give the line name, colour,
        translink url, arrival time, departure time

*/
module.exports.hello = function(event, context, callback) {
    let body = JSON.parse(event.body);
    let origin = body.result.parameters["stations"][0];
    let destination = body.result.parameters["destinations"][0];

    var googleMapsClient = require('@google/maps').createClient({
      key: 'AIzaSyAdX7G3rvzy-uJ_hLFMiPmw2MLo7Atw3Sc'
    });

    googleMapsClient.directions({
      origin: origin + ", Queensland",
      destination: destination + ", Queensland",
      mode: 'transit'
    }, function(err, response) {
      if (!err) {
         for (let step of response.json.routes[0].legs[0].steps) {
             if (step.travel_mode == "TRANSIT") {
                 var departure_time = step.transit_details.departure_time.text;
                 var arrival_time = step.transit_details.arrival_time.text;
             }
         }
         let result = "The next train that goes from "+ origin +" to "+destination+" leaves at " + departure_time + ", and arrives at " + arrival_time;
         let results = JSON.stringify({"speech":result, "displayText":result});
         callback(null, {"statusCode": 200, "headers": {'Content-Type': 'application/json'} ,"body": results});
    }
    });

};
