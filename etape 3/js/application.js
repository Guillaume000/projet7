class Application {
    constructor(map, request) {
        this.map = map;
        this.request = request;
        this.service = new google.maps.places.PlacesService(this.map);
        this.listRestaurants = this.service.nearbySearch(request, this.getRestaurantsFromPlaces.bind(this));
    }
    
    getRestaurantsFromPlaces(results, status) {
        let restaurants = [];
        
        $.each(results, (index, value) => {
            const restaurant = new Restaurant(value.name, value.vicinity, {"lat":value.geometry.location.lat, "lng":value.geometry.location.lng}, value.icon, value.rating);
            
            const request = {
                reference: value.reference
            };
            
            if(status === google.maps.places.PlacesServiceStatus.OK) {
                //setTimeout(details, 4000); 
                
                this.service.getDetails(request, (details, status) => {

                    let tab = [];
                    console.log(details);

                    /*for(let i = 0; i < details.reviews.length; i++) {
                        let rating = {"stars":details.reviews[i].rating, "comment":details.reviews[i].text};
                        tab.push(rating);
                    }*/

                    restaurant.ratings = tab;
                    restaurants.push(restaurant);
                });
            }
  
        });
        
        return restaurants;
    }
    
    /*for(let i = 0; i < details.reviews.length; i++) {
                    (function(i) {
                        contentString += (`<ul><li>Note: ${details.reviews[i].rating}</li>
<li>Commentaire: ${details.reviews[i].text}</li></ul>`);
                    })(i)
                }*/
    
    /*getRestaurants(url, ...list) {
        $.ajax({
            url: url,
            data: {
                format: 'json'
            },
            error: function() {
                alert('ERROR');
            },
            success: function(data) {
                $.each(data, function(index, value) {

                    const restaurant = new Restaurant(value.restaurantName, value.address, {"lat":value.lat, "lng":value.long}, value.pic, value.ratings);

                    list.push(restaurant);
                });
                var loaded = new Event("restaurantLoaded", {bubbles:true});
                document.dispatchEvent(loaded);
            },
            type: 'GET'
        });
        return list;
    }*/

    clickStars(map, markers) {
        const list = this.listRestaurants;
        let average;

        $(function() {
            $("#slider-range").slider({
                range: true,
                min: 1,
                max: 5,
                values: [1, 5],
                slide: function(event, ui) {
                    $("#amount").html(ui.values[0] + "<i class=\"fas fa-star\"></i> - " + ui.values[1] + "<i class=\"fas fa-star\"></i>");

                    if(ui.value == ui.values[0] || ui.value == ui.values[1]) {
                        $(".card").remove();
                        map.restaurants = [];
                        map.deleteMarkers();

                        $.each(list, function(index, value) {
                            average = Math.round(this.sortByRating() * 10) / 10;

                            if(average >= ui.values[0] && average <= ui.values[1]) {
                                map.restaurants.push(value);
                            }
                        });

                        map.createMarkers(markers);
                        map.displayInfoWindow();
                        map.addForm();
                        map.addReview();
                    }
                }
            });

            $("#amount").html($("#slider-range").slider("values", 0) + "<i class=\"fas fa-star\"></i> - " + $("#slider-range").slider("values", 1) + "<i class=\"fas fa-star\"></i>");
        });
    }
}
