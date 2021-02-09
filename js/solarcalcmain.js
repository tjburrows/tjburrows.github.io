function sunPlotter(lat, lon, existingChartObject=null) {
    const ID = 'plots1'
    const thisTimeZone = tzlookup(lat,lon)
    
    updateTZ(thisTimeZone)
    let localTime = luxon.DateTime.local().setZone(thisTimeZone).startOf('year').plus({days:sliderDay.value()-1})
    updateDate(localTime)
    const thisOffset = localTime.offset - luxon.DateTime.local().offset    
    const zoneData = {zone:thisTimeZone, offset:thisOffset}
    const thisJD = getJD(localTime.year, localTime.month, localTime.day)
    const elevationData = elevationSummary(lat, lon, localTime, thisJD)
    const todayMidnight = luxon.DateTime.local().setZone(zoneData.timezone).set({hour:24,minute:0,second:0,millisecond:0})
    const lastMidnight = todayMidnight.minus({days:1})
    const xHours = Array(25)
    updateSunriseSet(elevationData.today.sunrise, elevationData.today.sunset)
    
    for (let h = 0; h < 25; h++) {
        xHours[h] = lastMidnight.plus({hours:h})
    }
    const minMaxColor = 'rgb(0,0,0,0.25)'
    const datasets = [

        {
            data: arrayToChartJSData(xHours,elevationData.today.elevation),
            label: localTime.toLocaleString(luxon.DateTime.DATE_FULL),
            fill: false,
            cubicInterpolationMode: 'default',
            borderColor: d3.schemeSet2[0],
            backgroundColor: d3.schemeSet2[0],
            interpolate: true,
        },
        {
            data: arrayToChartJSData(xHours,elevationData.solstice.summer),
            label: 'June Solstice',
            fill: false,
            cubicInterpolationMode: 'default',
            borderColor: d3.schemeSet2[1],
            backgroundColor: d3.schemeSet2[1],
            showLine:true,
            interpolate: true,
        },
        {
            data: arrayToChartJSData(xHours,elevationData.solstice.winter),
            label: 'December Solstice',
            fill: false,
            cubicInterpolationMode: 'default',
            borderColor: d3.schemeSet2[2],
            backgroundColor: d3.schemeSet2[2],
            showLine:true,
            interpolate: true,
        },
    ]
    
    if (existingChartObject) {
        existingChartObject.data.datasets = datasets
        existingChartObject.options.annotation.annotations[0].value = elevationData.today.sunrise
        existingChartObject.options.annotation.annotations[1].value = elevationData.today.sunset
        existingChartObject.update()
        return existingChartObject
    }
    else {
        
        const config = {
            type: 'line',
            data: {
                datasets: datasets
            },
            options : {
                maintainAspectRatio: false,
                scales: {
                    xAxes: chartJsTimeAxis([lastMidnight,todayMidnight]),
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Sun Elevation',
                        },
                        type: 'linear',
                        position: 'left',
                        ticks: {
                            suggestedMin: -90,
                            suggestedMax: 90
                        }
                    }]
                },
                elements: {
                    point:{
                        radius: 0
                    },
                },
                tooltips: {
                    mode: 'interpolate',
                    intersect: false,
                    callbacks:{
                        label:tooltipRoundValue,
                        title: (items) => items[0].xLabel.toLocaleString(luxon.DateTime.TIME_SIMPLE),
                    },
    //                 position: 'nearest',
                },
                plugins: {
                    crosshair: {
                        line: {
                            color: 'rgb(0,0,0,0.4)',  // crosshair line color
                            width: 1        // crosshair line width
                        },
                        sync: {
                            enabled: false,            // enable trace line syncing with other charts
                        },
                        zoom: {
                            enabled: false,
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Sun Elevation vs Time of Day',
                },
                animation: {
                    duration: 0
                },
                legend: {
                    display: true,
                },
                annotation: {
                    annotations: [
                    {
                        drawTime: "afterDatasetsDraw",
                        type: 'line',
                        scaleID: 'time',
                        value: elevationData.today.sunrise,
                        borderColor: "rgb(0,0,0,1)",
                        borderWidth: 1,
                        borderDash: [2, 2],
                        borderDashOffset: 5,
                    },
                    {
                        drawTime: "afterDatasetsDraw",
                        type: 'line',
                        scaleID: 'time',
                        value: elevationData.today.sunset,
                        borderColor: "rgb(0,0,0,1)",
                        borderWidth: 1,
                        borderDash: [2, 2],
                        borderDashOffset: 5,
                    },
                ]}
            },
            
        }
        
        const sunDiv = document.getElementById(ID)
        sunDiv.classList.add('canvasParent')
        const sunCanvas = document.createElement('canvas')
        sunDiv.appendChild(sunCanvas)
        const sunChart = new Chart(sunCanvas, config)
        return sunChart
    }
}

