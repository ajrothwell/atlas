
window.app = app;
app.views = {};

app.globals = {}
app.globals.ais_api = 'https://api.phila.gov/ais/v1/addresses/'
//app.globals.ais_api = 'http://ec2-54-175-56-73.compute-1.amazonaws.com/addresses/'
app.globals.li_api = 'http://api.phila.gov/li/v1/'
app.globals.opa_api = 'https://api.phila.gov/opa/v1.1/account/'
app.globals.PennStatePlane = '+proj=lcc +lat_1=40.96666666666667 +lat_2=39.93333333333333 +lat_0=39.33333333333334 +lon_0=-77.75 +x_0=600000 +y_0=0 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs';
app.globals.WGS84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

app.settings = {}
app.settings.moveMode = false
app.settings.opaRetrieved = false

app.util = {}
app.util.AISFeatKeys = []
//app.util.resolveAddress = $.Deferred()

app.data = {}
app.data.ais = {}
//app.data.ais.curAIS = {}
//app.data.ais.curAIS.geometry = {}
//app.data.ais.curAIS.geometry.coordinates = {}

app.data.gis = {}
app.data.gis.curFeatGeo = {}
app.data.gis.curFeatCoord_del
app.data.gis.curFeatFlipCoord_del = []
app.data.gis.curPolygon

app.data.opa = {}
app.data.opa.curOPA

app.data.li = {}
//app.data.li.liArray = []
//app.data.li.liDataCheck = {'basic': '', 'license': '', 'permit': ''}
app.data.li.curLI_basic = {}
app.data.li.curLI_permits = {}
app.data.li.curLI_licenses = {}

// Set up pointers to useful elements
app.hooks = {};

var LILicenses = []

// TEMP: just for mockup. Listen for clicks on data row link.
$('.data-row-link').click(function (e) {
    e.preventDefault()
    $dataRow = $(this).next();
    $('.data-row:visible').slideUp(350)
    if (!$dataRow.is(':visible')) $(this).next().slideDown(350)
});

// Make ext links open in new window
$('a').each(function() {
   var a = new RegExp('/' + window.location.host + '/');
   if(!a.test(this.href)) {
       $(this).click(function(event) {
           event.preventDefault();
           event.stopPropagation();
           window.open(this.href, '_blank');
       });
   }
});

$('#schoolTrig').click(function(){
    overlayHS.addTo(map)
});

// OPA
$('#opaTrig').click(function(){
    //if(app.data.ais.curAIS.properties.opa_account_num){
    if(app.util.opaNum && app.settings.opaRetrieved == false){
        app.util.opa(app.data.ais.curAIS.properties.opa_account_num)
    }
});

$('[data-hook]').each(function (i, el) {
  var dataHook = $(el).data('hook'),
      // Get _all_ elements for a data-hook value, not just the single element
      // in the current iteration. Supports multiple elements with the same
      // data-hook value.
      $el = $('[data-hook="' + dataHook + '"]');
  // Convert hyphen-names to camelCase in hooks
  var hook = dataHook.replace(/-([a-z])/g, function (m) {
    return m[1].toUpperCase();
  });
  app.hooks[hook] = $el;
});

// Pull a human-readable sales date from what the OPA API gives us
app.util.formatSalesDate = function (salesDate) {
  var d, m;
  if (m = /(-?\d+)-/.exec(salesDate)) {
    d = new Date(+m[1]);
    return (d.getMonth() + 1) + '/' + d.getDate() + '/' +  d.getFullYear();
  } else return '';
};

// one of 2 ways to call findAddress()
$('#search-button').click(function(){
    app.settings.moveMode = true
    var address = $('#search-input').val()
    var aisUrl = app.globals.ais_api + address + '?format=json&gatekeeperKey=35ae5b7bf8f0ff2613134935ce6b4c1e'
    // AIS ajax
    $.ajax({
        url: aisUrl,
        data: {
            format: 'json'
        },
        //error: function() {
        //    alert('error')
        //},
        success: function(data) {
            app.util.ais(data);
            //findAddress(data);
        },
        type: 'GET'
    })
})



// https://api.tiles.mapbox.com/v4/mapbox.streets/11/1024/681.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpandmbXliNDBjZWd2M2x6bDk3c2ZtOTkifQ._QA7i5Mpkd_m30IGElHziw