// console.log(event); // Contains incoming request data (e.g., query params, headers and more)
let origin = "springfield central station";
let destination = "central station";

var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyAdX7G3rvzy-uJ_hLFMiPmw2MLo7Atw3Sc'
});

var departure_time = "bad";
var arrival_time = "bad";

googleMapsClient.directions({
  origin: origin + ", Queensland",
  destination: destination + ", Queensland",
  mode: 'transit'
}, function(err, response) {
  if (!err) {
     for (let step of response.json.routes[0].legs[0].steps) {
         if (step.travel_mode == "TRANSIT") {
             departure_time = step.transit_details.departure_time.text;
             arrival_time = step.transit_details.arrival_time.text;
             console.log(departure_time);
             console.log(arrival_time);
         }
     }
     let result = "Train leaves at " + departure_time + ", and arrives at " + arrival_time;
     let results = JSON.stringify({"speech":result, "displayText":result});

     console.log(results);
}
});
