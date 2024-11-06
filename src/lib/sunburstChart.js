import * as d3 from 'd3';
import {buildHierarchy} from "./sunburstData.js";

const width = 750
const height = 600
const radius = Math.min(width, height) / 2;

let breadcrumbPointsData = {
    w: 150,
    h: 30,
    s: 3,
    t: 20,
}

let root
let label
let svg

function breadcrumbPoints(d, i) {
    let points = [];
    points.push("0, 0");
    points.push(breadcrumbPointsData.w + ", 0");
    points.push(
        breadcrumbPointsData.w +
        breadcrumbPointsData.t +
        "," +
        breadcrumbPointsData.h / 2
    );
    points.push(
        breadcrumbPointsData.w + "," + breadcrumbPointsData.h
    );
    points.push("0", breadcrumbPointsData.h);
    if (i > 0) {
        points.push(
            breadcrumbPointsData.t + "," + breadcrumbPointsData.h / 2
        );
    }
    return points.join(" ");
}


function mouseEnter(event, d, path, label, element) {
    // Get the ancestors of the current segment, minus the root
    const sequence = d.ancestors().reverse().slice(1);
    // Highlight the ancestors
    path.attr("fill-opacity", (node) =>
        sequence.indexOf(node) >= 0 ? 1.0 : 0.3
    );

    const percentage = ((100 * d.value) / root.value).toPrecision(3);
    label.style("visibility", null)
        .select(".percentage")
        .text(`${percentage}%`);

    element.value = {sequence, percentage};
    updateBreadcrumbs(element)
}

function mouseLeave(d, path, label, element) {
    path.attr("fill-opacity", 1);
    label.style("visibility", "hidden");
    // Update the value of this view
    element.value = {sequence: [], percentage: 0.0};
    updateBreadcrumbs(element)
}

async function createData(data) {
    let partition = d3
        .partition()
        .size([2 * Math.PI, radius * radius])

    return partition(
        d3
            .hierarchy(data)
            .sum((d) => d.value)
            .sort((a, b) => b.value - a.value)
    );
}

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

function updateBreadcrumbs(element) {
    let svgBreadcrumb = d3.select('#labels_chart')
        .attr(
            "viewBox",
            `0 0 ${breadcrumbPointsData.w * 10} ${breadcrumbPointsData.h}`
        )
        .attr("height", "32px")
        .style("font", "14px sans-serif")
        .style("margin", "5px")
        .style("margin-bottom", "6rem");

    // Add breadcrumb and label for entering nodes.
    const g = svgBreadcrumb
        .selectAll("g")
        .data(element && element.value.sequence ? element.value.sequence : null)
        .join("g")
        .attr(
            "transform",
            (d, i) =>
                `translate(${i * breadcrumbPointsData.w}, 0)`
        );
    g.append("polygon")
        .attr("points", (d, i) => breadcrumbPoints(d, i))
        .attr("fill", (d) => d.data.color)
        .attr("stroke", "white");
    // Append text attribute for the breadcrumb label
    g.append("text")
        .attr("x", (breadcrumbPointsData.w + 10) / 2)
        .attr("y", 15)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .text((d) => d.data.name);
    svgBreadcrumb
        .append("text")
        .append("text")
        .text(element.value.percentage > 0 ? element.value.percentage + "%" : "")
        .attr(
            "x",
            element && element.value.sequence
                ? (element.value.sequence.length + 0.5) * breadcrumbPointsData.w
                : null
        )
        .attr("y", breadcrumbPointsData.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle");
    svgBreadcrumb.node();
}

async function visualization(data, arc) {
    // Element node and data sequence
    let element = svg.node()
    element.value = {sequence: [], percentage: 0.0};

    // Bounding circle underneath the sunburst, to make it easier to detect
    svg.attr('viewBox', `${-radius} ${-radius} ${width} ${width}`)
        .style("max-width", `${width}px`)
        .style("font", "12px sans-serif");
    svg.append('circle').attr('r', radius).style('opacity', 0)

    // For efficiency, filter nodes to keep only those large enough to see.
    root = await createData(data)
    let nodes = root
        .descendants()
        .filter((d) => d.depth && d.x1 - d.x0 > 0.001);
    let path = svg
        .append("g")
        .selectAll("path")
        .data(nodes)
        .join("path")
        .attr("display", (d) => (!d.depth ? "none" : null))
        .attr("d", arc)
        .attr("fill-rule", "evenodd")
        .style("fill", (d) => d.data.color)
        .style("opacity", 1);
    // Add the mouseleave handler to the bounding circle
    svg
        .append('g')
        .attr('fill', 'none')
        .attr("pointer-events", "all")
        .on('mouseleave', (d) => mouseLeave(d, path, label, element))
        .selectAll("path")
        .data(nodes)
        .join("path")
        .attr(
            "d",
            d3
                .arc()
                // @ts-ignore
                .startAngle((d) => d.x0)
                // @ts-ignore
                .endAngle((d) => d.x1)
                .padAngle(1 / radius)
                .padRadius(radius)
                // @ts-ignore
                .innerRadius((d) => Math.sqrt(d.y0))
                // @ts-ignore
                .outerRadius((d) => Math.sqrt(d.y1) - 1)
        )
        .on("mouseenter", (event, d) =>
            mouseEnter(event, d, path, label, element)
        );
}

export async function createSunburstChart() {
    svg = d3.select("#chart")
        .attr("width", width)
        .attr("height", height)

    label = initializeBreadcrumbTrail()

    let arc = d3
        .arc()
        // @ts-ignore
        .startAngle((d) => d.x0)
        // @ts-ignore
        .endAngle((d) => d.x1)
        .padAngle(1 / radius)
        .padRadius(radius)
        // @ts-ignore
        .innerRadius((d) => Math.sqrt(d.y0))
        // @ts-ignore
        .outerRadius((d) => Math.sqrt(d.y1) - 1);

    const response = await fetch('sunburst_sequences.csv');
    const csvText = await response.text();
    const csvData = d3.csvParseRows(csvText);

    let data = buildHierarchy(csvData)
    await visualization(data, arc)
}