function updateDate(dateTime) {
    d3.select('#Date').text('Date: ' + dateTime.toLocaleString(luxon.DateTime.DATE_FULL))
}

function updateTZ(string) {
    d3.select('#Timezone').text('Time Zone: ' + string)
}

function updateSunriseSet(riseDateTime, setDateTime) {
    d3.select('#Sunrise').text('Surise: ' + riseDateTime.toLocaleString({ hour: '2-digit', minute: '2-digit', hour12: true }))
    d3.select('#Sunset').text('Sunset: ' + setDateTime.toLocaleString({ hour: '2-digit', minute: '2-digit', hour12: true }))
}


function updateDay(day, existingChartObject){
    const thisLatLon = map.getCenter()
    const thisTimeZone = tzlookup(thisLatLon.lat, thisLatLon.lng)
    const thisDateTime = luxon.DateTime.local().setZone(thisTimeZone).startOf('year').plus({days:day-1})
    const elevation = dayElevation(thisLatLon.lat, thisLatLon.lng, thisDateTime)
    const lastMidnight = thisDateTime.set({hour:0,minute:0,second:0,millisecond:0})
    const xHours = Array(25)
    const thisJD = getJD(thisDateTime.year, thisDateTime.month, thisDateTime.day)
    for (let h = 0; h < 25; h++) {
        existingChartObject.data.datasets[0].data[h].y = elevation[h]
    }
    const sunriseObject = calcSunriseSet(true,  thisJD, thisLatLon.lat, thisLatLon.lng, thisDateTime.offset / 60)
    const sunsetObject  = calcSunriseSet(false, thisJD, thisLatLon.lat, thisLatLon.lng, thisDateTime.offset / 60)
    existingChartObject.options.annotation.annotations[0].value = luxon.DateTime.local().set({hour:0,minute:0,second:0}).plus({minutes:sunriseObject.timelocal})
    existingChartObject.options.annotation.annotations[1].value = luxon.DateTime.local().set({hour:0,minute:0,second:0}).plus({minutes:sunsetObject.timelocal})
    existingChartObject.data.datasets[0].label = thisDateTime.toLocaleString(luxon.DateTime.DATE_FULL)
    existingChartObject.update()
    updateSunriseSet(existingChartObject.options.annotation.annotations[0].value, existingChartObject.options.annotation.annotations[1].value)
}

function chartJsTimeAxis(timeRange) {
    
    return [{
            type: 'time',
            ticks: {
                min: timeRange[0],
                max: timeRange[1],
            },
            time: {
                tooltipFormat: 'h:mm a',
                unit: 'hour',
                stepSize: 3,
                bounds: 'ticks',
            },
            scaleLabel: {
                display: false,
                labelString: 'Time',
            },
            gridLines: {
                display: false,
            },
            id: 'time',
        }]
}

async function geocode2(loc=document.getElementById("textinput")) {
    const url = 'https://nominatim.openstreetmap.org/search?q=' + loc.value + '&countrycodes=us&format=json&limit=1'
    const response = await fetch_retry(url, {method:'GET'}, 5)
    const nomJson =  await (async () => {return await response.json()})()
    if (nomJson.length == 0) {
        d3.select('#Error').text('Error: Location not identifiable from \"' + loc.value + '\".  Try again.')
        return null
    }
    else {
        clearID('Error')
        const lat = parseFloat(nomJson[0].lat)
        const lon = parseFloat(nomJson[0].lon)
        console.log('Geocode success: ' + loc.value + ' -> (' + lat + ', ' + lon + ')' )
        return {'lat':lat, 'lon':lon}
    }
}
 
function dayElevation(lat,lon,localTime){
    const thisJD = getJD(localTime.year, localTime.month, localTime.day)
    const offsetHours = localTime.offset / 60.0
    var jCentury = 0
    const elevations = Array(25)
    for (let i = 0; i <= 24; i++) {
        jCentury = calcTimeJulianCent(thisJD + (i - offsetHours) / 24.0)
        elevations[i] = calcAzEl(jCentury, i * 60.0, lat, lon, offsetHours).elevation
    }    
    return elevations
}

