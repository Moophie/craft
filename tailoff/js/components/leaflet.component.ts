import { Ajax } from '../utils/ajax';

export class LeafletComponent {
  // private L = window['L'];

  constructor() {
    const maps = document.querySelectorAll('.leaflet-map');
    if (maps.length > 0) {
      Array.from(maps).forEach((map: HTMLElement) => {
        this.initMap(map);
      });
    }
  }

  private async initMap(map: HTMLElement) {
    // @ts-ignore
    const leaflet = await import('leaflet/dist/leaflet.js');
    const lmap = leaflet.map(map, {
      // center: [data[0].locations[0].lat, data[0].locations[0].lng],
      zoom: 13,
      tap: false,
      scrollWheelZoom: false,
    });

    if (map.getAttribute('data-address')) {
      Ajax.call({
        url: `https://nominatim.openstreetmap.org/search/${map.getAttribute(
          'data-address'
        )}?format=json&addressdetails=1&limit=1`,
        success: (data) => {
          leaflet.marker([data[0].lat, data[0].lon]).addTo(lmap);
          lmap.setView([data[0].lat, data[0].lon], 14);
        },
      });
    }

    if (map.getAttribute('data-points-obj')) {
      const data = JSON.parse(map.getAttribute('data-points-obj'));
      lmap.fitBounds(data.map((p) => [...p.locations.map((m) => [m.lat, m.lng])]));
      data.forEach((marker) => {
        const pin = leaflet.marker([marker.lat, marker.lng]).addTo(lmap);
        const address = marker.address != '' ? `<div class="">${marker.address}</div>` : '';
        const popupContent = `${address}`;
        pin.bindPopup(popupContent);
      });
    }
    leaflet
      .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      })
      .addTo(lmap);
  }
}
