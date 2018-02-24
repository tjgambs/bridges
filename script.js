
var markers = [];
var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: new google.maps.LatLng(41.7377, -87.6976)
    });

    var input = document.getElementById('AddressSearch');
    autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', onPlaceChanged);
    homeAddress = null

    function onPlaceChanged() {
        var place = autocomplete.getPlace();
        if (place.geometry) {
          map.panTo(place.geometry.location);
          map.setZoom(15);
          homeAddress = new google.maps.Marker({
                position: place.geometry.location,
                animation: google.maps.Animation.DROP,
                icon: markerIcon
            });
        } else {
          document.getElementById('AddressSearch').placeholder = 'Home Address';
        }
    }


    var marker, i, infowindow;
    for (i = 0; i < data.length; i++) {
      var contentString = '<div><div>Name: '+ data[i][0] + '</div>' + 
          '<div>Address: '+ data[i][4] + '</div>' + 
          '<div>Industry: '+ data[i][1] + '</div>' + 
          '<div>Position: '+ data[i][2] + '</div>' +
          '<div>Rate: $'+ data[i][3] + '</div>'+'</div>';
      infowindow = new google.maps.InfoWindow({
        content: contentString
      });
      marker = new google.maps.Marker({
          position: new google.maps.LatLng(data[i][5], data[i][6]),
          map: map,
          title: data[i][0],
          category: data[i][1]
      });
      marker.setVisible(false)
      google.maps.event.addListener(marker, 'click', (function(marker) {
        return function() {
          infowindow.open(map, marker);
        }
      })(marker));
      markers.push(marker)
    }
}


function filterMarkers(category) {
    var i;
    for (i = 0; i < markers.length; i++) {
        if (markers[i].category == category.name) {
            markers[i].setVisible(true);
        } else {          
            markers[i].setVisible(false);
        }
    }  
}

document.addEventListener('DOMContentLoaded', function () {

  // Get all "navbar-burger" elements
  var $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

  // Check if there are any navbar burgers
  if ($navbarBurgers.length > 0) {

    // Add a click event on each of them
    $navbarBurgers.forEach(function ($el) {
      $el.addEventListener('click', function () {

        // Get the target from the "data-target" attribute
        var target = $el.dataset.target;
        var $target = document.getElementById(target);
        var map = document.getElementById('map')

        // Toggle the class on both the "navbar-burger" and the "navbar-menu"
        $el.classList.toggle('is-active');
        $target.classList.toggle('is-active');
        map.classList.toggle('map')
        map.classList.toggle('nomap')

      });
    });
  }
});