function elevationSummary(lat,lon,localTime, todayJD){
    const yearStart = getJD(localTime.year, 0, 0)
    const offsetHours = localTime.offset / 60.0
    var jCentury = 0
    const elevations = Array(365)
    const data = {}
    data.today = {}
    data.solstice = {}
    data.solstice.winter = dayElevation(lat,lon,localTime.set({month: 12, day: 21}))
    data.solstice.summer = dayElevation(lat,lon,localTime.set({month: 6, day: 21}))
    data.today.elevation = dayElevation(lat,lon,localTime)
    const sunriseObject = calcSunriseSet(true, todayJD , lat, lon, localTime.offset / 60)
    const sunsetObject = calcSunriseSet(false, todayJD, lat, lon, localTime.offset / 60)
    data.today.sunrise = luxon.DateTime.local().set({hour:0,minute:0,second:0}).plus({minutes:sunriseObject.timelocal})
    data.today.sunset = luxon.DateTime.local().set({hour:0,minute:0,second:0}).plus({minutes:sunsetObject.timelocal})
    data.today.now = calcAzEl(calcTimeJulianCent(getJD(localTime.year, localTime.month, localTime.day) + (localTime.hour - offsetHours) / 24.0), localTime.hour * 60.0 + localTime.minute, lat, lon, offsetHours).elevation
    return data
}

async function drawMap(lat, lon) {
    
    if (!mapDrawn) {
        mapDrawn = true
        map = L.map("map1",{doubleClickZoom:false, scrollWheelZoom:!L.Browser.mobile, dragging:!L.Browser.mobile}).setView([lat,lon], 3);
        const osmAttribution ='Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
        L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                {attribution: [osmAttribution].join(" | "), dragging:!L.Browser.mobile}
        ).addTo(map);
        mark = L.marker([lat,lon], {draggable: true, autoPan:true})
        mark.on('dragend', function(data) {
            mapDoubleClick(data.target._latlng.lat, data.target._latlng.lng)
        })
        map.on('dblclick', function(data) {
            mapDoubleClick(data.latlng.lat,data.latlng.lng)
        })
        mark.addTo(map);
    }
}

function cyclicLon(lon) {
    if (lon < -180)
        return {lon:lon + 360,changed:true}
    else if (lon > 180)
        return {lon:lon - 360,changed:true}
    else
        return {lon:lon, changed:false}
}

function updateLatFromSlider(lat) {
    mapDoubleClick(lat, map.getCenter().lng, true)
}

function updateLonFromSlider(lon) {
    mapDoubleClick(map.getCenter().lat, lon, true)
}

function mapDoubleClick(lat, lon, fromSlider=false){
    lonCyclic  = cyclicLon(lon)
    map.panTo([lat,lonCyclic.lon], {animate: (!lonCyclic.changed && !fromSlider)})
    for (let i in map._layers) {
        if (map._layers[i]._latlng) {
            map._layers[i].setLatLng([lat,lonCyclic.lon])
            break
        }
    }
    sunPlotter(lat, lonCyclic.lon, sunChartJS)
    if (!fromSlider) {
        sliderLat.silentValue(lat)
        sliderLon.silentValue(lonCyclic.lon)
        reverseGeocode(lat,lonCyclic.lon, 8, false)
    }
}

function helpmessage(){
    const helpDiv = document.getElementById('Message')
    if (!helpDiv.classList.contains('on')) {
        d3.select('#Message').text('Use text search, drag marker, double click on map, or sliders to change location or day.  Then, view the sun elevation plot below.')
    }
    else {
        d3.select('#Message').text('')
    }
    helpDiv.classList.toggle('on')
}

