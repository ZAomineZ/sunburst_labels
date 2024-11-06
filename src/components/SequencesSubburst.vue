<script setup>
import {nextTick, onMounted} from "vue";
import {createSunburstChart} from "../lib/sunburstChart.js";

import "../chart.css"

onMounted(async () => {
  await nextTick();
  await createSunburstChart();
});
</script>

<template>
  <div class="">
    <svg id="labels_chart" />
    <svg id="chart" />
  </div>
</template>

<style scoped>

</style>