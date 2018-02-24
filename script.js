var markers = {};
var selectedIndustries = [];
var map;
var homeMarker;
var currentRadius = 1;

function initAutocomplete() {
    var input = document.getElementById('AddressSearch');
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', onPlaceChanged);
    function onPlaceChanged() {
        //Show other filters
        var transportNav = document.getElementById('transport');
        var distanceNav = document.getElementById('distance');
        var industryNav = document.getElementById('industry');
        transportNav.style.visibility = 'visible';
        distanceNav.style.visibility = 'visible';
        industryNav.style.visibility = 'visible';
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
                            icon: 'assets/home_pin.png'
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
        for (var key in markers) {
            if (markers.hasOwnProperty(key)) {           
                for(var i = 0; i < markers[key].length; i++) {
                    var point = markers[key][i].position;
                    markers[key][i].distance = getDistance(point, homeMarker.position);
                }
            }
        }
    }
}

function getDistance(p1, p2) {
    function rad(x) {
      return x * Math.PI / 180;
    }
    // Haversine distance formula
    var R = 6378137; // Earth’s mean radius in meter
    var dLat = rad(p2.lat() - p1.lat());
    var dLong = rad(p2.lng() - p1.lng());
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d * 0.000621371; // returns the distance in miles
}


function initMarkers() {
    var marker, i;
    var infowindow = new google.maps.InfoWindow();
    for (i = 0; i < data.length; i++) {
        // Create the content for the popup window.
        var contentString = '<div><div>Name: ' + data[i][0] + '</div>' +
            '<div>Address: ' + data[i][4] + '</div>' +
            '<div>Industry: ' + data[i][1] + '</div>' +
            '<div>Position: ' + data[i][2] + '</div>' +
            '<div>Rate: $' + parseFloat(data[i][3]).toFixed(2) + '</div>' + '</div>';
        // Create the marker that will be shown on the map.
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(data[i][5], data[i][6]),
            map: map,
            title: data[i][0],
            category: data[i][1],
            contentString: contentString
        });
        marker.setVisible(false);
        // Attach an event listener to each of the pins so when they are 
        // clicked, we can get directions and display the info window.
        google.maps.event.addListener(marker, 'click', (function(marker) {
            return function() {
                infowindow.setContent(marker.contentString);
                infowindow.open(map, marker);

                console.log('Go get directions!');

            }
        })(marker));
        // Create a look up table for the markers based on industry.
        if (markers[data[i][1]] == undefined) {
            markers[data[i][1]] = [marker];
        } else {
            markers[data[i][1]].push(marker);
        }
    }
}


function initMap() {
    // Initialize the map then initialize all of its dependencies.
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 8,
        center: new google.maps.LatLng(41.7377, -87.6976)
    });
    initAutocomplete();
    initMarkers();
}


function filterMarkers(category) { // WORKS
    // Check to see if this industry is already selected.
    var indexOfCategory = selectedIndustries.indexOf(category.name);
    if (indexOfCategory > -1) {
        // If this industry is currently selected, then this function
        // call is meant to remove all markers in this industry.
        selectedIndustries.splice(indexOfCategory, 1)
        for (var i = 0; i < markers[category.name].length; i++) {
            markers[category.name][i].setVisible(false);
        }
    } else {
        // If this industry is not currently selected, then this function
        // call is meant to add all markers in this indistry, within the 
        // radius.
        for (var i = 0; i < markers[category.name].length; i++) {
            if (markers[category.name][i].distance > currentRadius) {
                // If this location is greater than the selected radius
                markers[category.name][i].setVisible(false);
            } else {
                // If this location is within the radius.
                markers[category.name][i].setVisible(true);
            }
        }
        selectedIndustries.push(category.name);
    }
}

function updateRadius(radius) {
    // Get the value of the selected radius and set it as the current radius.
    var x = (radius.value || radius.options[radius.selectedIndex].value);
    currentRadius = parseInt(x);
    // Iterate through all of the selected categories and adjust according 
    // to the new radius.

    for (var i = 0; i < selectedIndustries.length; i++) {
        for (var j = 0; j < markers[selectedIndustries[i]].length; j++) {
            if (markers[selectedIndustries[i]][j].distance > currentRadius) {
                markers[selectedIndustries[i]][j].setVisible(false);
            } else {
                markers[selectedIndustries[i]][j].setVisible(true);
            }
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
                map.classList.toggle('map');
                map.classList.toggle('nomap');
                var navLinks = document.querySelectorAll('.navbar-link')
                navLinks.forEach(function($ele) {
                    $ele.classList.toggle('link-color');
                    $ele.classList.toggle('mobile-link-color');
                });
            });
        });
    }
    var addressNav = document.getElementById('address');
    var transportNav = document.getElementById('transport');
    var distanceNav = document.getElementById('distance');
    var industryNav = document.getElementById('industry');
    var logoNav = document.getElementById('logo');
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
    $('#checkAll').click(function(event) {
        if(this.checked) {
            $(':checkbox').each(function() {
                if (!this.checked) this.click();
            });
        }
        else {
            $(':checkbox').each(function() {
                if (this.checked) this.click();
            });
        }
    });
});