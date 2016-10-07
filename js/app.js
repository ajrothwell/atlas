/*
This is run second, after gis.js
most app. variables are initiated here
*/

window.app = app;
app.views = {};

var theParams
var theSerQSParams

app.globals = {}
app.globals.ais_api = 'https://api.phila.gov/ais/v1/addresses/'
app.globals.li_api = 'http://api.phila.gov/li/v1/'
app.globals.opa_api = 'https://api.phila.gov/opa/v1.1/account/'
app.globals.PennStatePlane = '+proj=lcc +lat_1=40.96666666666667 +lat_2=39.93333333333333 +lat_0=39.33333333333334 +lon_0=-77.75 +x_0=600000 +y_0=0 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs';
app.globals.WGS84 = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

app.settings = {}
app.settings.latlon = []
//app.settings.moveMode = true
//app.settings.clickedOnMap = false

app.util.resolveAddress = $.Deferred();
app.util.resolveOpa = $.Deferred();
app.util.resolveGis = $.Deferred();
app.util.AISFeatKeys = []

app.data = {}
app.data.gis = {}
app.data.gis.layerGroup = new L.LayerGroup()

//app.data = {}
app.data.ais = {}
//app.data.ais.curAIS = {}
//app.data.ais.curAIS.geometry = {}
//app.data.ais.curAIS.geometry.coordinates = {}

//app.data.gis = {}
app.data.gis.curFeatGeo = {}
app.data.gis.curFeatCoord
app.data.gis.curFeatFlipCoord = []
app.data.gis.curPolygon

app.data.opa = {}
app.data.opa.curOPA

/*
app.data.li = {}
app.data.li.curLI_basic = {}
app.data.li.curLI_permits = {}
app.data.li.curLI_licenses = {}
*/

// Set up pointers to useful elements
app.hooks = {};

//var LILicenses = []

// global settings
app.settings = {
  ajaxType: $.support.cors ? 'json' : 'jsonp'
};


// Routing - whenever page loads or history is changed, this happens
app.route = function () {
    //console.log(window.location.hash)
    $('.data-row:visible').slideUp(350)
    var curHash = window.location.hash

    if (curHash.length > 2){ // if it is longer than "#/"
        if(curHash.endsWith('/')) curHash = curHash.slice(0, -1)
        var hashEnd = curHash.substr(2)
        var hashHook = hashEnd+'Anchor'
        //console.log(hashEnd)
        $dataRow = app.hooks[hashHook].next();
        if (!$dataRow.is(':visible')){
            $dataRow.slideDown(350)//$(this).next().slideDown(350)
        }
        if (hashEnd == 'schools'){
            app.views[hashEnd]();
        }
    }
    var params = $.deparam(window.location.search.substr(1));
    if (params.address) {
        //alert('it routed to having an address')
        if (!history.state){ //if there is no history, do a new api call
            //alert('it rounted to having no history and address: ' + params.address)
            app.util.ais(params.address)
        } else if (params.address.toLowerCase() != history.state.address.toLowerCase()){ //if the query string does not match the history, do a new api call
            app.util.ais(params.address)
            //app.views.property(params.p);
            //} else if (Object.keys(params).length) {
            //params = app.util.normalizeSearchQuery(params);
            //if (params) {
            //  showSearchOption(params.type);
            //  app.views.results(params);
            //}
            //} else {
            //console.log('address is bad')
            //app.views.front();
        } else {
            app.util.renderAll()
        }
    }
};

// Route on page load
$(app.route);
// when history changes, a popstate event takes place, so route is called
window.onpopstate = app.route;

// anchor tag clicks
$('.data-row-link').click(function (e) {
    e.preventDefault(); // since this is prevented, it does not change history
    $dataRow = $(this).next();
    var newUrl = window.location.origin+window.location.pathname+window.location.search+this.hash
    var state = history.state
    if ($dataRow.is(':visible')){
        //console.log('double clicked')
        var newUrl = window.location.origin+window.location.pathname+window.location.search+'#/'
        history.replaceState(state, null, newUrl)
        app.route()
        return
    }
    history.replaceState(state, null, newUrl) // this does not actually trigger a hashchange event
    app.route()
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

// set up app.hooks for calling HTML elements
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

// Serialize a form into an object, assuming only one level of depth
app.util.serializeObject = function (form) {
  var obj = {};
  $.each($(form).serializeArray(), function (i, element) {
      if (!obj[element.name]) {
        obj[element.name] = element.value;
      }
    });
  return obj;
};

// Serialize an object to query string params
app.util.serializeQueryStringParams = function(obj) {
  var str = [];
  for(var p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  }
  return str.join('&');
};

// one of 2 ways to call AIS
$('#theForm').on('submit', function(e){
    e.preventDefault();
    app.settings.moveMode = true
    app.settings.clickedOnMap = false
    var params = app.util.serializeObject(this)
    var queryStringParams = app.util.serializeQueryStringParams(params)
    if (params) {
        $(this).find('input').blur();
        history.pushState(null, params, '?' + queryStringParams); // what if this is a replacestate until it resolves the address, then becomes a push?  when you submit it pushes a new history.state - but it just has an href, not a state obj
        window.scroll(0, 0);
        app.util.ais(params.address) // calls ais, which does a replaceState to the history to add objects
    }
})

/*
app.hooks.propertyAnchor.click(function(){
    if(app.util.opaNum && app.settings.opaRetrieved == false){
        app.util.opa(app.data.ais.curAIS.properties.opa_account_num)
    }
});
*/

