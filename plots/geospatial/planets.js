const width = 960;
const height = 600;

const legendGap = 20;

const svg = d3
  .select("#world-map")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet");

const mapGroup = svg.append("g").attr("class", "map-container");

const projection = d3
  .geoMercator()
  .scale(130)
  .translate([width / 2, height / 1.5]);

const path = d3.geoPath().projection(projection);

let countryColorScale = d3
  .scaleLinear()
  .domain([0, 0.5, 1])
  .range(["#BF0000", "#FFFF00", "#ADD8E6"]);

let facilityColorScale = d3
  .scaleSequential(d3.interpolateInferno)
  .domain([0, 1]);

const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

let countriesData = [];
let exoplanetsData = [];
let currentFilters = { ground: true, space: true };

let currentDate = null;
let sliderPlaying = false;
let playInterval = null;
let dateExtent = [];

Promise.all([
  d3.json("data/world.json"),
  d3.csv("data/exoplanets.csv", (d) => {
    return {
      ...d,
      disc_pubdate: d3.timeParse("%Y-%m")(d.disc_pubdate),
    };
  }),
])
  .then(function ([worldData, exoplanetData]) {
    exoplanetsData = exoplanetData;

    countriesData = topojson.feature(
      worldData,
      worldData.objects.countries
    ).features;

    dateExtent = d3.extent(exoplanetsData, (d) => d.disc_pubdate);

    initializeSlider();

    updateVisualization(new Date(dateExtent[0]));
  })
  .catch(function (error) {
    console.error("Error loading or processing data:", error);
  });

function initializeSlider() {
  const slider = d3.select("#timeline-slider");
  const currentDateDisplay = d3.select("#current-date");
  const playButton = d3.select("#play-button");

  const startDate = dateExtent[0];
  const endDate = dateExtent[1];

  const allMonths = [];
  let current = new Date(startDate);
  current.setDate(1);
  while (current <= endDate) {
    allMonths.push(new Date(current));
    current = d3.timeMonth.offset(current, 1);
  }

  slider
    .attr("min", 0)
    .attr("max", allMonths.length - 1)
    .attr("step", 1)
    .property("value", 0)
    .on("input", function () {
      const index = +this.value;
      currentDate = allMonths[index];
      currentDateDisplay.text(d3.timeFormat("%Y-%m")(currentDate));
      updateVisualization(currentDate);
    });

  currentDate = allMonths[0];
  currentDateDisplay.text(d3.timeFormat("%Y-%m")(currentDate));

  playButton.on("click", function () {
    if (sliderPlaying) {
      clearInterval(playInterval);
      sliderPlaying = false;
      playButton.text("Play");
    } else {
      playInterval = setInterval(() => {
        let currentValue = +slider.property("value");
        if (currentValue < allMonths.length - 1) {
          slider.property("value", currentValue + 1).dispatch("input");
        } else {
          clearInterval(playInterval);
          sliderPlaying = false;
          playButton.text("Play");
        }
      }, 10);
      sliderPlaying = true;
      playButton.text("Pause");
    }
  });
}

function updateVisualization(selectedDate) {
  const filteredFacilities = facilities.filter((facility) => {
    if (facility.type === "Ground" && currentFilters.ground) return true;
    if (facility.type === "Space" && currentFilters.space) return true;
    return false;
  });

  const facilityLocations = [];
  filteredFacilities.forEach((facility) => {
    if (facility.locations && facility.locations.length > 0) {
      facility.locations.forEach((loc) => {
        facilityLocations.push({
          name: facility.name,
          type: facility.type,
          latitude: loc.latitude || null,
          longitude: loc.longitude || null,
          country: loc.country,
          count: 0,
        });
      });
    } else {
      facilityLocations.push({
        name: facility.name,
        type: facility.type,
        latitude: null,
        longitude: null,
        country: facility.country,
        count: 0,
      });
    }
  });

  const filteredExoplanets = exoplanetsData.filter(
    (d) => d.disc_pubdate <= selectedDate
  );

  const facilityCountMap = d3.rollups(
    filteredExoplanets,
    (v) => v.length,
    (d) => d.disc_facility
  );

  const facilityCountObj = Object.fromEntries(facilityCountMap);

  facilityLocations.forEach((loc) => {
    if (loc.name in facilityCountObj) {
      loc.count = facilityCountObj[loc.name];
    }
  });

  const countryCounts = d3.rollups(
    facilityLocations.filter((loc) => loc.country !== null),
    (v) => d3.sum(v, (d) => d.count),
    (d) => d.country
  );

  const countryCountMap = Object.fromEntries(countryCounts);

  countriesData.forEach((country) => {
    const countryName = country.properties.name;
    country.properties.exoplanetCount = countryCountMap[countryName] || 0;
  });

  const maxCountryCount = d3.max(Object.values(countryCountMap)) || 1;

  const maxFacilityCount = d3.max(facilityLocations, (d) => d.count) || 1;

  countryColorScale.domain([0, maxCountryCount * 0.5, maxCountryCount]);
  facilityColorScale.domain([0, maxFacilityCount]);

  renderMap();

  renderFacilities(facilityLocations);

  renderCountryLegend(maxCountryCount);

  renderFacilityLegend(maxFacilityCount);

  console.log("=== Updated Countries Data with Exoplanet Counts ===");
  countriesData.forEach((d) => {
    console.log(
      `Country: ${d.properties.name}, Exoplanets Discovered: ${d.properties.exoplanetCount}`
    );
  });
  console.log("=====================================================");
}

