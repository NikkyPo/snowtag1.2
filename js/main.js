/**
 * @returns {{initialize: Function, focus: Function, blur: Function}}
 */
geotab.addin.snowtag = () => {
  'use strict';

  let api;

  let map;
  let snowMapLayer;

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

  /**
   * Displays the snowtags of a vehicle location history
   */
  let displaySnowMap = function () {
    let deviceId = elVehicleSelect.value;
    let fromValue = elDateFromInput.value;
    let toValue = elDateToInput.value;

    errorHandler('');

    if ((deviceId === null) || (fromValue === '') || (toValue === '')) {
      return;
    }

    toggleLoading(true);

    let dateFrom = new Date(fromValue).toISOString();
    let dateTo = new Date(toValue).toISOString();

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
            errorHandler('Not enough data');
            toggleLoading(false);
          }
          for (var i = 0; i < exception.length; i++){
               logRecord(exception[i],coordinates,bounds,exception.length);
          }
       });

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
         // console.log(logRecords)

               coordinates.push({
                 lat: logRecords[0].latitude,
                 lon: logRecords[0].longitude,
                 value: 1
               });
               bounds.push(new L.LatLng(logRecords[0].latitude, logRecords[0].longitude));

           if (coordinates.length == expectedCount) {
             // snowMapLayer.addLayer(new L.circleMarker([coordinates]), {
             //    	color: 'red',
             //    	fillColor: '#f03',
             //    	fillOpacity: 0.5,
             //    	radius: 500
             //    });
             var circle = L.circle([-93.508, 45.117], {
             	color: 'red',
             	fillColor: '#f03',
             	fillOpacity: 0.5,
             	radius: 500
             }).addTo(map);

             map.fitBounds(bounds);

             // var layerGroup = L.layerGroup([coordinates])
             // console.log(layerGroup);

             toggleLoading(false);
             console.log("new coords", coordinates);
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
    document.getElementById('vehicles').addEventListener('change', event => {
      event.preventDefault();
      displaySnowMap();
    });

    document.getElementById('from').addEventListener('change', event => {
      event.preventDefault();
      displaySnowMap();
    });

    document.getElementById('to').addEventListener('change', event => {
      event.preventDefault();
      displaySnowMap();
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
          let option = new Option();
          option.text = vehicle.name;
          option.value = vehicle.id;
          elVehicleSelect.add(option);
        });
      }, errorHandler);

      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    },
    blur: function(){}
  };
};
