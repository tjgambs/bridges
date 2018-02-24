function initMap() {
    var uluru = {
        lat: -25.363,
        lng: 131.044
    };
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: uluru
    });
    var marker = new google.maps.Marker({
        position: uluru,
        map: map
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

