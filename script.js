var markers = {};
var selectedIndustries = [];
var map;
var homeMarker;


function initAutocomplete() {
  var input = document.getElementById('AddressSearch');
  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener('place_changed', onPlaceChanged);
  function onPlaceChanged() {
      var place = autocomplete.getPlace();
      if (place.geometry) {
          //Remove old home
          if (homeMarker != null) homeMarker.setMap(null);
          map.panTo(place.geometry.location);
          map.setZoom(15);
          homeMarker = new google.maps.Marker({
              position: place.geometry.location,
              animation: google.maps.Animation.DROP,
              map: map,
              icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
          });
          var infowindow = new google.maps.InfoWindow();
          var contentString = '<div><div>Home</div><div>' + place.formatted_address + '</div></div>';
          google.maps.event.addListener(homeMarker, 'click', (function(marker) {
            return function() {
                infowindow.setContent(contentString);
                infowindow.open(map, marker);
            }
            })(homeMarker));
      } else {
          document.getElementById('AddressSearch').placeholder = 'Starting Address';
      }
  }
}


function initMarkers() {
    var marker, i;
    var infowindow = new google.maps.InfoWindow();
    for (i = 0; i < data.length; i++) {
        var contentString = '<div><div>Name: ' + data[i][0] + '</div>' +
            '<div>Address: ' + data[i][4] + '</div>' +
            '<div>Industry: ' + data[i][1] + '</div>' +
            '<div>Position: ' + data[i][2] + '</div>' +
            '<div>Rate: $' + parseFloat(data[i][3]).toFixed(2) + '</div>' + '</div>';
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(data[i][5], data[i][6]),
            map: map,
            title: data[i][0],
            category: data[i][1],
            contentString: contentString
        });
        marker.setVisible(false)
        google.maps.event.addListener(marker, 'click', (function(marker) {
            return function() {
                infowindow.setContent(marker.contentString);
                infowindow.open(map, marker);
            }
        })(marker));
        if (markers[data[i][1]] == undefined) {
          markers[data[i][1]] = [marker]
        } else {
          markers[data[i][1]].push(marker)
        }
    }
}


function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: new google.maps.LatLng(41.7377, -87.6976)
    });
    initAutocomplete();
    initMarkers();
}


function filterMarkers(category) {
    var indexOfCategory = selectedIndustries.indexOf(category);
    if (indexOfCategory > -1) {
      selectedIndustries.splice(indexOfCategory, 1)
      for (var i = 0; i < markers[category.name].length; i++) {
          markers[category.name][i].setVisible(false);
      }
    } else {
      selectedIndustries.push(category)
      for (var i = 0; i < markers[category.name].length; i++) {
          markers[category.name][i].setVisible(true);
      }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);
    var map = document.getElementById('map')
    if ($navbarBurgers.length > 0) {
        $navbarBurgers.forEach(function($el) {
            $el.addEventListener('click', function() {
                var target = $el.dataset.target;
                var $target = document.getElementById(target);
                $el.classList.toggle('is-active');
                $target.classList.toggle('is-active');
                map.classList.toggle('map')
                map.classList.toggle('nomap')
                var navLinks = document.querySelectorAll('.navbar-link')
                navLinks.forEach(function($ele) {
                    $ele.classList.toggle('link-color')
                    $ele.classList.toggle('mobile-link-color')
                });
            });
        });
    }
    var addressNav = document.getElementById('address')
    var transportNav = document.getElementById('transport')
    var distanceNav = document.getElementById('distance')
    var industryNav = document.getElementById('industry')
    var logoNav = document.getElementById('logo')
    addressNav.addEventListener('mouseenter', function() {
        addressNav.classList.add('is-active')
    });
    map.addEventListener('mouseenter', function() {
        addressNav.classList.remove('is-active')
    });
    transportNav.addEventListener('mouseenter', function() {
        addressNav.classList.remove('is-active')
    });
    distanceNav.addEventListener('mouseenter', function() {
        addressNav.classList.remove('is-active')
    });
    industryNav.addEventListener('mouseenter', function() {
        addressNav.classList.remove('is-active')
    });
    logoNav.addEventListener('mouseenter', function() {
        addressNav.classList.remove('is-active')
    });
});