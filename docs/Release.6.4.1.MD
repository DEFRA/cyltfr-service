# Check Your Long Term Flood Risk Services (cyltfr-service)

# v6.4.1

## Release date 6 May 2026

### Library option change

Remove the use of the option `rawResponse` in calls to `@esri/arcgis-rest-request` due to that option
being depricated. `@esri/arcgis-rest-request` is causing a `console.warn` message to be displayed
for every request.
