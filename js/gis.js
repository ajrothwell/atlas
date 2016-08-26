
var app = {};
app.gis = (function () {
    //var map
    var queryParcel = L.esri.query({
        url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/PWD_PARCELS/FeatureServer/0'
    })

    return {
        initMap : function () {
            var CITY_HALL = [39.952388, -75.163596];
            map = L.map('map', {
               zoomControl: false,
            //   measureControl: true,
            });
            map.setView(CITY_HALL, 16);

            // Basemaps
            var baseMapLight = L.esri.tiledMapLayer({
                url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer"
            });
            var baseMapDark = L.esri.tiledMapLayer({
                url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Slate/MapServer"
            });
            var baseMapImagery2015 = L.esri.tiledMapLayer({
                url: "https://tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityImagery_2015_3in/MapServer"
            });
            baseMapLight.addTo(map);

            // Overlays
            var overlayZoning = L.esri.tiledMapLayer({
                url: '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/ZoningMap_tiled/MapServer'
            });
            var overlayHS = L.esri.featureLayer({
                url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/SchoolDist_Catchments_HS/FeatureServer/0'
            });
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

            // one of 2 ways to call findAddress()
            map.on('click', function(e) {
                app.settings.moveMode = false
                // GIS query
                queryParcel.contains(e.latlng)
                queryParcel.run(function(error, featureCollection, response){  // this is a slow process - only want to do it once
                    var address = featureCollection.features[0].properties.ADDRESS
                    app.data.gis.curFeatGeo = featureCollection.features[0].geometry
                    app.gis.drawPolygon(app.data.gis.curFeatGeo)
                    // AIS ajax
                    var aisUrl = app.globals.ais_api + address
                    $.ajax({
                        url: aisUrl,
                        data: {
                            format: 'json'
                        },
                        success: function(data) {
                            app.util.ais(data);
                            //findAddress(data);
                        },
                        type: 'GET'
                    });
                });
            });
        }, // end of initMap

        getGeom : function(latlon){
            queryParcel.contains(latlon)
            queryParcel.run(function(error, featureCollection, response){  // you shouldn't do this again if you already have
                app.data.gis.curFeatGeo = featureCollection.features[0].geometry
                app.gis.drawPolygon(app.data.gis.curFeatGeo)
            });
        }, // end of getGeom

        //function drawPolygon(someGeometry){
        drawPolygon : function(someGeometry) {
            if (map.hasLayer(app.data.gis.curPolygon)){
                map.removeLayer(app.data.gis.curPolygon)
            }
            app.data.gis.curFeatCoord_del = app.data.gis.curFeatGeo.coordinates[0]
            app.data.gis.curFeatFlipCoord_del = []
            for (i = 0; i < app.data.gis.curFeatCoord_del.length; i++){
                app.data.gis.curFeatFlipCoord_del[i] = []
                app.data.gis.curFeatFlipCoord_del[i][0] = app.data.gis.curFeatCoord_del[i][1]
                app.data.gis.curFeatFlipCoord_del[i][1] = app.data.gis.curFeatCoord_del[i][0]
            }
            app.data.gis.curPolygon = L.polygon([app.data.gis.curFeatFlipCoord_del], {
                color: 'blue',
                weight: 2
            })
            map.addLayer(app.data.gis.curPolygon)
        } // end of drawPolygon
    }; // end of return
})(); // end of app.gis

$(function () {
    app.gis.initMap();
});