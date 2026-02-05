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
  Age: 4.54,
  Distance: 0,
  ESI: 1,
  Flux: 1,
  Mass: 1,
  Period: 365.25,
  Radius: 1,
  Temperature: 288,
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

function drawCustomPlot() {
  console.log("trace:drawCustomPlot()");

  var Parameter = document.getElementById("Parameter").value;

  habitablePlanetsSelectedParameter = habitablePlanets
    .map(function (hp) {
      return {
        Name: hp.Name,
        Parameter: hp[Parameter],
        Radius: hp.Radius,
      };
    })
    .sort((a, b) => a.Parameter - b.Parameter);

  const imageSize = 100;
  const baseSpacing = 10;
  let cumulativeX = 0;
  let cumulativeXName = 50;
  let flag = 1;

  const totalWidth = habitablePlanetsSelectedParameter.reduce((acc, d) => {
    const imageWidth = imageSize * d.Radius;
    const dynamicSpacing = baseSpacing * d.Radius;
    acc += imageWidth + dynamicSpacing;
    return acc;
  }, 0);

  const height = 500;

  customPlotSVG.attr("width", totalWidth).attr("height", height);
  const tooltip = d3.select("#customPlot_toolTip");

  customPlotSVG
    .selectAll(".planetGroup")
    .data(habitablePlanetsSelectedParameter, (d) => d.Name)
    .join(
      (enter) => {
        const group = enter.append("g").attr("class", "planetGroup");

        group
          .append("image")
          .attr("class", "image")
          .attr("x", (d) => {
            const x = cumulativeX;
            cumulativeX += imageSize * d.Radius + baseSpacing * d.Radius;
            return x;
          })
          .attr("y", (d) => (height - 150) / 2 - (imageSize * d.Radius) / 2)
          .attr("width", (d) => imageSize * d.Radius)
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
          .on("mouseout", () => {
            tooltip.style("opacity", 0);
            unHighlight();
          })
          .on("click", (event, d) => {
            plotSpider(d.Name);
          })
          .transition()
          .duration(1000)
          .attr("opacity", 1);

        group
          .append("text")
          .attr("class", "planetName")
          .attr("x", (d) => {
            const x = cumulativeXName;
            if (flag) {
              cumulativeXName +=
                imageSize * d.Radius + baseSpacing * d.Radius - 70;
              flag = 0;
            }
            cumulativeXName += imageSize * d.Radius + baseSpacing * d.Radius;
            return x;
          })
          .attr("y", (d) => imageSize * 4)
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .text((d) => d.Name)
          .style("font-size", "14px")
          .style("font-family", "Arial");
      },
      (update) => {
        update
          .select(".image")
          .transition()
          .duration(1000)
          .attr("x", (d) => {
            const x = cumulativeX;
            cumulativeX += imageSize * d.Radius + baseSpacing * d.Radius;
            return x;
          });

        update
          .select(".planetName")
          .transition()
          .duration(1000)
          .attr("x", (d) => {
            const x = cumulativeXName;
            cumulativeXName += imageSize * d.Radius + baseSpacing * d.Radius;
            return x;
          })
          .text((d) => d.Name);
      },
      (exit) => exit.transition().duration(1000).style("opacity", 0).remove()
    );

  customPlotSVG.selectAll(".x-title, .y-title").remove();

  customPlotSVG
    .append("text")
    .attr("class", "x-title")
    .attr("x", totalWidth / 2)
    .attr("y", height - 20)
    .attr("fill", "white")
    .text(`Planets Sorted by ${Parameter}`);
}

