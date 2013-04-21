// Define Minimongo collection and subscribe to db
Places = new Meteor.Collection("places");
Meteor.subscribe("places");

var CLIENTID = 'b80f0b2261fb47db926ce2e76e78d1d4';

// Success callback for ajax request. Stores json in session variable.
var onJsonLoaded = function (json){
  if (json.meta.code == 200) {
    var show = json.data;
    Session.set('photoset', show);
  } else{
    alert(json.meta.error_message);
  }
  //Session.set('next_max_id', json.pagination.next_max_tag_id);
};

var getNewPhotos = function (place) {
  if (!place) {
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
};

// On startup, make first api call
Meteor.startup(function(){
  Session.set('photoset', '');
  Session.set('selected', 'Barcelona');
  Session.set('zoomed', '');

  getNewPhotos();
});

// HELPER to populate selector with place names
Handlebars.registerHelper('placesIterator', function (){
  var place_list = Places.find({});
  var out = "";
  place_list.forEach(function (place){
    out += "<li value="+place.name+">"+place.name+"</li>";
  });
  return out;
});

// TEMPLATE HELPERS
Template.instagram.helpers({
// make json data available to the template
photoset: function(){
  return Session.get('photoset');
}
});

// EVENT MAP for INSTAGRAM template
Template.instagram.events({
'click .button-more': function(){
  var place = String(Session.get('selected'));
  var current_place = Places.findOne({name: place});
  getNewPhotos(current_place);
},
'click .photo': function(event){
  $('.photos-container').toggleClass('greyed');
  if (Session.equals('zoomed', '')) {
    $('<img src='+this.images.standard_resolution.url+' alt="">').appendTo('#zoomed-image');
    Session.set('zoomed', this.images.standard_resolution.url);
  } else{
    $('#zoomed-image').children().remove();
    Session.set('zoomed', '');
  }
}
});

// EVENT MAP for MAIN template
Template.main.events({
'mouseover .selector-button': function () {
  $('.selector-options').toggle();
},
'change #place-selector': function(){
  var place = String($('#place-selector option:selected').val());
  var current_place = Places.findOne({name: place});
  Session.set('selected', current_place.name);
  getNewPhotos(current_place);
},
'mouseenter #place-selector': function (){
  $('#place-selector').focus();
},
'mouseleave #place-selector': function (){
  $('#place-selector').blur();
}
});