const width = 960;
const height = 600;

// Define a gap size between legends
const legendGap = 20; // 20 pixels gap

// Select the SVG element and set its dimensions
const svg = d3.select("#world-map")
  .attr("width", width)
  .attr("height", height)
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("preserveAspectRatio", "xMidYMid meet");

// Create a container group for map and facilities
const mapGroup = svg.append("g").attr("class", "map-container");

// Define the map projection
const projection = d3.geoMercator()
  .scale(130) // Adjust the scale as needed
  .translate([width / 2, height / 1.5]); // Center the map

// Define the path generator using the projection
const path = d3.geoPath().projection(projection);

// Initialize color scales
let countryColorScale = d3.scaleLinear()
  .domain([0, 0.5, 1]) // Three domain points: low, medium, high
  .range(["#BF0000", "#FFFF00", "#ADD8E6"]);

let facilityColorScale = d3.scaleSequential(d3.interpolateInferno)
  .domain([0, 1]); // Placeholder domain, will update based on data

// Initialize tooltip
const tooltip = d3.select("body").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0);

// Initialize variables to hold data
let countriesData = [];
let exoplanetsData = [];
let currentFilters = { ground: true, space: true };

// Variables for Timeline Slider
let currentDate = null;
let sliderPlaying = false;
let playInterval = null;
let dateExtent = [];

// Load facilities data from facilities.js
// Ensure 'facilities.js' is loaded before 'planets.js' in index.html

// Load TopoJSON and CSV data
Promise.all([
  d3.json("data/world.json"),
  d3.csv("data/exoplanets.csv", d => {
    return {
      ...d,
      disc_pubdate: d3.timeParse("%Y-%m")(d.disc_pubdate) // Parse YYYY-MM
    };
  })
]).then(function([worldData, exoplanetData]) {

  // Store exoplanet data globally
  exoplanetsData = exoplanetData;

  // Convert TopoJSON to GeoJSON
  countriesData = topojson.feature(worldData, worldData.objects.countries).features;

  // Determine the date extent for the slider
  dateExtent = d3.extent(exoplanetsData, d => d.disc_pubdate);

  // Initialize the timeline slider
  initializeSlider();

  // Initial aggregation based on default filters and initial date
  updateVisualization(new Date(dateExtent[0]));

}).catch(function(error){
  console.error("Error loading or processing data:", error);
});

// Initialize the Timeline Slider
function initializeSlider() {
  // Select the slider and date display elements
  const slider = d3.select("#timeline-slider");
  const currentDateDisplay = d3.select("#current-date");
  const playButton = d3.select("#play-button");

  // Define the range of the slider
  const startDate = dateExtent[0];
  const endDate = dateExtent[1];

  // Generate all months between startDate and endDate
  const allMonths = [];
  let current = new Date(startDate);
  current.setDate(1); // Ensure we're at the start of the month
  while (current <= endDate) {
    allMonths.push(new Date(current));
    current = d3.timeMonth.offset(current, 1);
  }

  // Update slider attributes
  slider
    .attr("min", 0)
    .attr("max", allMonths.length - 1)
    .attr("step", 1)
    .property("value", 0)
    .on("input", function() {
      const index = +this.value;
      currentDate = allMonths[index];
      currentDateDisplay.text(d3.timeFormat("%Y-%m")(currentDate));
      updateVisualization(currentDate);
    });

  // Initialize currentDate
  currentDate = allMonths[0];
  currentDateDisplay.text(d3.timeFormat("%Y-%m")(currentDate));

  // Play button event
  playButton.on("click", function() {
    if (sliderPlaying) {
      // Pause the slider
      clearInterval(playInterval);
      sliderPlaying = false;
      playButton.text("Play");
    } else {
      // Play the slider
      playInterval = setInterval(() => {
        let currentValue = +slider.property("value");
        if (currentValue < allMonths.length - 1) {
          slider.property("value", currentValue + 1).dispatch("input");
        } else {
          // Stop when reaching the end
          clearInterval(playInterval);
          sliderPlaying = false;
          playButton.text("Play");
        }
      }, 10); // Adjust the speed (milliseconds) as needed
      sliderPlaying = true;
      playButton.text("Pause");
    }
  });
}

