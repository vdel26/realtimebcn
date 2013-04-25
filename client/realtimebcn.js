// Define Minimongo collection and subscribe to db
Places = new Meteor.Collection("places");
Meteor.subscribe("places");

if (typeof API === 'undefined') {
  API = {};
}

API = function () {
  var dataset = [],
      CLIENTID = 'b80f0b2261fb47db926ce2e76e78d1d4';

  var onJsonLoaded = function (json){
    if (json.meta.code == 200) {
      var show = json.data;
      Session.set('photoset', show);
    } else{
      alert(json.meta.error_message);
    }
  };

  var getNewPhotos = function (place) {
    if (typeof place === "undefined") {
      var place = {};
      place.lat = '41.393294';
      place.lon = '2.16259';
      place.dist = '2000';
    }
    $.ajax({
      url: 'https://api.instagram.com/v1/media/search?callback=?',
      dataType: 'json',
      data: {lat: place.lat, lng: place.lon, distance:place.dist, client_id: CLIENTID},
      success: onJsonLoaded,
      statusCode: {
        500: function () {
          // instagram API endpoint returns 500 when it's down
          alert('Sorry, service is temporarily down.');
        }
    }
    });
    Session.set('loading', true);
  };
  return {
    getNewPhotos: getNewPhotos,
    clientid: CLIENTID
  };
}();

Meteor.startup(function(){
  // initialize app state
  Session.set('photoset', '');
  Session.set('selected', 'Barcelona');
  Session.set('zoomed', '');
  Session.set('windowtop', true);
  Session.set('listopen', false);
  Session.set('loading', true);

  // initialize fastclick
  new FastClick(document.body);

  // initialize letteringjs
  $('.header-title').lettering();

  // retrieve first set of photos
  API.getNewPhotos();

  $(window).scroll(function () {
    if (window.scrollY <= 0) {
      Session.set('windowtop', true);
    }
    else {
      Session.set('windowtop', false);
    }
  });
});

Template.instagram.rendered = function () {
  $('.photos-container').isotope({
    itemSelector: '.photo',
    layoutMode: 'fitRows'
  });

  Meteor.setTimeout(function () {
    $(window).trigger('resize');
  }, 1000);
  // ugly hack. needs fixing.
};

// HELPER to populate selector with place names
Handlebars.registerHelper('placesIterator', function (){
  var place_list = Places.find({});
  var out = "";
  place_list.forEach(function (place){
    out += "<li value="+place.name+">"+place.name+"</li>";
  });
  return out;
});

// HELPERS for IG template
Template.instagram.helpers({
// make json data available to the template
photoset: function(){
  return Session.get('photoset');
},
loading: function () {
  return Session.equals('loading', true) ? '' : 'hidden';
}
});

// HELPERS for MAIN template
Template.main.helpers({
windowtop: function () {
  return Session.equals("windowtop", true) ? 'windowtop' : '';
},
listopen: function () {
  return Session.equals("listopen", true) ? 'listopen' : '';
},
listclosed : function () {
  return Session.equals("listopen", true) ? '' : 'listclosed';
},
currentplace: function () {
  return Session.get('selected');
}
});

// EVENT MAP for INSTAGRAM template
Template.instagram.events({
'click .photo': function(event){
  $('.photos-container').toggleClass('greyed');

  if (Session.equals('zoomed', '')) {
    $('<img src='+this.images.standard_resolution.url+' alt="">').appendTo('#zoomed-image');
    Session.set('zoomed', this.images.standard_resolution.url);
  } else{
    $('#zoomed-image').children().remove();
    Session.set('zoomed', '');
  }
},
'click .button-more': function () {
  //
}
});

// EVENT MAP for MAIN template
Template.main.events({
'click .selector-button': function () {
  if (Session.equals('listopen', true)) {
    Session.set('listopen', false);
  }
  else {
    Session.set('listopen', true);
  }
},
'click .selector-options': function (event) {
  var selectedOption = event.target.innerHTML;
  var here = {};

  if (selectedOption == "around me") {
    window.navigator.geolocation.getCurrentPosition(function (pos) {
      here.dist = "1000";
      here.lon = pos.coords.longitude;
      here.lat = pos.coords.latitude;
      Session.set('selected', 'here');
      API.getNewPhotos(here);
      Session.set('listopen', false);
    });
  }
  else {
    var currentPlace = Places.findOne({name:selectedOption});
    Session.set('selected', currentPlace.name);
    API.getNewPhotos(currentPlace);
    Session.set('listopen', false);
  }
}
});