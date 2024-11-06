# Sequences Sunburst - Vue 3 + Vite

This exemple with d3.js + vue, to show the use of sunburst visualization

```
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
```
![sequences_sunburst.png](public%2Fsequences_sunburst.png)

## Feature
Sunburst visualization with labels and interactive breadcrumb trail helps to emphasize the sequence

```
function initializeBreadcrumbTrail() {
    // Set label text to breadcrumb trail
    const label = svg.append("text")
        .attr("text-anchor", "middle")
        .attr("fill", "#888")
        .style("visibility", "hidden");

    label.append("tspan")
        .attr("class", "percentage")
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy", "-0.1em")
        .attr("font-size", "3em")
        .text("");

    label.append("tspan")
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy", "1.5em")
        .text("of visits begin with this sequence");

    return label
}
```
![sequences_sunburst_labels.png](public%2Fsequences_sunburst_labels.png)

## Installation

1. Clone repository


```bash
git clone https://github.com/ZAomineZ/sunburst_labels.git
```

2. Navigate to the project directory

```bash
cd sunburst_labels
```

3. Install dependencies
```bash
npm i
```

4. Execution

```bash
npm run dev
```