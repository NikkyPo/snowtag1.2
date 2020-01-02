/**
 * @returns {{initialize: Function, focus: Function, blur: Function}}
 */
geotab.addin.snowtag = () => {
  "use strict";

  let api;

  let map;
  let checkedCbs;
  let snowMapLayer;
  let ids;
  let option;
  let newCoords;
  let elVehicleSelect;
  let elDateFromInput;
  let elDateToInput;
  let elError;
  let elLoading;
  /**
   * Display error message
   * @param {string} message - The error message.
   */
  let errorHandler = message => {
    elError.innerHTML = message;
  };

  /**
   * Toggle loading spinner
   * @param {boolean} show - [true] to display the spinner, otherwise [false].
   */
  let toggleLoading = show => {
    if (show) {
      elLoading.style.display = "block";
    } else {
      setTimeout(() => {
        elLoading.style.display = "none";
      }, 600);
    }
  };


//returns color based on id properties
  let getColor = d => {
    return d == d.match(/b2B/gi) ? redIcon :
           d == d.match(/b2A/gi) ? greenIcon :
           d == d.match(/b29/gi) ? blueIcon :
           d == d.match(/[3-4]/gi) ? orangeIcon :
           d == d.match(/[5-6]/gi) ? yellowIcon :
           d == d.match(/[7-8]/gi) ? violetIcon :
           d == d.match(/[9]/gi) ? greyIcon :
                                 blackIcon;
  };

  // let getColor = d => {
  //   return d == d.match(/[ahov30]$/gi) ? redIcon :
  //          d == d.match(/[bipw4]$/gi) ? greenIcon :
  //          d == d.match(/[cjqx5]$/gi) ? blueIcon :
  //          d == d.match(/[dkry6]$/gi) ? orangeIcon :
  //          d == d.match(/[elsz7]$/gi) ? yellowIcon :
  //          d == d.match(/[fmt18]$/gi) ? violetIcon :
  //          d == d.match(/[gnu29]$/gi) ? greyIcon :
  //                                blackIcon;
  // };
// markers

  let markerShadow = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png";
  let blueIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  let redIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  let greenIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  let orangeIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  let yellowIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  let violetIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  let greyIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  let blackIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png",
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });





  /**
   * Displays the snowtags of a vehicle location history
   */
  let displaySnowMap = function () {
    let deviceId = ids;
    let fromValue = elDateFromInput.value;
    let toValue = elDateToInput.value;

    errorHandler("");

    if ((deviceId === null) || (fromValue === "" ) || (toValue === "")) {
      return;
    }

    toggleLoading(true);

    let dateFrom = new Date(fromValue).toISOString();
    let dateTo = new Date(toValue).toISOString();

    /**Calls Exceptions using users previous date selections**/
    api.call("Get", {
           "typeName": "ExceptionEvent",
           "search": {
               "deviceSearch": {
                   "id": deviceId
               },
               "ruleSearch": {
                   "id": "a1wrQ3PBsTUuNVZ7cqjCjHA",
                   "includeZoneStopRules": false
               },
               "fromDate": dateFrom,
               "toDate": dateTo
         }
       }, function(exception) {
         let coordinates = [];
         let bounds = [];
          if (exception.length === 0) {
            for (let input of document.querySelectorAll('#vehicles input[type="checkbox"]')) {
              if(input.value === deviceId){
                errorHandler("Not enough data for " + input.name);
                toggleLoading(false);
              }
            }
          }
          for (var i = 0; i < exception.length; i++){
               logRecord(exception[i],coordinates,bounds,exception.length);
          }
       });
    /**Calls logRecords from exception event**/
   function logRecord(exception,coordinates,bounds,expectedCount) {
       api.call("Get", {
           "typeName": "LogRecord",
           "search": {
               "fromDate": exception.activeFrom,
               "toDate": exception.activeTo,
               "deviceSearch": {
                   "id": exception.device.id
               }
           }
       }, logRecords => {
         coordinates.push({
           lat: logRecords[0].latitude,
           lon: logRecords[0].longitude,
           id: logRecords[0].device.id,
           value: 1
         });
         bounds.push(new L.LatLng(logRecords[0].latitude, logRecords[0].longitude));
         /**Adds coordinates to map**/
         if (coordinates.length == expectedCount) {
           for (var i = 0; i < coordinates.length; i++) {
             // map.fitBounds(bounds);
             newCoords = new L.marker([coordinates[i].lat,coordinates[i].lon], {
               uniqueID: deviceId,
               icon: getColor(deviceId)
             });
             snowMapLayer.addLayer(newCoords);
           }
             toggleLoading(false);
           }
       }, error => {
         errorHandler(error);
         toggleLoading(false);
       });
   }
   };

  /**
   * Intialize the user interface
   * @param {object} coords - An object with the latitude and longitude to render on the map.
   */
  let initializeInterface = coords => {
    // setup the map
    map = new L.Map("snowtag-map", {
        center: new L.LatLng(coords.latitude, coords.longitude),
        zoom: 13
    });

    L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2VvdGFiIiwiYSI6ImNpd2NlaW02MjAxc28yeW9idTR3dmRxdTMifQ.ZH0koA2g2YMMBOcx6EYbwQ").addTo(map);
    var credits = L.control.attribution().addTo(map);
    credits.addAttribution('© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>');

    snowMapLayer = L.layerGroup().addTo(map);

    // find reused elements
    elVehicleSelect = document.getElementById("vehicles");
    elDateFromInput = document.getElementById("from");
    elDateToInput = document.getElementById("to");
    elError = document.getElementById("error");
    elLoading = document.getElementById("loading");

    // set up dates
    let now = new Date();
    let dd = now.getDate();
    let mm = now.getMonth() + 1;
    let yy = now.getFullYear();

    if (dd < 10) {
      dd = "0" + dd;
    }

    if (mm < 10) {
      mm = "0" + mm;
    }

    elDateFromInput.value = yy + "-" + mm + "-"  + dd + "T" + "00:00";
    elDateToInput.value = yy + "-" + mm + "-"  + dd + "T" + "23:59";

    // events based on checkboxes. First gets list of vehicle ids, checks if they are checked,
    // then passes the checked value to the displaySnowMap() function and the getColor() Function
    // to get appropriate colored marker.
    // When checkbox is unchecked, the value is again passed and the layer and colors are cleared
    // from the map.
    document.getElementById("vehicles").addEventListener("click", function() {
      checkedCbs = document.querySelectorAll('#vehicles input[type="checkbox"]');
      for (var i=0; i < checkedCbs.length; i++) {
              checkedCbs[i].onchange = function() {
                  if (this.checked) {
                    ids = this.value;
                    event.preventDefault();
                    displaySnowMap();

                    var color = getColor(ids);
                    var colorurl = color.options.iconUrl;
                    var elem = document.createElement("img");
                    elem.setAttribute("src", colorurl);
                    document.getElementById(ids).appendChild(elem);

                  } else {
                    document.getElementById("error").innerHTML = "";
                    ids = this.value;
                    var node = document.getElementById(ids);
                    node.removeChild(node.firstChild);

                    snowMapLayer.eachLayer((layer) => {
                      if (layer.options.uniqueID === ids) {
                        snowMapLayer.removeLayer(layer);
                      }
                    }, error => {
                      errorHandler(error);
                      toggleLoading(false);
                    });
                 }
              };
      }
    });

    // events based on change in date. Checks to see what checkboxes have changed and passes the
    // values to the snowMapLayer()
    document.getElementById("from").addEventListener("change", event => {
      for (let input of document.querySelectorAll('#vehicles input[type="checkbox"]')) {
        if (input.checked) {
          ids = input.value;
          snowMapLayer.eachLayer((layer) => {
            if (layer.options.uniqueID === ids) {
              snowMapLayer.removeLayer(layer);
            }
          }, error => {
            errorHandler(error);
            toggleLoading(false);
          });
          event.preventDefault();
          displaySnowMap();
        }
      }
    });

    // events based on change in date. Checks to see what checkboxes have changed and passes the
    // values to the snowMapLayer()
    document.getElementById('to').addEventListener("change", event => {
      for (let input of document.querySelectorAll('#vehicles input[type="checkbox"]')) {
        if (input.checked) {
          ids = input.value;
          snowMapLayer.eachLayer((layer) => {
            if (layer.options.uniqueID === ids) {
              snowMapLayer.removeLayer(layer);
            }
          }, error => {
            errorHandler(error);
            toggleLoading(false);
          });
          event.preventDefault();
          displaySnowMap();
        }
      }
    });
  };


  /**
   * Sort named entities
   * @param {object} a - The left comparison named entity
   * @param {object} b - The right comparison named entity
   */
  let sortByName = (a, b) => {
    a = a.name.toLowerCase();
    b = b.name.toLowerCase();

    if (a === b) {
      return 0;
    }

    if (a > b) {
      return 1;
    }

    return -1;
  };

  return {
    initialize(freshApi, state, callback) {
      api = freshApi;
        initializeInterface({ longitude: -93.10, latitude: 44.94});
        callback();

    },
    focus(freshApi) {
      api = freshApi;
      while (elVehicleSelect.firstChild) {
        elVehicleSelect.removeChild(elVehicleSelect.firstChild);
      }

      /**Calls special snowtagging group vehicles**/
      api.call("Get", {
        typeName: "Device",
        search: {
          fromDate: new Date().toISOString(),
          groups: [{"id": "b27D5"}]
        }
      }, vehicles => {
        if (!vehicles || vehicles.length < 0) {
          return;
        }

        // grabs all vehicles and creates checkboxes, divs and <br> based
        // on values.
        vehicles.sort(sortByName);
        elVehicleSelect.insertAdjacentHTML("beforeend", "<br>");
        vehicles.forEach(vehicle => {
          var div = document.createElement("div");
          option = document.createElement("input");
          option.setAttribute("type", "checkbox");
          option.name = vehicle.name;
          option.value = vehicle.id;
          div.className = "legend";
          div.id = vehicle.id;

          elVehicleSelect.appendChild(div);
          elVehicleSelect.appendChild(option);
          elVehicleSelect.insertAdjacentText("beforeend", option.name);
          elVehicleSelect.insertAdjacentHTML("beforeend", "<br>");
          elVehicleSelect.insertAdjacentHTML("beforeend", "<br>");
        });

      }, errorHandler);

      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    },
    blur: function(){}
  };
};
