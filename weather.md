---
layout: plotly
permalink: /weather/
title: Georgia Tech Weather
---

## Daily

<script type='text/javascript' src='https://darksky.net/widget/default/33.776,-84.3988/us12/en.js?width=100%&height=350&title=Georgia Tech&textColor=333333&bgColor=transparent&transparency=true&skyColor=undefined&fontFamily=Default&customFont=&units=us&htColor=333333&ltColor=878787&displaySum=yes&displayHeader=yes'></script>

## Hourly

<script type='text/javascript' src='https://darksky.net/widget/graph-bar/33.776,-84.3988/us12/en.js?width=100%&height=350&title=Full Forecast&textColor=333333&bgColor=transparent&transparency=true&skyColor=undefined&fontFamily=Default&customFont=&units=us&timeColor=333333&tempColor=333333&currentDetailsOption=true'></script>

<script type='text/javascript' src='https://darksky.net/widget/graph/33.776,-84.3988/us12/en.js?width=100%&height=350&title=Full Forecast&textColor=333333&bgColor=transparent&transparency=true&fontFamily=Default&customFont=&units=us&graph=temperature_graph&timeColor=333333&tempColor=333333&lineColor=333333&markerColor=333333'></script>

<script type='text/javascript' src='https://darksky.net/widget/graph/33.776,-84.3988/us12/en.js?width=100%&height=350&title=Full Forecast&textColor=333333&bgColor=transparent&transparency=true&fontFamily=Default&customFont=&units=us&graph=precip_graph&timeColor=333333&tempColor=333333&lineColor=333333&markerColor=333333'></script>

## Map
<script src='https://darksky.net/map-embed/@temperature,33.776,-84.3988,8.js?embed=true&timeControl=true&fieldControl=true&defaultField=temperature&defaultUnits=_f'></script>

## Plotly fun

<div id="tester" style="width:90%;height:250px;"></div>

<script>
  TESTER = document.getElementById('tester');

  Plotly.plot( TESTER, [{
      x: [1, 2, 3, 4, 5],
      y: [1, 2, 4, 8, 16] }], { 
      margin: { t: 0 } }, {showSendToCloud:true} );

  /* Current Plotly.js version */
  console.log( Plotly.BUILD );
</script>

<div id="myDiv" style="width:90%;height:250px;"></div>

<script>
  var data = [{
  type:'scattermapbox',
  lat:['45.5017'],
  lon:['-73.5673'],
  mode:'markers',
  marker: {
    size:14
  },
  text:['Montreal']
  }]

var layout = {
  autosize: true,
  hovermode:'closest',
  mapbox: {
    bearing:0,
    center: {
      lat:45,
      lon:-73
    },
    pitch:0,
    zoom:5,
    style:open-street-map
  },
}

Plotly.setPlotConfig({
  mapboxAccessToken: 'pk.eyJ1IjoiZXRwaW5hcmQiLCJhIjoiY2luMHIzdHE0MGFxNXVubTRxczZ2YmUxaCJ9.hwWZful0U2CQxit4ItNsiQ'
})

Plotly.plot('myDiv', data, layout, {showSendToCloud: true})
</script>





