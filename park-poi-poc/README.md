# Park POI PoC

Purpose: validate whether a user can specify a park by name and obtain POIs inside an automatically discovered park boundary without drawing a polygon first.

## Current stage

- Park name search: Nominatim / OpenStreetMap
- Boundary candidate: GeoJSON Polygon / MultiPolygon
- POI candidate source: OpenStreetMap via Overpass API
- Client-side filtering: point-in-polygon
- Output: Campsite Standard POI v1 JSON

## Important

This stage does **not** prove Wayfarer POI retrieval. OSM is used only to validate the boundary-selection UX, spatial filtering, and the Campsite Standard POI v1 adapter flow.

The POI provider is intentionally isolated conceptually so it can later be replaced by a Campsite Bridge / Wayfarer adapter without changing the Design Tool-side data model.

## PoC success condition

For a test site such as 葛西臨海公園:

1. User enters the park name.
2. A polygon boundary candidate is obtained automatically.
3. User can visually confirm the boundary.
4. POIs inside that boundary are extracted.
5. Extracted POIs can be exported as Campsite Standard POI v1 JSON.
