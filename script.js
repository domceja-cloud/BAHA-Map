mapboxgl.accessToken = 'pk.eyJ1IjoiY3dpbG1vdHQiLCJhIjoiY2s2bWRjb2tiMG1xMjNqcDZkbGNjcjVraiJ9.2nNOYL23A1cfZSE4hdC9ew';

const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/cwilmott/cmg5px11u00ef01sm3fr65ro0',
  center: [-122.27, 37.8], // [lng, lat]
  zoom: 9
});

map.on('load', () => {
  // 1️⃣ Add GeoJSON source
  map.addSource('points-data', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/domceja-cloud/BAHA-Map/main/map.geojson'
  });

  // 2️⃣ Add circle layer for markers
  map.addLayer({
    id: 'points-layer',
    type: 'circle',
    source: 'points-data',
    paint: {
      'circle-color': '#4264FB',
      'circle-radius': 6,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    }
  });

  // 3️⃣ Add text label layer using the "Landmark" property
  map.addLayer(
    {
      id: 'points-labels',
      type: 'symbol',
      source: 'points-data',
      layout: {
        'text-field': ['get', 'Landmark'], // pull label text from the Landmark field
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': 11,
        'text-offset': [0, 1.2], // move label slightly above the circle
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#0b2540',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1
      }
    },
    'points-layer' // ensures labels appear above the circles
  );

  // 4️⃣ Click event for popups
  map.on('click', 'points-layer', (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const properties = e.features[0].properties;

    const popupContent = `
      <div>
        <h3>${properties.Landmark}</h3>
        <p><strong>Address:</strong> ${properties.Address}</p>
        <p><strong>Architect & Date:</strong> ${properties["Architect + Dates"] || "N/A"}</p>
        <p><strong>Designated:</strong> ${properties.Designated}</p>
        ${properties.Link ? `<p><a href="${properties.Link}" target="_blank">More Information</a></p>` : ''}
        ${properties.Notes ? `<p><strong>Notes:</strong> ${properties.Notes}</p>` : ''}
      </div>
    `;

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(popupContent)
      .addTo(map);
  });

  // 5️⃣ Change cursor on hover
  map.on('mouseenter', 'points-layer', () => {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'points-layer', () => {
    map.getCanvas().style.cursor = '';
  });
});
