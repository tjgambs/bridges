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
        var distanceNav = document.getElementById('distance');
        var industryNav = document.getElementById('industry');
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
                icon: 'assets/home_pin.png',
                address: place.formatted_address
            });
            var infowindow = new google.maps.InfoWindow();
            var contentString = '<div><div>Home</div><div>' + 
                place.formatted_address + '</div></div>';
            google.maps.event.addListener(homeMarker, 'click', (function(marker) {
                return function() {
                    infowindow.setContent(contentString);
                    infowindow.open(map, marker);
                }
            })(homeMarker));
            for (var key in markers) {
                if (markers.hasOwnProperty(key)) {
                    for (var i = 0; i < markers[key].length; i++) {
                        var point = markers[key][i].position;
                        var distance = getDistance(point, homeMarker.position);
                        markers[key][i].distance = distance;
                    }
                }
            }
            if (selectedIndustries.length > 0) {
                for(var i = 0; i < selectedIndustries.length; i++) {
                    filterMarkers(selectedIndustries[i]);
                }
            }
        } else {
            document.getElementById('AddressSearch').placeholder = 'Starting Address';
        }
    }
}

function getDistance(p1, p2) {
    // Haversine distance formula
    function rad(x) {
        return x * Math.PI / 180;
    }
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
    // Group all rows that are at the same address
    var groupByAddress = {};
    for (i = 0; i < data.length; i++) {
        if (groupByAddress[data[i][4]] == undefined) {
            groupByAddress[data[i][4]] = [data[i]];
        } else {
            groupByAddress[data[i][4]].push(data[i]);
        }
    }
    // Iterate through those addresses and group positions
    var groupByPositionGroupByAddress = {};
    for (var key in groupByAddress) {
        var positions = {}
        for (i = 0; i < groupByAddress[key].length; i++) {
            var position = groupByAddress[key][i][2];
            var pay = groupByAddress[key][i][3];
            if (positions[position.toLowerCase()] == undefined) {
                positions[position.toLowerCase()] = [parseInt(pay)];
            } else {
                positions[position.toLowerCase()].push(parseInt(pay));
            }
        }
        // Average all of the pays for each position.
        for (var pos in positions) {
            positions[pos] = average(positions[pos]);
        }
        groupByPositionGroupByAddress[key] = positions
    }

    for (var address in groupByPositionGroupByAddress) {
        var contentString = ('<div><div><b>Name</b>:<div>' + 
            groupByAddress[address][0][0] + '</div></div>' +
            '<div><b>Address</b>:<div>' + 
            groupByAddress[address][0][4] + '</div></div>' +
            '<div><b>Industry</b>:<div>' + 
            groupByAddress[address][0][1] + '</div></div>' +
            '<div><b>Previous Positions</b>:</div>');
        for (var position in groupByPositionGroupByAddress[address]) {
            var pay = groupByPositionGroupByAddress[address][position];
            contentString += '<div>' + toTitleCase(position) + ': $' + 
                parseFloat(pay).toFixed(2) + '</div>';
        }
        contentString += '<a href="#" onclick=\'getDirections(\"' + 
            groupByAddress[address][0][4] + '\");\'><b>Get Directions</b></a>';

        // Create the marker that will be shown on the map.
        marker = new google.maps.Marker({
            position: new google.maps.LatLng(
                groupByAddress[address][0][5], 
                groupByAddress[address][0][6]),
            map: map,
            title: groupByAddress[address][0][0],
            category: groupByAddress[address][0][1],
            contentString: contentString
        });
        marker.setVisible(false);
        // Attach an event listener to each of the pins so when they are 
        // clicked, we can get directions and display the info window.
        google.maps.event.addListener(marker, 'click', (function(marker) {
            return function() {
                infowindow.setContent(marker.contentString);
                infowindow.open(map, marker);
            }
        })(marker));
        // Create a look up table for the markers based on industry.
        if (markers[groupByAddress[address][0][1]] == undefined) {
            markers[groupByAddress[address][0][1]] = [marker];
        } else {
            markers[groupByAddress[address][0][1]].push(marker);
        }
    }
}

function getDirections(destination_address) {
    // Generate a url that the user can use to get directions from google.
    url = ('https://www.google.com/maps/dir/?api=1&origin='
            + homeMarker.address + '&destination=' + destination_address);
    window.open(url)
}

function average(values) {
    // Look at the values and compute an average.
    var total = 0;
    for (var i = 0; i < values.length; i++) {
        total += values[i];
    }
    return total / values.length;
}

function toTitleCase(str) {
    // Convert the input string into title case.
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
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


function filterMarkers(category) {
    if (category.name == undefined) {
        // Then just update 
        for (var i = 0; i < markers[category].length; i++) {
            if (markers[category][i].distance > currentRadius) {
                // If this location is greater than the selected radius
                markers[category][i].setVisible(false);
            } else {
                // If this location is within the radius.
                markers[category][i].setVisible(true);
            }
        }
    } else {
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
}

function updateRadius(radius) {
    // Get the value of the selected radius and set it as the current radius.
    var x = (radius.value || radius.options[radius.selectedIndex].value);
    currentRadius = parseInt(x);
    // Iterate through all of the selected categories and adjust according 
    // to the new radius.
    var i, j;
    for (i = 0; i < selectedIndustries.length; i++) {
        for (j = 0; j < markers[selectedIndustries[i]].length; j++) {
            // If the the distance from this marker to home is larger than the
            // allowed radius, then set its visiblity to false, otherwise true.
            if (markers[selectedIndustries[i]][j].distance > currentRadius) {
                markers[selectedIndustries[i]][j].setVisible(false);
            } else {
                markers[selectedIndustries[i]][j].setVisible(true);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var $navbarBurgers = Array.prototype.slice.call(
        document.querySelectorAll('.navbar-burger'), 0);
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
    var distanceNav = document.getElementById('distance');
    var industryNav = document.getElementById('industry');
    var logoNav = document.getElementById('logo');
    addressNav.addEventListener('mouseenter', function() {
        addressNav.classList.add('is-active')
    });
    map.addEventListener('mouseenter', function() {
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
        if (this.checked) {
            $(':checkbox').each(function() {
                if (!this.checked) this.click();
            });
        } else {
            $(':checkbox').each(function() {
                if (this.checked) this.click();
            });
        }
    });
});