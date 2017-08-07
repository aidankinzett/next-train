'use strict'/*
function to call gmaps directions based off of the two stations, and the
arrival/departure times from API.AI:
    - need to find out how API.AI gives this info, and how to feed it into a function
    - return each step that involves transit, give the line name, colour,
        translink url, arrival time, departure time

*/
var special = ['zeroth','first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
var deca = ['twent', 'thirt', 'fort', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];

function stringifyNumber(n) {
  if (n < 20) return special[n];
  if (n%10 === 0) return deca[Math.floor(n/10)-2] + 'ieth';
  return deca[Math.floor(n/10)-2] + 'y-' + special[n%10];
}

module.exports.hello = function(event, context, callback) {
    function findTimes(err, response) {
        var transit_steps = [];
        for (let step of response.json.routes[0].legs[0].steps) {
            if (step.travel_mode == "TRANSIT") {
                transit_steps.push(step);
            }
        }

        if (transit_steps.length == 1) {
            let info = transit_steps[0].transit_details

            let result = "The next train leaves " + info.departure_stop.name + " at " + info.departure_time.text +
                         " and gets to " + info.arrival_stop.name + " at " + info.arrival_time.text +
                         ", on line " + info.line.short_name + ".";

            let results = JSON.stringify({"speech":result, "displayText":result});
            callback(null, {"statusCode": 200, "headers": {'Content-Type': 'application/json'} ,"body": results});
        } else {
            if (transit_steps.length == 2) {
                var result = "There is a transfer for this trip. ";
            } else {
                var result = "There are " + (transit_steps.length - 1) + " transfers for this trip. ";
            }

            for (var i = 0; i < 2; i++) {
                let info = transit_steps[i].transit_details;
                var ordinal = stringifyNumber(i+1);
                result += "The " + ordinal + " train leaves " + info.departure_stop.name + " at " + info.departure_time.text +
                " and gets to " + info.arrival_stop.name + " at " + info.arrival_time.text +
                ", on line " + info.line.short_name + ". ";
            }

            var results = JSON.stringify({"speech":result, "displayText":result});

            callback(null, {"statusCode": 200, "headers": {'Content-Type': 'application/json'} ,"body": results});
            }
    }

    let body = JSON.parse(event.body);
    let origin = body.result.parameters["stations"][0];
    let destination = body.result.parameters["destinations"][0];
    let after = (body.result.parameters["after"] == "true");


    var googleMapsClient = require('@google/maps').createClient({
      key: 'AIzaSyAdX7G3rvzy-uJ_hLFMiPmw2MLo7Atw3Sc'
    });

    googleMapsClient.directions({
      origin: origin + ", Queensland",
      destination: destination + ", Queensland",
      mode: 'transit',
      transit_mode: 'train'
    }, function(err, response) {
      if (!err) {
          if (after) {
              var transit_steps = [];
              for (let step of response.json.routes[0].legs[0].steps) {
                  if (step.travel_mode == "TRANSIT") {
                      transit_steps.push(step);
                  }
              }
              var departure_time = require('moment')(transit_steps[0].transit_details.departure_time.text, "hh:mma");
              departure_time.add(10, 'minutes');
              departure_time.add(14, 'hours');
              departure_time.local();
              googleMapsClient.directions({
                origin: origin + ", Queensland",
                destination: destination + ", Queensland",
                mode: 'transit',
                alternatives: true,
                departure_time: departure_time.unix()
              }, function(err, response) {
                  findTimes(err, response);
              });

         } else {
             findTimes(err, response);
         }
         }
    }
    );
};
