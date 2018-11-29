class Application {
    constructor(url) {
        this.listRestaurants = this.getRestaurants(url);
    }

    /** 
    * Récupère la liste des restaurants
    *
    * @param {string} url l'adresse pour récupérer les restaurants
    * @param {tab} list le tableau qui contient la liste de restaurants
    *
    * @return {tab} 
    **/
    
    getRestaurants(url, ...list) {
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
                
                const loaded = new Event("restaurantLoaded", {bubbles:true});
                document.dispatchEvent(loaded);
            },
            type: 'GET'
        });
        return list;
    }
    
    /** 
    * Filtre les restaurants sur la carte et dans la liste grâce aux notes
    *
    * @param {object} readMap la carte qui contient les marqueurs
    * @param {object} map permet de récupérer la liste des restaurants pour la localisation
    **/

    clickStars(map, markers) {
        const list = this.listRestaurants;
        let average;

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
                        
                        const concatRestaurant = list.concat(map.newRestaurants);

                        const unique = concatRestaurant.filter(function(restaurantSelected, index, restaurantsTab) {
                            return index === restaurantsTab.indexOf(restaurantSelected);
                        });
                        
                        map.restaurants = [];
                        map.deleteMarkers();
                        
                        $.each(unique, function(index, value) {
                            average = Math.round(this.sortByRating() * 10) / 10;

                            if(average >= ui.values[0] && average <= ui.values[1]) {
                                map.restaurants.push(value);
                            }
                        });
                        
                        map.createMarkers(markers);
                        map.displayInfoWindow();
                        map.addReview();
                    }
                }
            });

            $(".gAmount").html($(".slider").slider("values", 0) + "<i class=\"fas fa-star\"></i> - " + $(".slider").slider("values", 1) + "<i class=\"fas fa-star\"></i>");
        });
    }
}