async function genPage(){

    let latlon = await geocode2()
    let thisTimeZone = tzlookup(latlon.lat, latlon.lon)
    drawMap(latlon.lat,latlon.lon)    
    
    sliderLat = d3
        .sliderRight()
        .min(-89.99)
        .max(89.99)
        .value(latlon.lat)
        .step(.0001)
        .height(300)
        .displayValue(true)
        .on('onchange', (val) => {
            updateLatFromSlider(val)
        })
        .on('end', (val) => {
            reverseGeocode(val,map.getCenter().lng, 8, false)
        })
    
    const sliderSVG = d3.select('#slider1')
        .append('svg')
        .attr('height', 350)
        
    sliderSVG.append('g')
        .attr('transform', 'translate(10,25)')
        .call(sliderLat);
    
    sliderSVG.append('text')
        .attr('x', 5)
        .attr('y', 10)
        .attr("text-anchor", "start")
        .style("font-size", "14px")
        .text("Latitude");
    
    sliderSVG.append('text')
        .attr('x', 70)
        .attr('y', 10)
        .attr("text-anchor", "start")
        .style("font-size", "14px")
        .text("Longitude");
    
    sliderSVG.append('text')
        .attr('x', 140)
        .attr('y', 10)
        .attr("text-anchor", "start")
        .style("font-size", "14px")
        .text("Day of Year");

    sliderLon = d3
        .sliderRight()
        .min(-179.99)
        .max(179.99)
        .value(latlon.lon)
        .step(.0001)
        .height(300)
        .displayValue(true)
        .on('onchange', (val) => {
            updateLonFromSlider(val)
        })
        .on('end', (val) => {
            reverseGeocode(map.getCenter().lat, val, 8, false)
        })
    
    sliderSVG.append('g')
        .attr('transform', 'translate(80,25)')
        .call(sliderLon);
    
    sliderDay = d3
        .sliderRight()
        .min(365)
        .max(1)
        .value(luxon.DateTime.local().setZone(thisTimeZone).diff(luxon.DateTime.local().setZone(thisTimeZone).startOf('year'), 'days').days + 1)
        .step(1)
        .height(300)
        .displayValue(true)
        .on('onchange', (val) => {
            const thisLatLon = map.getCenter()
            const thisTimeZone = tzlookup(thisLatLon.lat, thisLatLon.lng)
            updateDay(val, sunChartJS)
            updateTZ(thisTimeZone)
            updateDate(luxon.DateTime.local().setZone(thisTimeZone).startOf('year').plus({days:val-1}));
        })
    
    sliderSVG.append('g')
        .attr('transform', 'translate(160,25)')
        .call(sliderDay);
        
    sunChartJS = sunPlotter(latlon.lat,latlon.lon)
}

function randomLatLon(){
    const newLat = Math.random() * 180 - 90
    const newLon = Math.random() * 360 - 180
//     sunPlotter(newLat,newLon,  sunChartJS)
    mapDoubleClick(newLat,newLon, false)
    
}

function getCurrentLocationSolar() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            mapDoubleClick(position.coords.latitude, position.coords.longitude, false)
        });
    }
} 

function textSearch(){
    geocode2().then((latlon) => {
        if (latlon)
            mapDoubleClick(latlon.lat, latlon.lon, false)
    })    
}

document.getElementById("textinput").addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        textSearch()
    }
})

function fetch_retry(url, options = {}, retries = 3) {
    const retryCodes = [408, 500, 502, 503, 504, 522, 524]
    return fetch(url, options)
    .then(res => {
        if (res.ok)
            return res
        if (retries > 0 && retryCodes.includes(res.status)) {
            return fetch_retry(url, options, retries - 1)
        } else {
            throw new Error(res)
        }
    })
    .catch(console.error)
}

//  Clear all child divs of an id
async function clearID(id) {
    const node = document.getElementById(id)
    if (node !== null) {
        while (node.hasChildNodes()) {
            node.removeChild(node.lastChild);
        }
    }
}

function arrayToChartJSData(x,y) {
    const numPoints = x.length
    const data = Array(numPoints)
    for (let i = 0; i < numPoints; i++) {
        data[i] = {x:x[i],y:y[i]}
    }
    return data
}

function tooltipRoundValue(tooltipItem, data) {
    var label = data.datasets[tooltipItem.datasetIndex].label || '';

    if (label) {
        label += ': ';
    }
    if (Number.isInteger(tooltipItem.yLabel))
        label += tooltipItem.yLabel
    else
        label += Number.parseFloat(tooltipItem.yLabel).toFixed(2)
    return label;
}

function reverseGeocode(lat,lon, zoom=14, cutCountry=true) {
    const url = 'https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lon + '&format=json&zoom=14'
    fetch_retry(url, {method:'GET'}, 5)
    .then(function(response) { return response.json(); })
    .then(function(reverseJson) {
        clearID('errors')
        if (reverseJson.error) {
            document.getElementById("textinput").value= lat.toFixed(5) + ', ' + lon.toFixed(5) 
        }
        else {
            if (cutCountry) {
                reverseJson.display_name = reverseJson.display_name.slice(0, -(reverseJson.address.country.length + 2))
            }
            document.getElementById("textinput").value = reverseJson.display_name;
        }
    })
}

// Map global variables
var mapDrawn = false
var mark
var sunChartJS
var sliderLat
var sliderLon
var sliderDay

genPage()
helpmessage()
