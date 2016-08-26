
app.util.ais = function(data){

    findAddress(data)

    function findAddress(data) {
        //set resolveAddress to .$Deferred()
        app.util.resolveAddress = $.Deferred();
        //reset opa variable
        app.util.opaNum = null
        app.settings.opaRetrieved = false
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
                app.util.resolveAddress.resolve();
            })

        } else {
            app.data.ais.curAIS = data.features[0]
            app.util.resolveAddress.resolve();
        }


        $.when(app.util.resolveAddress).done(function(){
            // translate the coordinates from stateplane to latlon
            var trans = proj4(app.globals.PennStatePlane, app.globals.WGS84, app.data.ais.curAIS.geometry.coordinates)
            var lon = trans[0]
            var lat = trans[1]
            latlon = new L.LatLng(lat,lon)
            if (app.settings.moveMode == true){  // this will be true if the search button was clicked, false if a parcel was clicked
                //console.log(map)
                map.setView(latlon, 18)
                //console.log(app.test.cat)
                //app.test.inTest()
                //console.log(app.test.mouse)
                app.gis.getGeom(latlon) // the parcel query only needs to happen if the search button was clicked - if parcel was clicked it is already done
            }

            // add AIS data to UI
            renderAIS(app.data.ais.curAIS)
            app.util.opaNum = app.data.ais.curAIS.properties.opa_account_num

            // if it found an L&I address key, hit L&I API (set this so it only happens when you click the accordian)

            //if (app.data.ais.curAIS.properties.li_address_key != ''){
            //    app.util.li(app.data.ais.curAIS.properties.li_address_key)
            //}

            if ($('#opaDataRow').attr('style')=='display: block;'){
                app.util.opa(app.data.ais.curAIS.properties.opa_account_num)
            }

        }) // end of when

    }

    function renderAIS(anAISFeature){
        for (key in anAISFeature.properties){
            app.util.AISFeatKeys.push(key)
        }
        for (i = 0; i < app.util.AISFeatKeys.length; i++){
            if (app.hooks[app.util.AISFeatKeys[i]]){
                app.hooks[app.util.AISFeatKeys[i]].text(anAISFeature.properties[[app.util.AISFeatKeys[i]]]);
            }
        }
    }


}