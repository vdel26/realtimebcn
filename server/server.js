Places = new Meteor.Collection("places");

// Publish complete set of places
Meteor.publish("places", function () {
  return Places.find();
});

Places.allow({
  insert: function () {
    return false; // No inserts allowed, sorry bro
  },
  update: function () {
    return false; // No updates allowed, sorry bro
  },
  remove: function () {
    return false; // No removes allowed, sorry bro
  }
});

Meteor.startup(function () {
  if (Places.find().count() === 0) {
    var barris = [
      {name: 'Barcelona', lat: '41.393294', lon: '2.16259', dist: '2000'},
      {name: 'Gràcia', lat: '41.40939', lon: '2.155024', dist: '1000'},
      {name: 'Eixample', lat: '41.390783', lon: '2.160603', dist: '1000'},
      {name: 'Sarrià', lat: '41.396578', lon: '2.122752', dist: '1000'},
      {name: 'Born', lat: '41.385471', lon:'2.185783', dist: '1000'},
      {name: 'Gòtic', lat: '41.381929', lon:'2.171725', dist: '1000'}
      ];

    for (var i = 0; i < barris.length; i++){
        Places.insert({name: barris[i].name, lat: barris[i].lat,
          lon: barris[i].lon, dist: barris[i].dist});
    }
  }
});