
app.util.opa = function(acntNum){

    getOPAData(acntNum)

    function getOPAData(anAccount){
        var opaUrl = app.globals.opa_api + anAccount //+ "?format=json"
        $.ajax({
            url: opaUrl,
            data: {
                format: 'json'
            },
            success: function(data) {
                app.data.opa.curOPA = data
                renderOPA()
                app.settings.opaRetrieved = true
            },
            type: 'GET'
        })
    }

    function renderOPA(){
        //console.log('starting render')
        // Render owners

        app.hooks.propertyOwners.empty();
        app.data.opa.curOPA.data.property.ownership.owners.forEach(function(owner) {
        //state.opa.ownership.owners.forEach(function (owner) {
            app.hooks.propertyOwners.append($('<div>').text(owner));
        });

        // Render improvement stuff
        //app.hooks.improvementDescription.text(app.data.opa.curOPA.data.property.characteristics.description);
        app.hooks.landArea.text(accounting.formatNumber(app.data.opa.curOPA.data.property.characteristics.land_area));
        app.hooks.improvementArea.text(accounting.formatNumber(app.data.opa.curOPA.data.property.characteristics.improvement_area));

        // Empty zoning in prep for details
        //app.hooks.zoning.empty();

        // Render sales details
        app.hooks.salesPrice.text(accounting.formatMoney(app.data.opa.curOPA.data.property.sales_information.sales_price));
        app.hooks.salesDate.text(app.util.formatSalesDate(app.data.opa.curOPA.data.property.sales_information.sales_date));

        app.hooks.assessedValue2017.text(accounting.formatMoney(app.data.opa.curOPA.data.property.valuation_history[0].market_value))
    }

}