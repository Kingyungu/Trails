import Mapbox from '@rnmapbox/maps';

// Replace with your Mapbox public access token (starts with pk.)
Mapbox.setAccessToken('YOUR_MAPBOX_PUBLIC_TOKEN');
Mapbox.setTelemetryEnabled(false);

export default Mapbox;
