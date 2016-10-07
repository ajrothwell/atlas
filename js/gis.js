/*
This is run first, before app.js
some app. variables must be created here
*/

var app = {};
app.util = {}

app.gis = (function () {

    //app.util.resolveGis = $.Deferred();
    //var map
    var queryParcel = L.esri.query({
        url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/PWD_PARCELS/FeatureServer/0'
    })

    var overlayHS = L.esri.featureLayer({
                url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/SchoolDist_Catchments_HS/FeatureServer/0'
            });

    return {
        //theObject: queryParcel,
        initMap : function () {
            app.settings.clickedOnMap = false
            app.settings.moveMode = true
            var CITY_HALL = [39.952388, -75.163596];
            map = L.map('map', {
               zoomControl: false,
               //measureControl: true,
            });
            map.setView(CITY_HALL, 18);

            // Basemaps
            var baseMapLight = L.esri.tiledMapLayer({
                url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer",
                maxZoom: 22
            });
            var baseMapDark = L.esri.tiledMapLayer({
                url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Slate/MapServer",
                maxZoom: 22
            });
            var baseMapImagery2015 = L.esri.tiledMapLayer({
                url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2015_3in/MapServer",
                maxZoom: 22
            });
            baseMapLight.addTo(map);

            // Overlays
            var overlayZoning = L.esri.tiledMapLayer({
                url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/ZoningMap_tiled/MapServer'
            });
            /*var overlayHS = L.esri.featureLayer({
                url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/SchoolDist_Catchments_HS/FeatureServer/0'
            });*/
            var overlayES = L.esri.featureLayer({
                url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/SchoolDist_Catchments_ES/FeatureServer/0'
            });
            var overlayMS = L.esri.featureLayer({
                url: 'services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/SchoolDist_Catchments_MS/FeatureServer/0'
            });

            var baseLayers = {
                'Light':        baseMapLight,
                'Dark':         baseMapDark,
                'Imagery 2015': baseMapImagery2015,
            };
            /*
            var overlays = {
                'Zoning':       overlayZoning,
                'PWD Parcels':  overlayPwdParcels,
                // 'Land Use': landUse,
            };
            */

            // Controls
            L.control.layers(baseLayers, '', {position: 'topright'}).addTo(map);
            //L.control.layers(baseLayers, overlays, {position: 'topright'}).addTo(map);
            //var measureControl = new L.Control.Measure({position: 'topright'});
            //measureControl.addTo(map);
            new L.Control.Zoom({position: 'topright'}).addTo(map);
            app.data.gis.layerGroup.addTo(map)


            // one of 2 ways to call AIS
            map.on('click', function(e) {
                app.settings.clickedOnMap = true
                app.settings.moveMode = false
                // GIS query
                queryParcel.contains(e.latlng)
                queryParcel.run(function(error, featureCollection, response){  // this is a slow process - only want to do it once
                    var address = featureCollection.features[0].properties.ADDRESS
                    app.data.gis.curFeatGeo = featureCollection.features[0].geometry
                    var params = {'address': address}
                    var queryStringParams = app.util.serializeQueryStringParams(params)
                    if (queryStringParams) {
                        history.pushState(null, null, '?' + queryStringParams); // when click it pushes a new history.state - just an href, not a state obj
                        window.scroll(0, 0);
                        app.util.ais(address) // calls ais, which does a replaceState to the history to add objects
                    }
                });
            });
        }, // end of initMap

        getGeomFromLatLon : function(latlon){
            //console.log('it did getGeom')
            queryParcel.contains(latlon)
            queryParcel.run(function(error, featureCollection, response){
                app.data.gis.curFeatGeo = featureCollection.features[0].geometry
                app.gis.flipCoords(app.data.gis.curFeatGeo)
            });
        },

        flipCoords : function(geoObj){
            app.data.gis.curFeatCoord = geoObj.coordinates[0]
            app.data.gis.curFeatFlipCoord = []
            for (i = 0; i < app.data.gis.curFeatCoord.length; i++){
                app.data.gis.curFeatFlipCoord[i] = []
                app.data.gis.curFeatFlipCoord[i][0] = app.data.gis.curFeatCoord[i][1]
                app.data.gis.curFeatFlipCoord[i][1] = app.data.gis.curFeatCoord[i][0]
            }
            app.util.resolveGis.resolve();
        }, // end of flipCoords

        //function drawPolygon(geoObj){
        drawPolygon : function(geoObj, thelatlon) {
            app.data.gis.layerGroup.clearLayers()
            if (app.settings.moveMode == true){  // true if search button was clicked or if page is loaded w address parameter, false if a parcel was clicked
                latlon = new L.LatLng(thelatlon[0],thelatlon[1])
                map.setView(latlon, 20)
            }
            app.data.gis.layerGroup.addLayer(L.polygon([geoObj], {
                color: 'blue',
                weight: 2
            }))
        } // end of drawPolygon

    }; // end of return
})(); // end of app.gis

$(function () {
    app.gis.initMap();
});