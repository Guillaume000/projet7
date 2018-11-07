class Application {
    constructor(url) {
        this.listRestaurants = this.getRestaurants(url);
    }

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

    clickStars(map, markers, newMarkers) {
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
                        map.addReview();
                    }
                }
            });

            $("#amount").html($("#slider-range").slider("values", 0) + "<i class=\"fas fa-star\"></i> - " + $("#slider-range").slider("values", 1) + "<i class=\"fas fa-star\"></i>");
        });
    }
}
