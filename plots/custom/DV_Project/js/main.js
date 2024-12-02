let habitablePlanets;
let customPlotSVG;
let spiderSVG;
var minMaxValues = {};
const fields = [
  "Age",
  "Distance",
  "ESI",
  "Flux",
  "Mass",
  "Period",
  "Radius",
  "Temperature",
];

const earthData = {
  Age: 4.54, // Earth's age in billions of years
  Distance: 0, // Distance from itself, hence 0
  ESI: 1, // Earth Similarity Index for Earth is 1
  Flux: 1, // Solar flux normalized for Earth
  Mass: 1, // Mass in Earth masses
  Period: 365.25, // Orbital period in days
  Radius: 1, // Radius in Earth radii
  Temperature: 288, // Surface temperature in Kelvin
};

document.addEventListener("DOMContentLoaded", function () {
  customPlotSVG = d3.select("#customPlot_SVG");
  spiderSVG = d3.select("#spider_SVG");

  Promise.all([d3.csv("data/Habitable_Planets.csv")]).then(function (values) {
    habitable_planets = values[0];

    habitablePlanets = habitable_planets.map(function (hp) {
      return {
        Name: hp.Name,
        Type: hp.Type,
        "Detection Method": hp["Detection Method"],
        Mass: Number(hp.Mass.replace(/[~≥<>\uFFFD]/g, "").trim()),
        Radius: Number(hp.Radius.replace(/[~≥<>\uFFFD]/g, "").trim()),
        Flux: Number(hp.Flux.replace(/[~≥<>\uFFFD]/g, "").trim()),
        Temperature: Number(hp.Temperature.replace(/[~≥<>\uFFFD]/g, "").trim()),
        Period: Number(hp.Period.replace(/[~≥<>\uFFFD]/g, "").trim()),
        Distance: Number(hp.Distance.replace(/[~≥<>\uFFFD]/g, "").trim()),
        Age: Number(hp.Age.replace(/[~≥<>\uFFFD]/g, "").trim()),
        ESI: Number(hp.ESI.replace(/[~≥<>\uFFFD]/g, "").trim()),
      };
    });

    minMaxValues = {
      Mass: {
        min: d3.min(habitablePlanets, (hp) => hp.Mass),
        max: d3.max(habitablePlanets, (hp) => hp.Mass),
      },
      Radius: {
        min: d3.min(habitablePlanets, (hp) => hp.Radius),
        max: d3.max(habitablePlanets, (hp) => hp.Radius),
      },
      Flux: {
        min: d3.min(habitablePlanets, (hp) => hp.Flux),
        max: d3.max(habitablePlanets, (hp) => hp.Flux),
      },
      Temperature: {
        min: d3.min(habitablePlanets, (hp) => hp.Temperature),
        max: d3.max(habitablePlanets, (hp) => hp.Temperature),
      },
      Period: {
        min: d3.min(habitablePlanets, (hp) => hp.Period),
        max: d3.max(habitablePlanets, (hp) => hp.Period),
      },
      Distance: {
        min: d3.min(habitablePlanets, (hp) => hp.Distance),
        max: d3.max(habitablePlanets, (hp) => hp.Distance),
      },
      Age: {
        min: d3.min(habitablePlanets, (hp) => hp.Age),
        max: d3.max(habitablePlanets, (hp) => hp.Age),
      },
      ESI: {
        min: d3.min(habitablePlanets, (hp) => hp.ESI),
        max: d3.max(habitablePlanets, (hp) => hp.ESI),
      },
    };

    drawCustomPlot();
  });
});

