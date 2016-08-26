
app.util.li = function(anID){

    getLIData(anID);

    function getLIData(anID){
        //app.data.li.liDataCheck = {'basic': '', 'license': '', 'permit': ''}
        var basicUrl = app.globals.li_api + "locations(" + anID + ")?$format=json"
        var licenseUrl = app.globals.li_api + "locations(" + anID + ")/licenses?$format=json"
        var permitUrl = app.globals.li_api + "locations(" + anID + ")/permits?$format=json"

        $.when(
            $.ajax({
                url: basicUrl,
                data: {
                    format: 'json'
                },
                success: function(data) {
                    app.data.li.curLI_basic = data
                    //app.data.li.liDataCheck['basic'] = 1
                },
                type: 'GET'
            }),
            $.ajax({
                url: licenseUrl,
                data: {
                    format: 'json'
                },
                success: function(data) {
                    app.data.li.curLI_licenses = data
                    //app.data.li.liDataCheck['license'] = 1
                },
                type: 'GET'
            }),
            $.ajax({
                url: permitUrl,
                data: {
                    format: 'json'
                },
                success: function(data) {
                    app.data.li.curLI_permits = data
                    //app.data.li.liDataCheck['permit'] = 1
                },
                type: 'GET'
            })
        ).done(function(){
            //console.log(app.data.li.liDataCheck['basic'])
            //console.log(app.data.li.liDataCheck['license'])
            //console.log(app.data.li.liDataCheck['permit'])
            renderLI();
        })
    }

    function renderLI(){
        if (app.data.li.curLI_licenses.d.results.length){
            for (i = 0; i < app.data.li.curLI_licenses.d.results.length; i++){
                LILicenses[i] = app.data.li.curLI_licenses.d.results[i].license_number
            }
        }
    }


}