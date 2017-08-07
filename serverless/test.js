
// console.log(event); // Contains incoming request data (e.g., query params, headers and more)
var event = `{
  "id": "253ada66-123b-4feb-98d6-d28ee7efd9f2",
  "timestamp": "2017-08-07T13:56:33.268Z",
  "lang": "en",
  "result": {
    "source": "agent",
    "resolvedQuery": "what about after that",
    "action": "",
    "actionIncomplete": false,
    "parameters": {
      "after": "true",
      "destinations": [
        "Roma Street station"
      ],
      "stations": [
        "Springfield Station"
      ]
    },
    "contexts": [
      {
        "name": "fromto",
        "parameters": {
          "date": "",
          "time.original": "",
          "stations1": [],
          "last": "",
          "ordinal.original": "",
          "destinations.original": "",
          "date.original": "",
          "destinations": [
            "Roma Street station"
          ],
          "after.original": "",
          "stations": [
            "Springfield Station"
          ],
          "stations.original": "",
          "last.original": "",
          "departure-or-arrival-time.original": "",
          "stations1.original": "",
          "after": "true",
          "time": "",
          "departure-or-arrival-time": "depart",
          "ordinal": ""
        },
        "lifespan": 4
      }
    ],
    "metadata": {
      "intentId": "7b3b68c8-87d6-4979-a068-e2f668bc466a",
      "webhookUsed": "false",
      "webhookForSlotFillingUsed": "false",
      "intentName": "after-that"
    },
    "fulfillment": {
      "speech": "",
      "messages": [
        {
          "type": 0,
          "speech": ""
        }
      ]
    },
    "score": 1
  },
  "status": {
    "code": 200,
    "errorType": "success"
  },
  "sessionId": "b8b684ad-63e6-41fa-9d00-c2f1ca314b25"
}`;

var special = ['zeroth','first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
var deca = ['twent', 'thirt', 'fort', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];

function stringifyNumber(n) {
  if (n < 20) return special[n];
  if (n%10 === 0) return deca[Math.floor(n/10)-2] + 'ieth';
  return deca[Math.floor(n/10)-2] + 'y-' + special[n%10];
}

let body = JSON.parse(event);
let origin = body.result.parameters["stations"][0];
let destination = body.result.parameters["destinations"][0];
let after = (body.result.parameters["after"] == "true");
var moment = require('moment');
var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyAdX7G3rvzy-uJ_hLFMiPmw2MLo7Atw3Sc'
});

function findTimes(err, response) {
    var transit_steps = [];
    for (let step of response.json.routes[0].legs[0].steps) {
        if (step.travel_mode == "TRANSIT") {
            transit_steps.push(step);
        }
    }

    if (transit_steps.length == 1) {
        for (let step of transit_steps) {
            var departure_time = step.transit_details.departure_time.text;
            var arrival_time = step.transit_details.arrival_time.text;

        }
        let result = "Train leaves at " + departure_time + ", and arrives at " + arrival_time;
        let results = JSON.stringify({"speech":result, "displayText":result});
        let facebook_message = JSON.stringify(`"buttons":[
                                     {
                                       "type":"web_url",
                                       "url":"https://aidankinzett.com",
                                       "title":"View Item",
                                       "webview_height_ratio": "compact"
                                     }
                                 ]`);

         console.log(results);
   } else {

        if (transit_steps.length == 2) {
            var result = "There is " + (transit_steps.length - 1) + " transfer for this trip. ";
        } else {
            var result = "There are " + (transit_steps.length - 1) + " transfers for this trip. ";
        }

        for (var i = 0; i < 2; i++) {
            let info = transit_steps[i].transit_details;
            var ordinal = stringifyNumber(i+1);
            result += "The " + ordinal + " train leaves " + info.departure_stop.name + " at " + info.departure_time.text +
            " and gets to " + info.arrival_stop.name + " at " + info.arrival_time.text + ". ";
        }

        var results = JSON.stringify({"speech":result, "displayText":result});
        console.log(results);
        }
}

googleMapsClient.directions({
  origin: origin + ", Queensland",
  destination: destination + ", Queensland",
  mode: 'transit',
  alternatives: true
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
          departure_time.add(10, 'm');

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
