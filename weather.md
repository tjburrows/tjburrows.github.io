---
layout: plotly
permalink: /weather/
title: Georgia Tech Weather
---
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script>

        var loc = document.createElement('INPUT')
        loc.setAttribute("type", "text");
        loc.setAttribute("value", "Atlanta, GA");
        loc.addEventListener("keyup", function(event) {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                // Cancel the default action, if needed
                event.preventDefault();
                // Trigger the button element with a click
                document.getElementById("button1").click();
            }
        })
        document.body.appendChild(loc);
        var HttpClient = function() {
            this.get = function(aUrl, aCallback) {
                var anHttpRequest = new XMLHttpRequest();
                anHttpRequest.onreadystatechange = function() { 
                    if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                        aCallback(anHttpRequest.responseText);
                }
                anHttpRequest.open( "GET", aUrl, true );            
                anHttpRequest.send( null );
            }
        }
        
        function getCurrentLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    getWeather(position.coords.latitude, position.coords.longitude)
                });
            }
        }
        
        function getWeather(lat, lon) {
            var locString = lat + ',' + lon
            var client = new HttpClient();
            client.get('https://api.weather.gov/points/' + locString, function(pointsResponse) {
                responseJson = JSON.parse(pointsResponse)
                console.log(responseJson)
                gridData = responseJson.properties.forecastGridData
                client.get(gridData, function(gridResponse) {
                    responseJson = JSON.parse(gridResponse)
                    props = responseJson.properties
                    timeLength = props.temperature.values.length
                    geometry = responseJson.geometry.coordinates[0]
                    
                    //  Plot map
                    node = document.getElementById("map")
                    while (node.hasChildNodes()) {
                        node.removeChild(node.lastChild);
                    }

                    var div = document.createElement('map1');
                    div.style.width = "100vw";
                    elem = document.getElementById("map").appendChild(div)
                    pointsLon = []
                    pointsLat = []
                    center = [0,0]
                    for (var i = 0; i < geometry.length-1; i++) {
                        pointsLon.push(geometry[i][0])
                        pointsLat.push(geometry[i][1])
                        center[0] += geometry[i][0]
                        center[1] += geometry[i][1]
                    }
                    center[0] /= geometry.length-1
                    center[1] /= geometry.length-1
                    var mapData = [{
                        lon: pointsLon,
                        lat: pointsLat,
                        type: 'scattermapbox',
                        fill: "toself",
                        marker: {color: 'red'}
                    }]
                    var mapLayout = {
                        mapbox: {
                            style: 'open-street-map',
                            center: { lon: center[0], lat: center[1] },
                            zoom: 10
                        },
                        modes: 'lines'
                        
                    }
                    Plotly.newPlot(elem, mapData, mapLayout)
                    
                    //  Generate data arrays
                    fields = ['temperature','probabilityOfPrecipitation', 'quantitativePrecipitation', 'relativeHumidity','relativeHumidity', 'dewpoint', 'snowfallAmount']
                    dataStruct = {}
                    fields.forEach(function (field, index) {
                        if (field in props) {
                            numPoints = props[field].values.length
                            entryStruct = {'time':new Array(), 'data':new Array(), 'unit':''}
                            if ('uom' in props[field])
                                entryStruct.unit = props[field].uom.slice(5)
                            for (var i = 0; i < numPoints; i++) {
                                iso8601String = props[field].values[i].validTime
                                startTime = Date.parse(iso8601String.split('/')[0])
                                if (i < numPoints-1) {
                                    endTime = Date.parse(props[field].values[i+1].validTime.split('/')[0])
                                    hours = (endTime - startTime) / (1000 * 60 * 60)
                                    if (hours > 1) {
                                        for (var h = 1; h < hours; h++) {
                                            currentTime = new Date(startTime)
                                            currentTime.setHours(currentTime.getHours() + h)
                                            entryStruct.time.push(currentTime)
                                            entryStruct.data.push(props[field].values[i].value)
                                        }
                                    }
                                    else {
                                        entryStruct.time.push(startTime)
                                        entryStruct.data.push(props[field].values[i].value)
                                    }
                                }
                                else {
                                    entryStruct.time.push(startTime)
                                    entryStruct.data.push(props[field].values[i].value)
                                }
                            }
                            if (entryStruct.unit == 'degC') {
                                for (var i = 0; i < entryStruct.data.length; i++) {
                                    entryStruct.data[i] = entryStruct.data[i] * 9.0 / 5.0 + 32
                                }
                                entryStruct.unit = 'degF'
                            }
                            if (entryStruct.unit == 'mm') {
                                for (var i = 0; i < entryStruct.data.length; i++) {
                                    entryStruct.data[i] = entryStruct.data[i] / 25.4
                                }
                                entryStruct.unit = 'in'
                            }
                            dataStruct[field] = entryStruct
                        }
                        else {
                            console.log('Error: ' + field + ' not in properties')
                        }
                        
                    })
                    
                    
                    //  Generate plots
                    node = document.getElementById("graphs")
                    while (node.hasChildNodes()) {
                        node.removeChild(node.lastChild);
                    }
                    for (var key of Object.keys(dataStruct)) {
                        // Add plot div
                        var div = document.createElement(key);
                        div.style.width = "100vw";
                        //div.style.height = "100px";
                        elem = document.getElementById("graphs").appendChild(div)
                        title = key
                        if (dataStruct[key].unit != '')
                            title += ' (' + dataStruct[key].unit + ')'
                        var layout = {
                            paper_bgcolor:'rgba(0,0,0,0)',
                            plot_bgcolor:'rgba(0,0,0,0)',
                            title: title,
                            xaxis: {
                                type:'date'
                            }
                        }
                        if (dataStruct[key].unit == 'percent') {
                            layout['yaxis'] = {range: [0, 100]}
                        }
                        Plotly.newPlot(elem, [{x:dataStruct[key].time,y:dataStruct[key].data,mode:'lines',type:'scatter'}], layout)
                    }
                })
            })
        }
        
        function geocode(position = {}) {
            // Print text input
            console.log(loc.value)
            var client = new HttpClient();
            // Get coordinate of location
            url = 'https://nominatim.openstreetmap.org/search?q=' + loc.value + '&format=json'
            client.get(url, function(nomResponse) {
                responseJson = JSON.parse(nomResponse)[0]
                var lat = responseJson.lat
                var lon = responseJson.lon
                getWeather(lat,lon)
            })
        
        }
            
    </script>
    <button id='button1' onclick="geocode()">Submit</button>
    <button id='button2' onclick="getCurrentLocation()">My Current Location</button>
    <div id="map"></div>
    <div id="graphs"></div>