// Update Visualization Function
function updateVisualization(selectedDate) {

  //----------------------------
  // 1. Data Aggregation
  //----------------------------

  // 1.1. Filter Facilities Based on Current Filters (Ground and Space)
  const filteredFacilities = facilities.filter(facility => {
    if (facility.type === "Ground" && currentFilters.ground) return true;
    if (facility.type === "Space" && currentFilters.space) return true;
    return false;
  });

  // 1.2. Flatten Facilities with Multiple Locations
  // Each location is treated as a separate entity for visualization
  const facilityLocations = [];
  filteredFacilities.forEach(facility => {
    if (facility.locations && facility.locations.length > 0) {
      facility.locations.forEach(loc => {
        facilityLocations.push({
          name: facility.name,
          type: facility.type,
          latitude: loc.latitude || null, // Use null if undefined
          longitude: loc.longitude || null, // Use null if undefined
          country: loc.country,
          count: 0 // Initialize count, will update later
        });
      });
    } else {
      // Handle facilities without specific locations
      facilityLocations.push({
        name: facility.name,
        type: facility.type,
        latitude: null,
        longitude: null,
        country: facility.country, // For space-based, country is at location level
        count: 0
      });
    }
  });

  // 1.3. Aggregate Exoplanet Counts per Facility up to selectedDate
  // Filter exoplanets up to the selectedDate
  const filteredExoplanets = exoplanetsData.filter(d => d.disc_pubdate <= selectedDate);

  // Count exoplanets per facility
  const facilityCountMap = d3.rollups(
    filteredExoplanets,
    v => v.length,
    d => d.disc_facility
  );

  const facilityCountObj = Object.fromEntries(facilityCountMap);

  // Assign counts to each facility location
  facilityLocations.forEach(loc => {
    if (loc.name in facilityCountObj) {
      loc.count = facilityCountObj[loc.name];
    }
  });

  // 1.4. Aggregate Counts per Country
  // Sum counts based on the country of each facility location
  const countryCounts = d3.rollups(
    facilityLocations.filter(loc => loc.country !== null),
    v => d3.sum(v, d => d.count),
    d => d.country
  );

  const countryCountMap = Object.fromEntries(countryCounts);

  // 1.5. Update Country Properties with Exoplanet Counts
  countriesData.forEach(country => {
    const countryName = country.properties.name;
    country.properties.exoplanetCount = countryCountMap[countryName] || 0; // Assign count or 0
  });

  // 1.6. Determine Maximum Counts for Color Scales
  // Update the color scale domain dynamically
  const maxCountryCount = d3.max(Object.values(countryCountMap)) || 1; // Avoid zero max

  const maxFacilityCount = d3.max(facilityLocations, d => d.count) || 1;

  // 1.7. Update Color Scales Domains
  countryColorScale.domain([0, maxCountryCount * 0.5, maxCountryCount]); // Set three domain points
  facilityColorScale.domain([0, maxFacilityCount]);

  //----------------------------
  // 2. Rendering
  //----------------------------

  // 2.1. Render or Update the Country-Level Thermal Map
  renderMap();

  // 2.2. Render or Update the Facility-Level Thermal Map
  renderFacilities(facilityLocations);

  // 2.3. Render or Update the Country Legend
  renderCountryLegend(maxCountryCount);

  // 2.4. Render or Update the Facility Legend
  renderFacilityLegend(maxFacilityCount);

  //----------------------------
  // 3. Optional: Logging (For Debugging)
  //----------------------------

  // Console Log: Updated Countries Data with Exoplanet Counts
  console.log("=== Updated Countries Data with Exoplanet Counts ===");
  countriesData.forEach(d => {
    console.log(`Country: ${d.properties.name}, Exoplanets Discovered: ${d.properties.exoplanetCount}`);
  });
  console.log("=====================================================");
}

