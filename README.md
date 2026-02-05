# Exoplanet Discovery Scrollytelling

This project is an interactive data visualization narrative that explores the fascinating history and science of exoplanet discoveries. Using a scrollytelling format, it guides users through the evolution of discovery methods, the impact of missions like Kepler, and the search for potentially habitable worlds.

## 🌌 Project Overview

The "Voyage Through Exoplanet Discoveries" visualizes how our understanding of the universe has transformed—from early detections to the thousands of confirmed worlds we know today. The project combines narrative text with interactive charts to explain complex astronomical data in an engaging and accessible way.

## ✨ Key Features & Visualizations

The experience is divided into several interactive sections:

1.  **Cumulative Discoveries (Line Chart):**
    *   Visualizes the exponential growth of exoplanet discoveries over time.
    *   Highlights the dramatic surge in discoveries following the launch of key space missions.
    *   **Interaction:** Zoom, pan, and hover for specific yearly data.

2.  **The Kepler Era:**
    *   A deep dive into NASA's Kepler Space Telescope and the "Transit Method" that revolutionized the field.
    *   Includes animated visual transitions of the telescope and Earth.

3.  **Detection Methods (Pie Chart):**
    *   A comprehensive breakdown of techniques used to find planets (Transit, Radial Velocity, Direct Imaging, etc.).
    *   **Analysis:** Compares detection trends before and after the Kepler mission to showcase technological shifts.

4.  **Planet Characteristics (Scatterplot):**
    *   Explores the diversity of exoplanets by correlating attributes like radius, mass, and distance.
    *   **Habitability:** Color-coded categories to identify Earth-like planets and their potential for supporting life.

5.  **Global Contributions (Geospatial Map):**
    *   An interactive world map displaying the locations of ground-based and space-based discovery facilities.
    *   **Timeline:** A time slider to watch the expansion of global contributions over decades.

6.  **Search for Life (Custom Comparison):**
    *   **Custom Chart:** Sorts and visualizes habitable planets based on parameters like Earth Similarity Index (ESI).
    *   **Spider Plot:** A detailed multi-dimensional comparison of specific exoplanets against Earth's attributes (Mass, Temperature, Age).

## 🛠️ Technologies Used

*   **HTML5 & CSS3:** For structure and responsive styling.
*   **JavaScript (Vanilla):** Core logic for interactions.
*   **[Scrollama.js](https://github.com/russellgoldenberg/scrollama):** For handling scroll-driven events and narrative transitions.
*   **D3.js / Plotly / Other Libraries:** Used within the `plots/` directory for individual embedded visualizations.
*   **Google Fonts:** Inter and Montserrat for typography.

## 🚀 How to Run Locally

Since this project relies on local file paths and potentially ES modules or specific browser security policies for the visualizations (in iframes), it is recommended to run it using a local web server rather than opening `index.html` directly.

### Option 1: VS Code Live Server (Recommended)
1.  Open the project folder in **VS Code**.
2.  Install the **Live Server** extension.
3.  Right-click `index.html` and select **"Open with Live Server"**.

### Option 2: Python Simple HTTP Server
If you have Python installed, run a straightforward server from the command line:

```bash
# For Python 3
python -m http.server 8000

# For Python 2
python -m SimpleHTTPServer 8000
```

Then navigate to `http://localhost:8000` in your web browser.

## 📂 Project Structure

```
├── index.html       # Main narrative entry point
├── styles.css       # Global styles for the scrollytelling layout
├── main.js          # Logic for scrollama setup and image/iframe transitions
├── img/             # Assets (Earth, Kepler telescope, etc.)
├── plots/           # Standalone visualization modules embedded via iframes
│   ├── linechart/
│   ├── Keplers-PieChart/
│   ├── scatterplot/
│   ├── geospatial/
│   └── custom/
└── README.md        # Project documentation
```