// Use this function to draw the lollipop chart.
function drawCustomPlot() {
  console.log("trace:drawCustomPlot()");

  // Removing elements from svg to avoid overwritting
  // customPlotSVG.selectAll(".rectLegend").remove();
  // customPlotSVG.selectAll(".textLegend").remove();
  // customPlotSVG.selectAll(".x-title").remove();
  // customPlotSVG.selectAll(".y-title").remove();

  // Fetching the Parameter selected from the html element
  var Parameter = document.getElementById("Parameter").value;

  // Filtering data as per Parameter selected
  habitablePlanetsSelectedParameter = habitablePlanets
    .map(function (hp) {
      return {
        Name: hp.Name,
        Parameter: hp[Parameter],
        Radius: hp.Radius,
      };
    })
    .sort((a, b) => a.Parameter - b.Parameter);

  // Creating axes for the chart
  const imageSize = 100; // Earth-size in pixels
  const baseSpacing = 10; // Base spacing that will be dynamically adjusted
  let cumulativeX = 0; // Starting x-position

  // Calculate the required SVG width based on the total width of all images and dynamic spacing
  const totalWidth = habitablePlanetsSelectedParameter.reduce((acc, d) => {
    const imageWidth = imageSize * d.Radius;
    const dynamicSpacing = baseSpacing * d.Radius; // Adjust spacing based on radius
    acc += imageWidth + dynamicSpacing;
    return acc;
  }, 0);

  const height = 400;

  // Adjust SVG width and height
  customPlotSVG.attr("width", totalWidth).attr("height", height);
  const tooltip = d3.select("#customPlot_toolTip");

  // Render the images in ascending order of the selected parameter with dynamic spacing
  customPlotSVG
    .selectAll(".image")
    .data(habitablePlanetsSelectedParameter, (d) => d.Name)
    .join(
      (enter) =>
        enter
          .append("image")
          .attr("class", "image")
          .attr("x", (d) => {
            const x = cumulativeX;
            cumulativeX += imageSize * d.Radius + baseSpacing * d.Radius; // Update cumulative x with dynamic spacing
            return x;
          })
          .attr("y", 0) // Fixed y position for alignment
          .attr("width", (d) => imageSize * d.Radius) // Scale based on Earth's radius
          .attr("height", (d) => imageSize * d.Radius)
          .attr("xlink:href", (d) => "img/subject files/" + d.Name + ".png")
          .attr("opacity", 0)
          .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1).html(`${Parameter}: ${d.Parameter}`);
            highlight(d.Name);
          })
          .on("mousemove", (event) => {
            tooltip
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY + 10 + "px");
          })
          .on("mouseout", (d) => {
            tooltip.style("opacity", 0);
            unHighlight();
          })
          .on("click", (event, d) => {
            plotSpider(d.Name);
          })
          .transition()
          .duration(1000)
          .attr("y", (d) => (height - imageSize * d.Radius) / 2)
          .attr("opacity", 1),
      (update) =>
        update
          .attr("width", (d) => imageSize * d.Radius)
          .attr("height", (d) => imageSize * d.Radius)
          .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1).html(`${Parameter}: ${d.Parameter}`);
            highlight(d.Name);
          })
          .on("mousemove", (event) => {
            tooltip
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY + 10 + "px");
          })
          .on("mouseout", (d) => {
            tooltip.style("opacity", 0);
            unHighlight();
          })
          .on("click", (event, d) => {
            plotSpider(d.Name);
          })
          .transition()
          .duration(1000)
          .attr("x", (d) => {
            const x = cumulativeX;
            cumulativeX += imageSize * d.Radius + baseSpacing * d.Radius; // Update cumulative x with dynamic spacing
            return x;
          }),
      (exit) => exit.transition().duration(500).style("opacity", 0).remove()
    );

  // Remove and re-add axis labels
  customPlotSVG.selectAll(".x-title, .y-title").remove();

  customPlotSVG
    .append("text")
    .attr("class", "x-title")
    .attr("x", totalWidth / 2)
    .attr("y", 580)
    .attr("fill", "white")
    .text(`Planets Sorted by ${Parameter}`);
}

