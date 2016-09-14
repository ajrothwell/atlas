
app.views.schools = function(){
    //console.log('schools function ran')

    var overlayHS = L.esri.featureLayer({
                url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/SchoolDist_Catchments_HS/FeatureServer/0'
            });
    overlayHS.addTo(map)
}