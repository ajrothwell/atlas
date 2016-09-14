
app.util.opa = function(acntNum){
    //app.util.resolveOpa = $.Deferred();
    var opaUrl = app.globals.opa_api + acntNum //+ "?format=json"

    $.ajax(opaUrl,
        {dataType: app.settings.ajaxType,
        data: {format: 'json'}
        })
        .done(function(data){
            // If we get a 200 response but an 400 error code (ummmmm), treat it like a fail.

            if (!data) {
                history.replaceState({error: 'Failed to retrieve opa results. Please try another search.'}, '');
                return;
            }
            app.data.opa.curOPA = data
            app.util.resolveOpa.resolve();

        }
    )
}

app.util.renderOPA = function(anOpaFeature){
    // Render owners
    app.hooks.propertyOwners.empty();
    //app.data.opa.curOPA.data.property.ownership.owners.forEach(function(owner) {
    anOpaFeature.data.property.ownership.owners.forEach(function(owner) {
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