function renderMap() {
  const countries = mapGroup
    .selectAll("path.country")
    .data(countriesData, (d) => d.properties.name);

  countries.exit().remove();

  countries
    .attr("fill", (d) => {
      const value = d.properties.exoplanetCount;
      return value > 0 ? countryColorScale(value) : "#333";
    })
    .on("mouseover", function (event, d) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip.html(
        `<strong>${d.properties.name}</strong><br/>Exoplanets Discovered: ${d.properties.exoplanetCount}`
      );

      const hoveredCountry = d.properties.name;

      const visibleFacilities = facilities.filter((facility) => {
        const isInCountry = facility.locations.some((loc) => {
          if (!loc.country) return false;
          const countriesList = loc.country.split(",").map((c) => c.trim());
          return countriesList.includes(hoveredCountry);
        });

        const hasVisibleExoplanets = exoplanetsData.some((exoplanet) => {
          return (
            exoplanet.disc_facility === facility.name &&
            exoplanet.disc_pubdate <= currentDate
          );
        });

        return isInCountry && hasVisibleExoplanets;
      });

      mapGroup
        .selectAll("circle.facility")
        .classed("highlighted", false)
        .filter((c) => visibleFacilities.some((f) => f.name === c.name))
        .classed("highlighted", true);
    })
    .on("mouseout", function () {
      tooltip.transition().duration(500).style("opacity", 0);

      mapGroup.selectAll("circle.facility").classed("highlighted", false);
    });

  countries
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("d", path)
    .attr("fill", (d) => {
      const value = d.properties.exoplanetCount;
      return value > 0 ? countryColorScale(value) : "#333";
    })
    .attr("stroke", "#333")
    .attr("stroke-width", 0.5)
    .on("mouseover", function (event, d) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip.html(
        `<strong>${d.properties.name}</strong><br/>Exoplanets Discovered: ${d.properties.exoplanetCount}`
      );

      const hoveredCountry = d.properties.name;

      const associatedFacilities = facilities
        .filter((facility) =>
          facility.locations.some((loc) => {
            if (!loc.country) return false;
            const countriesList = loc.country.split(",").map((c) => c.trim());
            return countriesList.includes(hoveredCountry);
          })
        )
        .map((facility) => facility.name);

      mapGroup
        .selectAll("circle.facility")
        .filter((c) => associatedFacilities.includes(c.name))
        .classed("highlighted", true);
    })
    .on("mouseout", function (d) {
      tooltip.transition().duration(500).style("opacity", 0);

      mapGroup.selectAll("circle.facility").classed("highlighted", false);
    });
}

