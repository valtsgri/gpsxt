<script lang="ts">
import { computed } from "vue";
import { Icon } from 'leaflet';

import { LMap, LPolyline, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import csv from '../assets/data.csv';

// delete Icon.Default.prototype._getIconUrl;
type D = Icon.Default & {
  _getIconUrl?: string;
};

delete (Icon.Default.prototype as D)._getIconUrl;

const cmpData = computed(() => csv
.slice(2)
.map(c => [
  c.latitude,
  c.longitude,
  speedToColor(c.speed),
  c.speed
]));

const maxSpeedIndex = computed(() => {
  const maxSpeed = Math.max(...csv.slice(2).map(c => parseFloat(c.speed)));
  const idx = cmpData.value.findIndex(i => i[3] == maxSpeed);
  return idx;
});

const minSpeedIndexes = computed(() => {
  const speedArray = csv.slice(2).map((value, index) => value.speed);
  const slowestPlaces = findSlowestCornerIndexes(speedArray, 4);
  return slowestPlaces;
});

export default {
  components: {
    LMap,
    LTileLayer,
    LPolyline,
    LMarker,
    LPopup,
  },
  data() {
    return {
      zoom: 17,
      cmpData: cmpData,
      accessToken: '<TOKEN>',
      maxSpeedIndex: maxSpeedIndex,
      minSpeedIndexes: minSpeedIndexes,
    };
  },
  csv,
  cmpData,
  speedToColor,
};

function speedToColor(speed) {
  // Convert the speed to a percentage within the range [0, 100]
  const percent = (Math.max(Math.min(speed, 50), 1) - 1) * 2;

  // Calculate the red, green, and blue components
  let red = Math.floor((100 - percent) * 255 / 100);
  let green = Math.floor(percent * 255 / 100);
  let blue = 0;

  // Increase the brightness of the colors by adding a value to each component
  const brightness = 30; // Adjust this value to change the brightness
  red = Math.min(red + brightness, 255);
  green = Math.min(green + brightness, 255);

  // Convert the components to hexadecimal values
  red = red.toString(16).padStart(2, '0');
  green = green.toString(16).padStart(2, '0');
  blue = blue.toString(16).padStart(2, '0');

  // Return the hexadecimal color
  return `#${red}${green}${blue}`;
}

function findSlowestCornerIndexes(speedArray, count) {
  const cornerIndexes = [];
  
  for (let i = 1; i < speedArray.length - 1; i++) {
    const currentSpeed = speedArray[i];
    const prevSpeed = speedArray[i - 1];
    const nextSpeed = speedArray[i + 1];
    
    // Check if the current speed is the slowest among the neighboring speeds
    if (currentSpeed < prevSpeed && currentSpeed < nextSpeed) {
      cornerIndexes.push(i);
    }
  }
  
  // Sort corner indexes based on the corresponding speeds
  cornerIndexes.sort((a, b) => speedArray[a] - speedArray[b]);
  
  // Return the specified number of indexes for the slowest corners
  return cornerIndexes.slice(0, count);
}

</script>

<template>
  <l-map ref="map" v-model:zoom="zoom" :center="[56.599000, 23.6904862]" style="width: 500px; height: 500px;">
    <l-tile-layer
      :url="'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=' + accessToken"
      
      layer-type="base"
      name="OpenStreetMap"
    ></l-tile-layer>

    <!-- <l-polyline
      :lat-lngs="[
        [56.599357, 23.6904862],
        [56.591357, 23.6924862],
      ]"
      color="red"
    /> -->
    <!--<l-polyline
      :lat-lngs="cmpData"
      color="green"
    /> -->
    <l-polyline v-for="(line, idx) in cmpData"
      :key="idx"
      :lat-lngs="[[cmpData[idx][0], cmpData[idx][1]], [(cmpData[idx+1] || cmpData[idx])[0], (cmpData[idx+1] || cmpData[idx])[1]]]"
      
      :color="cmpData[idx][2]"
    >
      <l-popup>{{ Intl.NumberFormat('lv-LV', { maximumSignificantDigits: 5 }).format(line[3]  * 3600 / 1000) }} km/h</l-popup>
    </l-polyline>
    <l-marker 
     :lat-lng="[cmpData[maxSpeedIndex][0], cmpData[maxSpeedIndex][1]]"
     @add="$nextTick(() => $event.target.openPopup())" >
      <l-popup>{{ Intl.NumberFormat('lv-LV', { maximumSignificantDigits: 5 }).format(cmpData[maxSpeedIndex][3] * 3.6) }} km/h</l-popup>
    </l-marker>

    <l-marker v-for="(m, idx) in minSpeedIndexes"
     :key="idx"
     :lat-lng="[cmpData[m][0], cmpData[m][1]]"
    >
      <l-popup>{{ cmpData[m][3] * 3.6 }} km/h</l-popup>
    </l-marker>
  </l-map>
  Max speed: {{ Intl.NumberFormat('lv-LV', { maximumSignificantDigits: 5 }).format(cmpData[maxSpeedIndex][3] * 3600 / 1000) }} km/h
  <br/>
</template>

<style>
  .leaflet-popup-content {
    margin: 3px 18px 3px 3px;
  }
</style>
