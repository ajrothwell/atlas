
app.util.history = function(){
    $.when(app.util.resolveAddress, app.util.resolveGis, app.util.resolveOpa).done(function(){
        history.replaceState({
            address: app.data.ais.curAIS.properties.street_address,
            ais: app.data.ais.curAIS,
            opa: app.data.opa.curOPA,
            //gis: app.data.gis.curPolygon
            gis: app.data.gis.curFeatFlipCoord,
            latlon: app.settings.latlon
        }, null, null)
        app.util.renderAll()

    })
}

app.util.renderAll = function(){
    //alert('it is running render all')
    app.gis.drawPolygon(history.state.gis, history.state.latlon)
    app.util.renderAIS(history.state.ais)
    app.util.renderOPA(history.state.opa)
    app.settings.moveMode = true
}