// Render Country-Level Thermal Map Function
function renderMap() {
  // DATA JOIN for countries
  const countries = mapGroup.selectAll("path.country")
    .data(countriesData, d => d.properties.name); // Use country name as key

  // EXIT old elements not present in new data
  countries.exit().remove();

  // UPDATE existing elements
  countries
    .attr("fill", d => {
      const value = d.properties.exoplanetCount;
      return value > 0 ? countryColorScale(value) : "#333";
    })
    .on("mouseover", function(event, d) {
      // Show tooltip on hover for country
      tooltip.style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 28) + "px")
             .transition()
             .duration(200)
             .style("opacity", .9);
      tooltip.html(`<strong>${d.properties.name}</strong><br/>Exoplanets Discovered: ${d.properties.exoplanetCount}`);

      // Highlight associated facilities
      const hoveredCountry = d.properties.name;

      // Find all facilities that have at least one location in the hovered country
      const associatedFacilities = facilities
        .filter(facility => facility.locations.some(loc => {
          if (!loc.country) return false;
          // Split countries by comma and trim whitespace
          const countriesList = loc.country.split(',').map(c => c.trim());
          return countriesList.includes(hoveredCountry);
        }))
        .map(facility => facility.name);

      // Highlight all circles of associated facilities
      mapGroup.selectAll("circle.facility")
        .filter(c => associatedFacilities.includes(c.name))
        .classed("highlighted", true);
    })
    .on("mouseout", function(d) {
      // Hide tooltip when not hovering
      tooltip.transition()
             .duration(500)
             .style("opacity", 0);

      // Remove highlighting from all facilities
      mapGroup.selectAll("circle.facility")
        .classed("highlighted", false);
    });

    countries.enter().append("path")
    .attr("class", "country")
    .attr("d", path)
    .attr("fill", d => {
      const value = d.properties.exoplanetCount;
      return value > 0 ? countryColorScale(value) : "#333"; // Use dark grey for 0 or null
    })
    .attr("stroke", "#333") // Stroke color for country borders
    .attr("stroke-width", 0.5)
    .on("mouseover", function(event, d) {
      // Show tooltip on hover for country
      tooltip.style("left", (event.pageX + 10) + "px")
             .style("top", (event.pageY - 28) + "px")
             .transition()
             .duration(200)
             .style("opacity", .9);
      tooltip.html(`<strong>${d.properties.name}</strong><br/>Exoplanets Discovered: ${d.properties.exoplanetCount}`);
  
      // Highlight associated facilities
      const hoveredCountry = d.properties.name;
  
      // Find all facilities that have at least one location in the hovered country
      const associatedFacilities = facilities
        .filter(facility => facility.locations.some(loc => {
          if (!loc.country) return false;
          const countriesList = loc.country.split(',').map(c => c.trim());
          return countriesList.includes(hoveredCountry);
        }))
        .map(facility => facility.name);
  
      // Highlight all circles of associated facilities
      mapGroup.selectAll("circle.facility")
        .filter(c => associatedFacilities.includes(c.name))
        .classed("highlighted", true);
    })
    .on("mouseout", function(d) {
      // Hide tooltip when not hovering
      tooltip.transition()
             .duration(500)
             .style("opacity", 0);
  
      // Remove highlighting from all facilities
      mapGroup.selectAll("circle.facility")
        .classed("highlighted", false);
    });
}

// Render Facility-Level Thermal Map Function
function renderFacilities(facilityLocations) {
  // DATA JOIN for facilities
  const facilitiesSelection = mapGroup.selectAll("circle.facility")
    .data(facilityLocations, d => `${d.name}-${d.latitude}-${d.longitude}`); // Unique key per facility location

  // EXIT old elements not present in new data
  facilitiesSelection.exit().remove();

  // UPDATE existing elements
  facilitiesSelection
    .attr("cx", d => {
      if (d.longitude !== null && d.latitude !== null) {
        return projection([d.longitude, d.latitude])[0];
      } else {
        return null; // Do not position circle if no coordinates
      }
    })
    .attr("cy", d => {
      if (d.longitude !== null && d.latitude !== null) {
        return projection([d.longitude, d.latitude])[1];
      } else {
        return null;
      }
    })
    .attr("r", 5) // Fixed radius for all facilities
    .attr("fill", d => d.count > 0 ? facilityColorScale(d.count) : "none")
    .attr("opacity", 0.7)
    .classed("highlighted", false) // Ensure highlighted class is reset
    .on("mouseover", function(event, d) {
      if (d.count > 0) {
        // Show tooltip on hover
        tooltip.style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 28) + "px")
               .transition()
               .duration(200)
               .style("opacity", .9);
        tooltip.html(`<strong>${d.name}</strong><br/>Country: ${d.country}<br/>Exoplanets Discovered: ${d.count}`);
      }
    })
    .on("mouseout", function(d) {
      // Hide tooltip when not hovering
      tooltip.transition()
             .duration(500)
             .style("opacity", 0);
    });

  // ENTER new elements
  facilitiesSelection.enter().append("circle")
    .attr("class", "facility")
    .attr("cx", d => {
      if (d.longitude !== null && d.latitude !== null) {
        return projection([d.longitude, d.latitude])[0];
      } else {
        return null; // Do not position circle if no coordinates
      }
    })
    .attr("cy", d => {
      if (d.longitude !== null && d.latitude !== null) {
        return projection([d.longitude, d.latitude])[1];
      } else {
        return null;
      }
    })
    .attr("r", 5) // Fixed radius for all facilities
    .attr("fill", d => d.count > 0 ? facilityColorScale(d.count) : "none")
    .attr("opacity", 0.7)
    .classed("highlighted", false) // Ensure highlighted class is reset
    .on("mouseover", function(event, d) {
      if (d.count > 0) {
        // Show tooltip on hover
        tooltip.style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 28) + "px")
               .transition()
               .duration(200)
               .style("opacity", .9);
        tooltip.html(`<strong>${d.name}</strong><br/>Country: ${d.country}<br/>Exoplanets Discovered: ${d.count}`);
      }
    })
    .on("mouseout", function(d) {
      // Hide tooltip when not hovering
      tooltip.transition()
             .duration(500)
             .style("opacity", 0);
    });
}

