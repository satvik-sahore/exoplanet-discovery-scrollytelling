const margin = { top: 40, right: 30, bottom: 60, left: 70 };
const width = 1200 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("display", "none");

const container = d3
  .select("#line-chart-container")
  .append("div")
  .style("width", "100%")
  .style("overflow-x", "auto")
  .style("border", "1px solid #ccc");

const svg = container
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const zoomRect = svg
  .append("rect")
  .attr("width", width)
  .attr("height", height)
  .style("fill", "none")
  .style("pointer-events", "all");

d3.json("processed_discovery_data.json").then((data) => {
  data.forEach((d) => (d.year = new Date(d.year, 0, 1)));

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.year))
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.cumulative_count)])
    .range([height, 0]);

  const xAxis = svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(10));

  svg.append("g").call(d3.axisLeft(y));

  svg
    .append("text")
    .attr("class", "x-axis-label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .text("Year");

  svg
    .append("text")
    .attr("class", "y-axis-label")
    .attr("text-anchor", "middle")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .attr("transform", "rotate(-90)")
    .text("Cumulative Discoveries");

  const line = d3
    .line()
    .x((d) => x(d.year))
    .y((d) => y(d.cumulative_count));

  svg
    .append("path")
    .datum(data)
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line);

  const circles = svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.year))
    .attr("cy", (d) => y(d.cumulative_count))
    .attr("r", 3)
    .attr("fill", "steelblue")
    .on("mouseover", (event, d) => {
      tooltip
        .style("display", "block")
        .html(
          `Year: ${d.year.getFullYear()}<br>Cumulative Count: ${
            d.cumulative_count
          }`
        )
        .style("left", event.pageX + 5 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", () => tooltip.style("display", "none"));

  const zoom = d3
    .zoom()
    .scaleExtent([1, 10])
    .translateExtent([
      [0, 0],
      [width, height],
    ])
    .on("zoom", (event) => {
      const newX = event.transform.rescaleX(x);
      xAxis.call(d3.axisBottom(newX));

      svg.select(".line").attr(
        "d",
        line.x((d) => newX(d.year))
      );

      circles
        .attr("cx", (d) => newX(d.year))
        .on("mouseover", (event, d) => {
          tooltip
            .style("display", "block")
            .html(
              `Year: ${d.year.getFullYear()}<br>Cumulative Count: ${
                d.cumulative_count
              }`
            )
            .style("left", event.pageX + 5 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none"));
    });
  zoomRect.call(zoom);
});
