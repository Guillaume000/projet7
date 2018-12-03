class Application {
    constructor(map, request) {
        this.map = map;
        this.request = request;
        this.service = new google.maps.places.PlacesService(this.map);
        this.listRestaurants = [];
        this.service.nearbySearch(this.request, this.getRestaurantsFromPlaces.bind(this));
    }
    
    /** 
    * get the list of restaurants
    *
    * @param {tab} results contains the list of restaurants
    * @param {string} status indicates the status of the request
    **/
    getRestaurantsFromPlaces(results, status) {
        const loaded = new Event("restaurantLoaded", {bubbles:true});
        
        $.each(results, (index, value) => {
            const restaurant = new Restaurant(value.name, value.vicinity, {"lat":value.geometry.location.lat(), "lng":value.geometry.location.lng()}, value.icon, value.rating, index);
            
            const request = {
                placeId: value.reference,
            };
            
            setTimeout(() => {
                if(status === google.maps.places.PlacesServiceStatus.OK) {
                    this.service.getDetails(request, (details, status) => {
                        const stockRatings = [];

                        for(let i = 0; i < details.reviews.length; i++) {
                            let rating = {"stars":details.reviews[i].rating, "comment":details.reviews[i].text};
                            stockRatings.push(rating);
                        }
                        
                        restaurant.ratings = stockRatings;
                    });
                }
            }, 500 * index);
            
            this.listRestaurants.push(restaurant);
        });
        
        document.dispatchEvent(loaded);
    }
    
    /** 
    * create markers for each restaurants
    **/
    callBack() {
        this.listRestaurants.forEach(this.createMarker);
    }

    /** 
    * create marker and toggle if you click him
    **/
    createMarker(place, results) {
        place.marker = new google.maps.Marker({
            map: map,
            position: {"lat":place.position.lat, "lng":place.position.lng}
        });
        
        place.marker.addListener('click', function() {
            $(`#collapse${results}`).collapse('toggle');
        });
    }
    
    /**
    * Filter restaurants on the map and list with notes
    *
    * @param {object} readMap the map that contains the markers
    * @param {object} map retrieves the list of restaurants for localization
    **/
    clickStars(readMap, map) {
        const list = this.listRestaurants;
        
        $(function() {
            
            $(".slider").slider({
                range: true,
                min: 1,
                max: 5,
                values: [1, 5],
                slide: function(event, ui) {
                    
                    $(".gAmount").html(ui.values[0] + "<i class=\"fas fa-star\"></i> - " + ui.values[1] + "<i class=\"fas fa-star\"></i>");

                    if(ui.value == ui.values[0] || ui.value == ui.values[1]) {
                        
                        $(".card").remove();    
                        
                        const concatRestaurant = list.concat(readMap.newRestaurants);
                        
                        const unique = concatRestaurant.filter(function(restaurantSelected, index, restaurantsTab) {
                            return index === restaurantsTab.indexOf(restaurantSelected);
                        });

                        readMap.restaurants = [];

                        $.each(unique, function(index, value) {                              
                            if(value.starsAverage >= ui.values[0] && value.starsAverage <= ui.values[1]) {                           
                                readMap.restaurants.push(value);
                                value.marker.setVisible(true);
                            } else {
                                value.marker.setVisible(false);
                            }    
                        });
                        
                        readMap.displayInfoWindow();
                        readMap.addReview();
                    }
                }
            });

            $(".gAmount").html($(".slider").slider("values", 0) + "<i class=\"fas fa-star\"></i> - " + $(".slider").slider("values", 1) + "<i class=\"fas fa-star\"></i>");
        });
    }
}