function plotSpider(name) {
  console.log("Inside plot spider");
  console.log(name);

  // Find the specific planet data by name
  const planet = habitablePlanets.find((d) => d.Name === name);
  if (!planet) {
    console.error("Planet data not found.");
    return;
  }

  const radius = 150;
  const labelOffset = 20;
  const centerX = 200;
  const centerY = 200;
  const levels = 5;
  const angleSlice = (Math.PI * 2) / fields.length;
  const startAngleOffset = -Math.PI / 2;

  // Create scales for each axis based on min-max values
  const scales = {};
  fields.forEach((field) => {
    scales[field] = d3
      .scaleLinear()
      .domain([0, minMaxValues[field].max])
      .range([0, radius]);
  });

  // Transition duration
  const transitionDuration = 1000;

  // Draw octagonal grid levels for each axis (only create once)
  if (spiderSVG.selectAll(".grid").empty()) {
    for (let level = 1; level <= levels; level++) {
      const levelFactor = (radius / levels) * level;

      const octagonPoints = fields.map((_, i) => {
        const angle = i * angleSlice + startAngleOffset;
        return {
          x: centerX + Math.cos(angle) * levelFactor,
          y: centerY + Math.sin(angle) * levelFactor,
        };
      });

      spiderSVG
        .append("path")
        .datum(octagonPoints)
        .attr("class", "grid")
        .attr(
          "d",
          d3
            .line()
            .x((d) => d.x)
            .y((d) => d.y)
            .curve(d3.curveLinearClosed)
        )
        .style("fill", "none")
        .style("stroke", "#bbb")
        .style("stroke-width", 0.5);
    }
  }

  // Draw axis lines and labels outside the octagon
  if (spiderSVG.selectAll(".axis").empty()) {
    fields.forEach((field, i) => {
      const angle = i * angleSlice + startAngleOffset;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // Axis line
      spiderSVG
        .append("line")
        .attr("class", "axis")
        .attr("x1", centerX)
        .attr("y1", centerY)
        .attr("x2", x)
        .attr("y2", y)
        .style("stroke", "gray")
        .style("stroke-width", 1);

      // Axis label
      const labelX = centerX + Math.cos(angle) * (radius + labelOffset);
      const labelY = centerY + Math.sin(angle) * (radius + labelOffset);

      spiderSVG
        .append("text")
        .attr("class", "label")
        .attr(
          "x",
          field === "Radius"
            ? labelX - 10
            : field === "Period"
            ? labelX - 30
            : field === "Age"
            ? labelX - 10
            : field === "Mass"
            ? labelX - 15
            : labelX
        )
        .attr("y", labelY)
        .attr("dy", "0.35em")
        .style(
          "text-anchor",
          angle === 0 || angle === Math.PI
            ? "middle"
            : angle < Math.PI
            ? "start"
            : "end"
        )
        .style("fill", "white")
        .text(field);
    });
  }

  // Radar Polygon Path - Calculate each point for the radar path based on individual scales
  const radarPathData = fields.map((field, i) => {
    const angle = i * angleSlice + startAngleOffset;
    return {
      x: centerX + Math.cos(angle) * scales[field](planet[field]),
      y: centerY + Math.sin(angle) * scales[field](planet[field]),
    };
  });

  const earthDataScaled = fields.map((field, i) => {
    const angle = i * angleSlice + startAngleOffset;
    return {
      x: centerX + Math.cos(angle) * scales[field](earthData[field]),
      y: centerY + Math.sin(angle) * scales[field](earthData[field]),
    };
  });

  const earthPathData = earthDataScaled.map((d, i) => {
    const angle = i * angleSlice + startAngleOffset;
    return {
      x: centerX + Math.cos(angle) * d.value * radius,
      y: centerY + Math.sin(angle) * d.value * radius,
    };
  });

  if (spiderSVG.selectAll(".earthPolygon").empty()) {
    spiderSVG
      .append("path")
      .datum(earthPathData)
      .attr("class", "earthPolygon")
      .attr(
        "d",
        d3
          .line()
          .x((d) => d.x)
          .y((d) => d.y)
          .curve(d3.curveLinearClosed)
      )
      .style("fill", "none")
      .style("stroke", "red")
      .style("stroke-width", 2)
      .style("stroke-dasharray", "4 2");
  }

  // Define the line generator for the radar chart path in Cartesian coordinates
  const radarLine = d3
    .line()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(d3.curveLinearClosed);

  // Draw or transition the radar polygon
  const radarPolygon = spiderSVG
    .selectAll(".radarPolygon")
    .data([radarPathData]);

  radarPolygon.join(
    (enter) =>
      enter
        .append("path")
        .attr("class", "radarPolygon")
        .attr("d", radarLine(radarPathData)) // Initial path
        .style("fill", "steelblue")
        .style("stroke", "darkblue")
        .style("stroke-width", 2)
        .style("fill-opacity", 0.8),
    (update) =>
      update
        .transition()
        .duration(transitionDuration)
        .attrTween("d", function () {
          const previous = d3.select(this).attr("d");
          const current = radarLine(radarPathData);
          return d3.interpolateString(previous, current);
        })
  );

  // Draw or transition radar chart points
  const radarPoints = spiderSVG.selectAll(".radarCircle").data(radarPathData);

  radarPoints.join(
    (enter) =>
      enter
        .append("circle")
        .attr("class", "radarCircle")
        .attr("r", 4)
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .style("fill", "darkblue")
        .style("stroke", "steelblue")
        .style("stroke-width", 1.5)
        .style("fill-opacity", 0.9),
    (update) =>
      update
        .transition()
        .duration(transitionDuration)
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
  );
}

function normalize(value, min, max) {
  return (value - min) / (max - min);
}

function highlight(name) {
  customPlotSVG
    .selectAll("image")
    .filter((d) => d.Name !== name)
    .attr("opacity", 0.6);
}

function unHighlight() {
  customPlotSVG.selectAll("image").attr("opacity", 1);
}
