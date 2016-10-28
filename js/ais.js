
app.util.ais = function(address){
    var aisUrl = app.globals.ais_api + address + '?format=json&gatekeeperKey=35ae5b7bf8f0ff2613134935ce6b4c1e'
    $.ajax(aisUrl,
        {dataType: app.settings.ajaxType})
        .done(function(data){
            // If we get a 200 response but an 400 error code (ummmmm), treat it like a fail.
            if (!data) {
                history.replaceState({error: 'Failed to retrieve results. Please try another search.'}, '');
                return;
            }
            findAddress(data)
        }
    )
    function findAddress(data) {
        app.util.resolveAddress = $.Deferred();
        app.util.resolveOpa = $.Deferred();
        app.util.resolveGis = $.Deferred();

        // empty the previous list of addresses left in modal
        $('#addressList').empty()
        // set the "curAIS" - might require selecting from modal
        if (data.features.length > 1) {
            for (i = 0; i < data.features.length; i++){
                $('#addressList').append('<li><a href="#" number='+i+'><span class="tab">'+data.features[i].properties.street_address+'</span></a></li>')
            }
            $('#addressModal').foundation('open');
            $('#addressModal a').click(function(){
                $('#search-input').val($(this).text())
                $('#addressModal').foundation('close');
                $('#addressList').empty()

                app.data.ais.curAIS = data.features[$(this).attr('number')]
                var address = data.features[$(this).attr('number')].properties.street_address
                var params = {'address': address}
                var queryStringParams = app.util.serializeQueryStringParams(params)
                //console.log(queryStringParams)
                history.replaceState(null, null, '?' + queryStringParams)
                app.util.resolveAddress.resolve();

            })
        } else {
            app.data.ais.curAIS = data.features[0]
            app.util.resolveAddress.resolve();
        }
        $.when(app.util.resolveAddress).done(function(){
            // translate the coordinates from stateplane to latlon
            //var trans = proj4(app.globals.PennStatePlane, app.globals.WGS84, app.data.ais.curAIS.geometry.coordinates)
            //var lon = trans[0]
            //var lat = trans[1]
            //latlon = new L.LatLng(lat,lon)
            app.settings.latlon = [app.data.ais.curAIS.geometry.coordinates[1],app.data.ais.curAIS.geometry.coordinates[0]]
            latlon = new L.LatLng(app.data.ais.curAIS.geometry.coordinates[1],app.data.ais.curAIS.geometry.coordinates[0])
            //if (app.settings.moveMode == true){  // this will be true if the search button was clicked or if page is loaded with address parameter, false if a parcel was clicked
            //    map.setView(latlon, 18)
            //}
            if (app.settings.clickedOnMap == false){
                //console.log('it routed to clickedonmap false')
                app.gis.getGeomFromLatLon(latlon)
            } else {
                //console.log('it routed to straight to flipCoords')
                app.gis.flipCoords(app.data.gis.curFeatGeo)
            }
            // check opa stuff - see if I shouldn't do this here
            //app.util.opaNum = app.data.ais.curAIS.properties.opa_account_num
            //if ($('#opaDataRow').attr('style')=='display: block;'){ // I think function shouldn't call other function
            app.util.opa(app.data.ais.curAIS.properties.opa_account_num)
            //}
            // if it found an L&I address key, hit L&I API (set this so it only happens when you click the accordian)
            //if (app.data.ais.curAIS.properties.li_address_key != ''){
            //    app.util.li(app.data.ais.curAIS.properties.li_address_key)
            //}
            app.util.history()
        }) // end of when
    }
}

app.util.renderAIS = function(anAISFeature){
    for (key in anAISFeature.properties){
        app.util.AISFeatKeys.push(key)
    }
    for (i = 0; i < app.util.AISFeatKeys.length; i++){
        if (app.hooks[app.util.AISFeatKeys[i]]){
            app.hooks[app.util.AISFeatKeys[i]].text(anAISFeature.properties[[app.util.AISFeatKeys[i]]]);
        }
    }
}