function renderCountryLegend(maxCountryCount) {
  svg.selectAll("g.legend-country").remove();

  const legendWidth = 300;
  const legendHeight = 10;

  const legendSvg = svg.append("g")
    .attr("class", "legend-country")
    .attr("transform", `translate(${width - legendWidth - 50}, ${height - 100})`);

  // Define gradient for the legend
  const defsLegend = legendSvg.append("defs");

  const linearGradientCountry = defsLegend.append("linearGradient")
    .attr("id", "linear-gradient-country")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

  linearGradientCountry.selectAll("stop")
    .data([
      { offset: "0%", color: "#333" },       // Dark grey
      { offset: "1%", color: "#BF0000" },  // Red
      { offset: "50%", color: "#FFFF00" },  // Orange
      { offset: "100%", color: "#ADD8E6" }  // Yellow
    ])
    .enter().append("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);

  // Draw the rectangle and fill with gradient
  legendSvg.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#linear-gradient-country)");

  const xScaleLegend = d3.scaleLinear()
    .domain([0, maxCountryCount])
    .range([0, legendWidth]);

  const xAxisLegend = d3.axisBottom(xScaleLegend)
    .ticks(5)
    .tickFormat(d3.format("d"));

  legendSvg.append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(xAxisLegend);

  legendSvg.append("text")
    .attr("x", legendWidth / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .text("Exoplanets Discovered (Country)");
}



// Render Facility-Level Thermal Map Legend
function renderFacilityLegend(maxFacilityCount) {
  // Remove existing facility legend if any
  svg.selectAll("g.legend-facility").remove();

  // Define legend dimensions
  const legendWidth = 300;
  const legendHeight = 10;

  // Calculate dynamic positions based on SVG dimensions and gap
  const legendX = width - legendWidth - 50; // Adjust as needed
  const legendY = height - 40; // Positioned below the country legend

  // Create a new legend group for facility thermal map
  const legendSvg = svg.append("g")
    .attr("class", "legend-facility")
    .attr("transform", `translate(${legendX}, ${legendY})`);

  // Define gradient for facility thermal map
  const defsLegend = legendSvg.append("defs");

  const linearGradientFacility = defsLegend.append("linearGradient")
    .attr("id", "linear-gradient-facility")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

  linearGradientFacility.selectAll("stop")
    .data([
      {offset: "0%", color: facilityColorScale(0)},
      {offset: "100%", color: facilityColorScale(maxFacilityCount)}
    ])
    .enter().append("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);

  // Draw the rectangle and fill with gradient
  legendSvg.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#linear-gradient-facility)");

  // Add scale
  const xScaleLegend = d3.scaleLinear()
    .domain([0, maxFacilityCount])
    .range([0, legendWidth]);

  const xAxisLegend = d3.axisBottom(xScaleLegend)
    .ticks(5)
    .tickFormat(d3.format("d"));

  legendSvg.append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(xAxisLegend);

  // Legend Label
  legendSvg.append("text")
    .attr("x", legendWidth / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .text("Exoplanets Discovered (Facility)");
}

// Implement Zoom and Pan Functionality
const zoom = d3.zoom()
  .scaleExtent([1, 8]) // Adjust the zoom scale extent as needed
  .on('zoom', function(event) {
    mapGroup.attr("transform", event.transform);
  });

// Apply Zoom Behavior to SVG
svg.call(zoom);

// Attach Event Listeners to Checkboxes
d3.select("#ground").on("change", function() {
  currentFilters.ground = this.checked;
  updateVisualization(currentDate);
});

d3.select("#space").on("change", function() {
  currentFilters.space = this.checked;
  updateVisualization(currentDate);
});
