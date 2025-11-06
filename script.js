mapboxgl.accessToken =
  "pk.eyJ1IjoiY3dpbG1vdHQiLCJhIjoiY2s2bWRjb2tiMG1xMjNqcDZkbGNjcjVraiJ9.2nNOYL23A1cfZSE4hdC9ew";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/cwilmott/cmg5px11u00ef01sm3fr65ro0",
  center: [-122.27, 37.8],
  zoom: 9
});

map.addControl(
  new mapboxgl.NavigationControl({
    visualizePitch: true,
    showZoom: true,
    showCompass: true
  }),
  "top-right"
);

map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true
  }),
  "top-right"
);

map.on("load", () => {
  map.addSource("points-data", {
    type: "geojson",
    data: "https://raw.githubusercontent.com/domceja-cloud/BAHA-Map/main/map.geojson",
    generateId: true
  });

  map.addLayer({
    id: "points-layer",
    type: "circle",
    source: "points-data",
    paint: {
      "circle-color": "#4264FB",
      "circle-radius": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        9, 
        6  
      ],
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
      "circle-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        1,
        0.75
      ]
    }
  });

  map.addLayer(
    {
      id: "points-labels",
      type: "symbol",
      source: "points-data",
      layout: {
        "text-field": ["get", "Landmark"],
        "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
        "text-size": 11,
        "text-offset": [0, 1.2],
        "text-anchor": "top"
      },
      paint: {
        "text-color": "#0b2540",
        "text-halo-color": "#ffffff",
        "text-halo-width": 1
      }
    },
    "points-layer"
  );

  map.on("click", "points-layer", (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const properties = e.features[0].properties;

    const popupContent = `
      <div class="popup-inner">
        <h3>${properties.Landmark}</h3>
        <p><strong>Address:</strong> ${properties.Address}</p>
        <p><strong>Architect & Date:</strong> ${
          properties["Architect + Dates"] || "N/A"
        }</p>
        <p><strong>Designated:</strong> ${properties.Designated}</p>
        ${
          properties.Link
            ? `<p><a href="${properties.Link}" target="_blank">More Information</a></p>`
            : ""
        }
        ${
          properties.Notes
            ? `<p><strong>Notes:</strong> ${properties.Notes}</p>`
            : ""
        }
      </div>
    `;

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(popupContent)
      .addTo(map);
  });

  let hoveredId = null;

  map.on("mouseenter", "points-layer", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mousemove", "points-layer", (e) => {
    if (!e.features.length) return;

    const feature = e.features[0];

    if (hoveredId !== null) {
      map.setFeatureState(
        { source: "points-data", id: hoveredId },
        { hover: false }
      );
    }

    hoveredId = feature.id;

    map.setFeatureState(
      { source: "points-data", id: hoveredId },
      { hover: true }
    );
  });

  map.on("mouseleave", "points-layer", () => {
    if (hoveredId !== null) {
      map.setFeatureState(
        { source: "points-data", id: hoveredId },
        { hover: false }
      );
    }
    hoveredId = null;
    map.getCanvas().style.cursor = "";
  });

  map.once("idle", () => {
    const source = map.getSource("points-data");
    if (!source) return;

    const raw = /** @type {any} */ (source);
    const data = raw._data || (raw._options && raw._options.data);
    if (!data || !data.features) return;

    const bounds = new mapboxgl.LngLatBounds();
    data.features.forEach((feature) => {
      if (feature.geometry && feature.geometry.type === "Point") {
        bounds.extend(feature.geometry.coordinates);
      }
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 40 });
    }
  });
});