function renderFacilities(facilityLocations) {
  const facilitiesSelection = mapGroup
    .selectAll("circle.facility")
    .data(facilityLocations, (d) => `${d.name}-${d.latitude}-${d.longitude}`);

  facilitiesSelection.exit().remove();

  facilitiesSelection
    .attr("cx", (d) => {
      if (d.longitude !== null && d.latitude !== null) {
        return projection([d.longitude, d.latitude])[0];
      } else {
        return null;
      }
    })
    .attr("cy", (d) => {
      if (d.longitude !== null && d.latitude !== null) {
        return projection([d.longitude, d.latitude])[1];
      } else {
        return null;
      }
    })
    .attr("r", 5)
    .attr("fill", (d) => (d.count > 0 ? facilityColorScale(d.count) : "none"))
    .attr("opacity", 0.7)
    .classed("highlighted", false)
    .on("mouseover", function (event, d) {
      if (d.count > 0) {
        d3.select(this).attr("stroke", "white").attr("stroke-width", 2);

        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
          .transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip.html(
          `<strong>${d.name}</strong><br/>Country: ${d.country}<br/>Exoplanets Discovered: ${d.count}`
        );
      }
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", null).attr("stroke-width", null);

      tooltip.transition().duration(200).style("opacity", 0);
    });

  facilitiesSelection
    .enter()
    .append("circle")
    .attr("class", "facility")
    .attr("cx", (d) => {
      if (d.longitude !== null && d.latitude !== null) {
        return projection([d.longitude, d.latitude])[0];
      } else {
        return null;
      }
    })
    .attr("cy", (d) => {
      if (d.longitude !== null && d.latitude !== null) {
        return projection([d.longitude, d.latitude])[1];
      } else {
        return null;
      }
    })
    .attr("r", 5)
    .attr("fill", (d) => (d.count > 0 ? facilityColorScale(d.count) : "none"))
    .attr("opacity", 0.7)
    .classed("highlighted", false)
    .on("mouseover", function (event, d) {
      if (d.count > 0) {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
          .transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip.html(
          `<strong>${d.name}</strong><br/>Country: ${d.country}<br/>Exoplanets Discovered: ${d.count}`
        );
      }
    })
    .on("mouseout", function (d) {
      tooltip.transition().duration(500).style("opacity", 0);
    });
}

function renderCountryLegend(maxCountryCount) {
  svg.selectAll("g.legend-country").remove();

  const legendWidth = 300;
  const legendHeight = 10;

  const legendSvg = svg
    .append("g")
    .attr("class", "legend-country")
    .attr(
      "transform",
      `translate(${width - legendWidth - 50}, ${height - 100})`
    );

  const defsLegend = legendSvg.append("defs");

  const linearGradientCountry = defsLegend
    .append("linearGradient")
    .attr("id", "linear-gradient-country")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

  linearGradientCountry
    .selectAll("stop")
    .data([
      { offset: "0%", color: "#333" },
      { offset: "1%", color: "#BF0000" },
      { offset: "50%", color: "#FFFF00" },
      { offset: "100%", color: "#ADD8E6" },
    ])
    .enter()
    .append("stop")
    .attr("offset", (d) => d.offset)
    .attr("stop-color", (d) => d.color);

  legendSvg
    .append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#linear-gradient-country)");

  const xScaleLegend = d3
    .scaleLinear()
    .domain([0, maxCountryCount])
    .range([0, legendWidth]);

  const xAxisLegend = d3
    .axisBottom(xScaleLegend)
    .ticks(5)
    .tickFormat(d3.format("d"));

  legendSvg
    .append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(xAxisLegend);

  legendSvg
    .append("text")
    .attr("x", legendWidth / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .text("Exoplanets Discovered (Country)");
}

function renderFacilityLegend(maxFacilityCount) {
  svg.selectAll("g.legend-facility").remove();

  const legendWidth = 300;
  const legendHeight = 10;

  const legendX = width - legendWidth - 50;
  const legendY = height - 40;

  const legendSvg = svg
    .append("g")
    .attr("class", "legend-facility")
    .attr("transform", `translate(${legendX}, ${legendY})`);

  const defsLegend = legendSvg.append("defs");

  const linearGradientFacility = defsLegend
    .append("linearGradient")
    .attr("id", "linear-gradient-facility")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

  linearGradientFacility
    .selectAll("stop")
    .data([
      { offset: "0%", color: facilityColorScale(0) },
      { offset: "100%", color: facilityColorScale(maxFacilityCount) },
    ])
    .enter()
    .append("stop")
    .attr("offset", (d) => d.offset)
    .attr("stop-color", (d) => d.color);

  legendSvg
    .append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#linear-gradient-facility)");

  const xScaleLegend = d3
    .scaleLinear()
    .domain([0, maxFacilityCount])
    .range([0, legendWidth]);

  const xAxisLegend = d3
    .axisBottom(xScaleLegend)
    .ticks(5)
    .tickFormat(d3.format("d"));

  legendSvg
    .append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(xAxisLegend);

  legendSvg
    .append("text")
    .attr("x", legendWidth / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .text("Exoplanets Discovered (Facility)");
}

const zoom = d3
  .zoom()
  .scaleExtent([1, 8])
  .on("zoom", function (event) {
    mapGroup.attr("transform", event.transform);
  });

svg.call(zoom);

d3.select("#ground").on("change", function () {
  currentFilters.ground = this.checked;
  updateVisualization(currentDate);
});

d3.select("#space").on("change", function () {
  currentFilters.space = this.checked;
  updateVisualization(currentDate);
});