function plotSpider(name) {
  console.log("Inside plot spider");
  console.log(name);

  const planet = habitablePlanets.find((d) => d.Name === name);
  if (!planet) {
    console.error("Planet data not found.");
    return;
  }

  const radius = 250;
  const labelOffset = 30;
  const centerX = 300;
  const centerY = 300;
  const levels = 5;
  const angleSlice = (Math.PI * 2) / fields.length;
  const startAngleOffset = -Math.PI / 2;

  const scales = {};
  fields.forEach((field) => {
    scales[field] = d3
      .scaleLinear()
      .domain([0, minMaxValues[field].max])
      .range([0, radius]);
  });

  const transitionDuration = 1000;

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

  if (spiderSVG.selectAll(".axis").empty()) {
    fields.forEach((field, i) => {
      const angle = i * angleSlice + startAngleOffset;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      spiderSVG
        .append("line")
        .attr("class", "axis")
        .attr("x1", centerX)
        .attr("y1", centerY)
        .attr("x2", x)
        .attr("y2", y)
        .style("stroke", "gray")
        .style("stroke-width", 1);

      const labelX = centerX + Math.cos(angle) * (radius + labelOffset);
      const labelY = centerY + Math.sin(angle) * (radius + labelOffset);

      spiderSVG
        .append("text")
        .attr("class", "label")
        .attr("x", labelX)
        .attr("y", labelY)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .style("fill", "white")
        .text(field);
    });
  }

  const radarPathData = fields.map((field, i) => {
    const angle = i * angleSlice + startAngleOffset;
    return {
      x: centerX + Math.cos(angle) * scales[field](planet[field]),
      y: centerY + Math.sin(angle) * scales[field](planet[field]),
    };
  });

  const earthPathData = fields.map((field, i) => {
    const angle = i * angleSlice + startAngleOffset;
    return {
      x: centerX + Math.cos(angle) * scales[field](earthData[field]),
      y: centerY + Math.sin(angle) * scales[field](earthData[field]),
    };
  });

  const radarLine = d3
    .line()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(d3.curveLinearClosed);

  const earthPolygon = spiderSVG
    .selectAll(".earthPolygon")
    .data([earthPathData]);

  earthPolygon.join(
    (enter) =>
      enter
        .append("path")
        .attr("class", "earthPolygon")
        .attr("d", radarLine(earthPathData))
        .style("fill", "#EADDCA")
        .style("stroke", "#E49B0F")
        .style("stroke-width", 2)
        .style("fill-opacity", 0.8),
    (update) =>
      update
        .transition()
        .duration(transitionDuration)
        .attrTween("d", function () {
          const previous = d3.select(this).attr("d");
          const current = radarLine(earthPathData);
          return d3.interpolateString(previous, current);
        })
  );

  const radarPolygon = spiderSVG
    .selectAll(".radarPolygon")
    .data([radarPathData]);

  radarPolygon.join(
    (enter) =>
      enter
        .append("path")
        .attr("class", "radarPolygon")
        .attr("d", radarLine(radarPathData))
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

  const earthPoints = spiderSVG.selectAll(".earthCircle").data(earthPathData);

  earthPoints.join(
    (enter) =>
      enter
        .append("circle")
        .attr("class", "earthCircle")
        .attr("r", 4)
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .style("fill", "#E49B0F")
        .style("stroke", "#EADDCA")
        .style("stroke-width", 1.5)
        .style("fill-opacity", 0.9),
    (update) =>
      update
        .transition()
        .duration(transitionDuration)
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
  );

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

  showPlanetDetails(planet);
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

function showPlanetDetails(planet) {
  const detailsContainer = document.getElementById("planetDetails");
  if (!planet) {
    detailsContainer.innerHTML = "<p>Select a planet to see details</p>";
    return;
  }

  detailsContainer.innerHTML = `
    <p><strong>Name:</strong> ${planet.Name}</p>
    <p><strong>Mass:</strong> ${planet.Mass} Earth masses</p>
    <p><strong>Radius:</strong> ${planet.Radius} Earth radii</p>
    <p><strong>Temperature:</strong> ${planet.Temperature} K</p>
    <p><strong>Flux:</strong> ${planet.Flux}</p>
    <p><strong>Period:</strong> ${planet.Period} days</p>
    <p><strong>Distance:</strong> ${planet.Distance} light-years</p>
    <p><strong>Age:</strong> ${planet.Age} billion years</p>
    <p><strong>ESI:</strong> ${planet.ESI}</p>
  `;
}
