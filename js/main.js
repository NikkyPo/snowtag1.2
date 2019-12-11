/**
 * @returns {{initialize: Function, focus: Function, blur: Function}}
 */
geotab.addin.snowtag = () => {
  'use strict';

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
      elLoading.style.display = 'block';
    } else {
      setTimeout(() => {
        elLoading.style.display = 'none';
      }, 600);
    }
  };

  let getColor = d => {
    return d == 'b2B' ? redIcon :
                         greenIcon;
  }




  // let markerShadow = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png'
  // let blueIcon = new L.Icon({
  //   className: 'my-div-icon', iconSize: null
  // });
  //
  // let redIcon = new L.Icon({
  //   className: 'custom-div-icon',
  //   html: "<div style='background-color:#4838cc;' class='marker-pin'></div>",
  //   iconSize: [30, 42],
  //   iconAnchor: [15, 42]
  // });
  //
  // let greenIcon = new L.Icon({
  //   className: 'custom-div-icon',
  //   html: "<div style='background-color:#c30b82;' class='marker-pin'></div>",
  //   iconSize: [30, 42],
  //   iconAnchor: [15, 42]
  // });
  //
  // let orangeIcon = new L.Icon({
  //   className: 'my-div-icon', iconSize: null
  // });
  //
  // let yellowIcon = new L.Icon({
  //   className: 'my-div-icon', iconSize: null
  // });
  //
  // let violetIcon = new L.Icon({
  //   className: 'my-div-icon', iconSize: null
  // });
  //
  // let greyIcon = new L.Icon({
  //   className: 'my-div-icon', iconSize: null
  // });
  //
  // let blackIcon = new L.Icon({
  //   className: 'my-div-icon', iconSize: null
  // });








  let markerShadow = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png'
  let blueIcon = new L.Icon({
  	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  	shadowUrl: markerShadow,
  	iconSize: [25, 41],
  	iconAnchor: [12, 41],
  	popupAnchor: [1, -34],
  	shadowSize: [41, 41]
  });

  let redIcon = new L.Icon({
  	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  	shadowUrl: markerShadow,
  	iconSize: [25, 41],
  	iconAnchor: [12, 41],
  	popupAnchor: [1, -34],
  	shadowSize: [41, 41]
  });

  let greenIcon = new L.Icon({
  	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  	shadowUrl: markerShadow,
  	iconSize: [25, 41],
  	iconAnchor: [12, 41],
  	popupAnchor: [1, -34],
  	shadowSize: [41, 41]
  });

  let orangeIcon = new L.Icon({
  	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  	shadowUrl: markerShadow,
  	iconSize: [25, 41],
  	iconAnchor: [12, 41],
  	popupAnchor: [1, -34],
  	shadowSize: [41, 41]
  });

  let yellowIcon = new L.Icon({
  	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
  	shadowUrl: markerShadow,
  	iconSize: [25, 41],
  	iconAnchor: [12, 41],
  	popupAnchor: [1, -34],
  	shadowSize: [41, 41]
  });

  let violetIcon = new L.Icon({
  	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
  	shadowUrl: markerShadow,
  	iconSize: [25, 41],
  	iconAnchor: [12, 41],
  	popupAnchor: [1, -34],
  	shadowSize: [41, 41]
  });

  let greyIcon = new L.Icon({
  	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
  	shadowUrl: markerShadow,
  	iconSize: [25, 41],
  	iconAnchor: [12, 41],
  	popupAnchor: [1, -34],
  	shadowSize: [41, 41]
  });

  let blackIcon = new L.Icon({
  	iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png',
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

    errorHandler('');

    if ((deviceId === null) || (fromValue === '') || (toValue === '')) {
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
                errorHandler('Not enough data for ' + input.name);
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
             })
             snowMapLayer.addLayer(newCoords)
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
    map = new L.Map('snowtag-map', {
        center: new L.LatLng(coords.latitude, coords.longitude),
        zoom: 13
    });

    L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2VvdGFiIiwiYSI6ImNpd2NlaW02MjAxc28yeW9idTR3dmRxdTMifQ.ZH0koA2g2YMMBOcx6EYbwQ').addTo(map);
    var credits = L.control.attribution().addTo(map);
    credits.addAttribution('© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>');

    snowMapLayer = L.layerGroup().addTo(map);




    let legend = L.control({position: 'bottomright'});

    // find reused elements
    elVehicleSelect = document.getElementById('vehicles');
    elDateFromInput = document.getElementById('from');
    elDateToInput = document.getElementById('to');
    elError = document.getElementById('error');
    elLoading = document.getElementById('loading');

    // set up dates
    let now = new Date();
    let dd = now.getDate();
    let mm = now.getMonth() + 1;
    let yy = now.getFullYear();

    if (dd < 10) {
      dd = '0' + dd;
    }

    if (mm < 10) {
      mm = '0' + mm;
    }

    elDateFromInput.value = yy + '-' + mm + '-' + dd + 'T' + '00:00';
    elDateToInput.value = yy + '-' + mm + '-' + dd + 'T' + '23:59';

    // events

    document.getElementById('vehicles').addEventListener('click', function() {
      checkedCbs = document.querySelectorAll('#vehicles input[type="checkbox"]');
      for (var i=0; i < checkedCbs.length; i++) {
              checkedCbs[i].onchange = function() {
                  if (this.checked) {
                    ids = this.value;
                    event.preventDefault();
                    displaySnowMap();





                    legend.onAdd = function (map) {

                        var div = L.DomUtil.create('div', 'info legend'),
                            color = getColor(ids),
                            colorurl = color.options.iconUrl
                            console.log(colorurl)

                            div.innerHTML ='<img width="10" height="12" src="' + colorurl + '">';

                        return div;
                    };

                    legend.addTo(map);







                  } else {
                    document.getElementById("error").innerHTML = "";
                    ids = this.value;
                    snowMapLayer.eachLayer((layer) => {
                      if (layer.options.uniqueID === ids) {
                        snowMapLayer.removeLayer(layer)
                      }
                    }, error => {
                      errorHandler(error);
                      toggleLoading(false);
                    });
                 }
              }
      }
    });

    document.getElementById('from').addEventListener('change', event => {
      for (let input of document.querySelectorAll('#vehicles input[type="checkbox"]')) {
        if (input.checked) {
          ids = input.value;
          snowMapLayer.eachLayer((layer) => {
            if (layer.options.uniqueID === ids) {
              snowMapLayer.removeLayer(layer)
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

    document.getElementById('to').addEventListener('change', event => {
      for (let input of document.querySelectorAll('#vehicles input[type="checkbox"]')) {
        if (input.checked) {
          ids = input.value;
          snowMapLayer.eachLayer((layer) => {
            if (layer.options.uniqueID === ids) {
              snowMapLayer.removeLayer(layer)
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
      api.call('Get', {
        typeName: 'Device',
        search: {
          fromDate: new Date().toISOString(),
          groups: [{'id': 'b27D5'}]
        }
      }, vehicles => {
        if (!vehicles || vehicles.length < 0) {
          return;
        }

        vehicles.sort(sortByName);

        vehicles.forEach(vehicle => {
          option = document.createElement("input")
          option.setAttribute('type', 'checkbox')
          option.name = vehicle.name;
          option.value = vehicle.id;
          option.class = 'check'

          elVehicleSelect.appendChild(option);
          elVehicleSelect.insertAdjacentText('beforeend', option.name);
          elVehicleSelect.insertAdjacentHTML('beforeend', '<br>');
        });

      }, errorHandler);

      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    },
    blur: function(){}
  };
};
