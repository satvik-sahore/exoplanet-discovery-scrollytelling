let overallLabels = [];
let overallValues = [];
let preKeplerData = {};
let postKeplerData = {};
let detailChart = null;

// Function to fetch and parse the CSV file
async function fetchCSV(fileName) {
    const response = await fetch(fileName);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const text = await response.text();
    return text.split("\n").map(row => row.split(",").map(cell => cell.trim()));
}

// Function to load datasets and initialize the overall chart
async function loadDatasets() {
    try {
        // Load cleaned_detection_methods.csv
        const detectionData = await fetchCSV("cleaned_detection_methods.csv");
        overallLabels = detectionData.slice(1).map(row => {
            const method = row[0].toLowerCase(); // Ensure all labels are lowercase
            return method.charAt(0).toUpperCase() + method.slice(1); // Capitalize first letter
        });
        overallValues = detectionData.slice(1).map(row => parseInt(row[1], 10));

        // Load Comparison_of_Pre-_and_Post-Kepler_Discovery_Methods.csv
        const comparisonData = await fetchCSV("Comparison_of_Pre-_and_Post-Kepler_Discovery_Methods.csv");
        comparisonData.slice(1).forEach(row => {
            if (row.length >= 3) {
                const method = row[0].toLowerCase();
                preKeplerData[method] = parseFloat(row[1]) || 0;
                postKeplerData[method] = parseFloat(row[2]) || 0;
            }
        });

        console.log("Pre-Kepler Data:", preKeplerData);
        console.log("Post-Kepler Data:", postKeplerData);

        // Initialize the overall chart
        generateOverallChart();
    } catch (error) {
        console.error("Error loading datasets:", error);
    }
}


// Function to generate the overall detection methods pie chart
function generateOverallChart() {
    const ctx = document.getElementById("overallChart").getContext("2d");
    new Chart(ctx, {
        type: "pie",
        data: {
            labels: overallLabels,
            datasets: [{
                label: "Overall Detection Methods",
                data: overallValues,
                backgroundColor: [
                    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
                    "#9966FF", "#FF9F40", "#A9A9A9", "#76D7C4",
                    "#F7DC6F", "#85C1E9", "#A569BD"
                ],
                borderColor: "white", // Set border color to black
                borderWidth: 2, // Set border width to 1 pixel
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: 'white', // Set label text color to white
                        font: {
                            size: 12 // Adjust font size if needed
                        }
                    }
                },
                title: {
                    display: true,
                    text: "Overall Detection Methods",
                    color: 'white'
                }
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const clickedIndex = elements[0].index;
                    const method = overallLabels[clickedIndex];
                    showDetailChart(method);
                }
            }
        }
    });
}

// Function to generate Pre- and Post-Kepler chart for the selected method
function showDetailChart(method) {
    const detailChartContainer = document.getElementById("detailChartContainer");
    detailChartContainer.style.display = "block"; // Ensure the container is visible

    // Normalize the method name
    const normalizedMethod = method.toLowerCase();

    // Validate if data exists for the selected method
    if (!(normalizedMethod in preKeplerData) || !(normalizedMethod in postKeplerData)) {
        alert(`No data found for "${method}" in the Pre- and Post-Kepler datasets.`);
        return;
    }

    // Retrieve data for the selected method
    const preKeplerValue = preKeplerData[normalizedMethod];
    const postKeplerValue = postKeplerData[normalizedMethod];

    console.log(`Pre-Kepler Value for ${method}:`, preKeplerValue);
    console.log(`Post-Kepler Value for ${method}:`, postKeplerValue);

    // If the chart already exists, update it instead of creating a new one
    if (detailChart) {
        detailChart.data.labels = ["Pre-Kepler", "Post-Kepler"];
        detailChart.data.datasets[0].data = [preKeplerValue, postKeplerValue];
        detailChart.data.datasets[0].label = `${method} - Pre and Post Kepler`;
        detailChart.options.plugins.title.text = `${method} - Pre and Post Kepler`;
        detailChart.update(); // Update the chart with animation
    } else {
        // Generate the combined pie chart if it doesn't exist
        const detailCtx = document.getElementById("detailChart").getContext("2d");
        detailChart = new Chart(detailCtx, {
            type: "pie",
            data: {
                labels: ["Pre-Kepler", "Post-Kepler"],
                datasets: [{
                    label: `${method} - Pre and Post Kepler`,
                    data: [preKeplerValue, postKeplerValue],
                    backgroundColor: ["#FF6384", "#36A2EB"],
                    borderColor: "white", // Set border color to black
                    borderWidth: 2, // Set border width to 1 pixel
                }]
                
            },
            options: {
                responsive: true,
                animation: {
                    duration: 1000, // Animation duration in milliseconds
                    easing: "easeInOutQuad" // Smooth easing effect
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: 'white', // Set label text color to white
                            font: {
                                size: 12 // Adjust font size if needed
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: `${method} - Pre and Post Kepler`,
                        color: 'white'
                    }
                }
            }
        });
    }
}


// Load datasets and initialize the chart
loadDatasets();
