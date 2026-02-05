const facilities = [
  {
    name: "Acton Sky Portal Observatory",
    type: "Ground",
    locations: [
      {
        latitude: 42.44,
        longitude: -71.11,
        country: "United States of America",
      },
    ],
  },
  {
    name: "Anglo-Australian Telescope",
    type: "Ground",
    locations: [
      { latitude: -31.283, longitude: 149.063, country: "Australia" },
    ],
  },
  {
    name: "Apache Point Observatory",
    type: "Ground",
    locations: [
      {
        latitude: 32.78,
        longitude: -105.82,
        country: "United States of America",
      },
    ],
  },
  {
    name: "Arecibo Observatory",
    type: "Ground",
    locations: [
      {
        latitude: 18.344,
        longitude: -66.752,
        country: "United States of America",
      },
    ],
  },
  {
    name: "Atacama Large Millimeter Array (ALMA)",
    type: "Ground",
    locations: [{ latitude: -23.0206, longitude: -67.7541, country: "Chile" }],
  },
  {
    name: "Bohyunsan Optical Astronomical Observatory",
    type: "Ground",
    locations: [
      { latitude: 35.731, longitude: 128.986, country: "South Korea" },
    ],
  },
  {
    name: "Calar Alto Observatory",
    type: "Ground",
    locations: [{ latitude: 37.07, longitude: -2.46, country: "Spain" }],
  },
  {
    name: "Cerro Tololo Inter-American Observatory",
    type: "Ground",
    locations: [{ latitude: -30.1658, longitude: -70.7366, country: "Chile" }],
  },

  {
    name: "CHaracterising ExOPlanets Satellite (CHEOPS)",
    type: "Space",
    locations: [
      { latitude: 52.52, longitude: 13.405, country: "Germany" },
      { latitude: 48.8566, longitude: 2.3522, country: "France" },
      { latitude: 51.5074, longitude: -0.1278, country: "United Kingdom" },
      { latitude: 40.4168, longitude: -3.7038, country: "Spain" },
      { latitude: 41.9028, longitude: 12.4964, country: "Italy" },
      { latitude: 52.3676, longitude: 4.9041, country: "Netherlands" },
      { latitude: 46.948, longitude: 7.4474, country: "Switzerland" },
      { latitude: 50.8503, longitude: 4.3517, country: "Belgium" },
      { latitude: 59.3293, longitude: 18.0686, country: "Sweden" },
      { latitude: 55.6761, longitude: 12.5683, country: "Denmark" },
    ],
  },

  {
    name: "CoRoT",
    type: "Space",
    locations: [{ country: "France" }],
  },
  {
    name: "European Southern Observatory",
    type: "Ground",
    locations: [
      { latitude: -24.627, longitude: -70.404, country: "Chile" },
      { latitude: -29.27, longitude: -70.76, country: "Chile" },
    ],
  },

  {
    name: "European Space Agency (ESA) Gaia Satellite",
    type: "Space",
    locations: [
      { latitude: 52.52, longitude: 13.405, country: "Germany" },
      { latitude: 48.8566, longitude: 2.3522, country: "France" },
      { latitude: 51.5074, longitude: -0.1278, country: "United Kingdom" },
      { latitude: 40.4168, longitude: -3.7038, country: "Spain" },
      { latitude: 41.9028, longitude: 12.4964, country: "Italy" },
      { latitude: 52.3676, longitude: 4.9041, country: "Netherlands" },
      { latitude: 46.948, longitude: 7.4474, country: "Switzerland" },
      { latitude: 50.8503, longitude: 4.3517, country: "Belgium" },
      { latitude: 59.3293, longitude: 18.0686, country: "Sweden" },
      { latitude: 55.6761, longitude: 12.5683, country: "Denmark" },
    ],
  },

  {
    name: "Fred Lawrence Whipple Observatory",
    type: "Ground",
    locations: [
      {
        latitude: 31.687,
        longitude: -110.865,
        country: "United States of America",
      },
    ],
  },
  {
    name: "Gemini Observatory",
    type: "Ground",
    locations: [
      {
        latitude: 19.826,
        longitude: -155.474,
        country: "United States of America",
      },
      { latitude: -30.1667, longitude: -70.815, country: "Chile" },
    ],
  },
  {
    name: "Haleakala Observatory",
    type: "Ground",
    locations: [
      {
        latitude: 20.709,
        longitude: -156.253,
        country: "United States of America",
      },
    ],
  },
  {
    name: "HATNet",
    type: "Ground",
    locations: [
      {
        latitude: 31.35,
        longitude: -110.9,
        country: "United States of America",
      },
      {
        latitude: 19.8207,
        longitude: -155.4681,
        country: "United States of America",
      },
    ],
  },
  {
    name: "HATSouth",
    type: "Ground",
    locations: [
      { latitude: -29.0233, longitude: -70.8122, country: "Chile" },
      { latitude: -32.915, longitude: 20.267, country: "South Africa" },
      { latitude: -31.277, longitude: 149.07, country: "Australia" },
    ],
  },
  {
    name: "Hubble Space Telescope",
    type: "Space",
    locations: [{ country: "United States of America" }],
  },
  {
    name: "Infrared Survey Facility",
    type: "Ground",
    locations: [
      { latitude: -31.283, longitude: 149.063, country: "Australia" },
    ],
  },
  {
    name: "James Webb Space Telescope (JWST)",
    type: "Space",
    locations: [{ country: "United States of America, Europe, Canada" }],
  },
  {
    name: "K2",
    type: "Space",
    locations: [
      {
        latitude: 38.9072,
        longitude: -77.0369,
        country: "United States of America",
      },
    ],
  },
  {
    name: "KELT",
    type: "Ground",
    locations: [
      {
        latitude: 31.35,
        longitude: -110.9,
        country: "United States of America",
      },
      { latitude: -30.1667, longitude: -70.815, country: "Chile" },
    ],
  },
  {
    name: "KELT-North",
    type: "Ground",
    locations: [
      {
        latitude: 31.35,
        longitude: -110.9,
        country: "United States of America",
      },
    ],
  },
  {
    name: "Kepler",
    type: "Space",
    locations: [
      {
        latitude: 46.8083,
        longitude: -100.7837,
        country: "United States of America",
      },
    ],
  },
  {
    name: "Kitt Peak National Observatory",
    type: "Ground",
    locations: [
      {
        latitude: 31.958,
        longitude: -111.598,
        country: "United States of America",
      },
    ],
  },
  {
    name: "KMTNet",
    type: "Ground",
    locations: [
      { latitude: -31.634, longitude: 26.311, country: "South Africa" },
    ],
  },
  {
    name: "La Silla Observatory",
    type: "Ground",
    locations: [{ latitude: -29.27, longitude: -70.76, country: "Chile" }],
  },
  {
    name: "Large Binocular Telescope Observatory",
    type: "Ground",
    locations: [
      {
        latitude: 32.444,
        longitude: -109.808,
        country: "United States of America",
      },
    ],
  },
  {
    name: "Las Campanas Observatory",
    type: "Ground",
    locations: [{ latitude: -29.013, longitude: -70.692, country: "Chile" }],
  },
  {
    name: "Leoncito Astronomical Complex",
    type: "Ground",
    locations: [{ latitude: -31.4, longitude: -69.2, country: "Argentina" }],
  },
  {
    name: "Lick Observatory",
    type: "Ground",
    locations: [
      {
        latitude: 37.3333,
        longitude: -121.6333,
        country: "United States of America",
      },
    ],
  },
  {
    name: "Lowell Observatory",
    type: "Ground",
    locations: [
      {
        latitude: 35.1983,
        longitude: -111.6513,
        country: "United States of America",
      },
    ],
  },
  {
    name: "Mauna Kea Observatory",
    type: "Ground",
    locations: [
      {
        latitude: 19.8207,
        longitude: -155.4681,
        country: "United States of America",
      },
    ],
  },
  {
    name: "McDonald Observatory",
    type: "Ground",
    locations: [
      {
        latitude: 30.68,
        longitude: -104.421,
        country: "United States of America",
      },
    ],
  },
  {
    name: "MEarth Project",
    type: "Ground",
    locations: [
      {
        latitude: 31.2,
        longitude: -110.9,
        country: "United States of America",
      },
      { latitude: -30.1667, longitude: -70.815, country: "Chile" },
    ],
  },
  {
    name: "MOA",
    type: "Ground",
    locations: [
      { latitude: -44.0253, longitude: 169.157, country: "New Zealand" },
    ],
  },
  {
    name: "NASA Infrared Telescope Facility (IRTF)",
    type: "Ground",
    locations: [
      {
        latitude: 19.819,
        longitude: -155.471,
        country: "United States of America",
      },
    ],
  },
  {
    name: "Next-Generation Transit Survey (NGTS)",
    type: "Ground",
    locations: [{ latitude: -24.627, longitude: -70.404, country: "Chile" }],
  },
  {
    name: "OGLE",
    type: "Ground",
    locations: [{ latitude: -29.013, longitude: -70.692, country: "Chile" }],
  },
  {
    name: "Okayama Astrophysical Observatory",
    type: "Ground",
    locations: [{ latitude: 34.6613, longitude: 133.9163, country: "Japan" }],
  },
  {
    name: "Palomar Observatory",
    type: "Ground",
    locations: [
      {
        latitude: 33.356,
        longitude: -116.864,
        country: "United States of America",
      },
    ],
  },
  {
    name: "Paranal Observatory",
    type: "Ground",
    locations: [{ latitude: -24.627, longitude: -70.404, country: "Chile" }],
  },
  {
    name: "Parkes Observatory",
    type: "Ground",
    locations: [
      { latitude: -32.996, longitude: 148.265, country: "Australia" },
    ],
  },
  {
    name: "Qatar",
    type: "Ground",
    locations: [{ latitude: 25.2, longitude: 51.54, country: "Qatar" }],
  },
  {
    name: "Roque de los Muchachos Observatory",
    type: "Ground",
    locations: [{ latitude: 28.758, longitude: -17.879, country: "Spain" }],
  },
  {
    name: "South African Radio Astronomy Observatory (SAR)",
    type: "Ground",
    locations: [
      { latitude: -30.8256, longitude: 21.4167, country: "South Africa" },
    ],
  },
  {
    name: "SPECULOOS Southern Observatory",
    type: "Ground",
    locations: [{ latitude: -24.627, longitude: -70.404, country: "Chile" }],
  },
  {
    name: "Spitzer Space Telescope",
    type: "Space",
    locations: [
      {
        latitude: 28.3922,
        longitude: -80.6077,
        country: "United States of America",
      },
    ],
  },
  {
    name: "Subaru Telescope",
    type: "Ground",
    locations: [
      {
        latitude: 19.821,
        longitude: -155.468,
        country: "United States of America",
      },
    ],
  },
  {
    name: "SuperWASP",
    type: "Ground",
    locations: [{ latitude: 28.758, longitude: -17.879, country: "Spain" }],
  },
  {
    name: "SuperWASP-North",
    type: "Ground",
    locations: [{ latitude: 28.758, longitude: -17.879, country: "Spain" }],
  },
  {
    name: "SuperWASP-South",
    type: "Ground",
    locations: [{ latitude: -32.8, longitude: 20.0, country: "South Africa" }],
  },
  {
    name: "Teide Observatory",
    type: "Ground",
    locations: [{ latitude: 28.29, longitude: -16.52, country: "Spain" }],
  },
  {
    name: "Thueringer Landessternwarte Tautenburg",
    type: "Ground",
    locations: [{ latitude: 50.9461, longitude: 11.7314, country: "Germany" }],
  },
  {
    name: "Transiting Exoplanet Survey Satellite (TESS)",
    type: "Space",
    locations: [
      {
        latitude: 33.4484,
        longitude: -111.0937,
        country: "United States of America",
      },
    ],
  },
  {
    name: "TrES",
    type: "Ground",
    locations: [
      {
        latitude: 33.356,
        longitude: -116.864,
        country: "United States of America",
      },
    ],
  },
  {
    name: "United Kingdom Infrared Telescope",
    type: "Ground",
    locations: [
      {
        latitude: 19.825,
        longitude: -155.468,
        country: "United States of America",
      },
    ],
  },
  {
    name: "University of Canterbury Mt John Observatory",
    type: "Ground",
    locations: [{ latitude: -44.0, longitude: 169.1, country: "New Zealand" }],
  },
  {
    name: "Very Long Baseline Array",
    type: "Ground",
    locations: [
      {
        latitude: 34.07883,
        longitude: -107.61831,
        country: "United States of America",
      },
    ],
  },
  {
    name: "W. M. Keck Observatory",
    type: "Ground",
    locations: [
      {
        latitude: 19.8207,
        longitude: -155.4681,
        country: "United States of America",
      },
    ],
  },
  {
    name: "WASP-South",
    type: "Ground",
    locations: [{ latitude: -32.8, longitude: 20.0, country: "South Africa" }],
  },
  {
    name: "Wide-field Infrared Survey Explorer (WISE) Sat",
    type: "Space",
    locations: [
      {
        latitude: 40.7128,
        longitude: -74.006,
        country: "United States of America",
      },
    ],
  },
  {
    name: "Winer Observatory",
    type: "Ground",
    locations: [
      {
        latitude: 31.35,
        longitude: -110.9,
        country: "United States of America",
      },
    ],
  },
  {
    name: "Xinglong Station",
    type: "Ground",
    locations: [{ latitude: 40.4, longitude: 117.6, country: "China" }],
  },
  {
    name: "XO",
    type: "Ground",
    locations: [{ latitude: 28.29, longitude: -16.52, country: "Spain" }],
  },
  {
    name: "Yunnan Astronomical Observatory",
    type: "Ground",
    locations: [{ latitude: 25.028, longitude: 102.727, country: "China" }],
  },
];
