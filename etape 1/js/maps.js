class Maps {
    constructor(restaurants) {
        this.restaurants = restaurants;
        this.markers = [];
    }
    
    /** 
    * Créer les marqueurs
    *
    * @param {object} map détail d'un marqueur
    **/

    createMarkers(map) {
        $.each(this.restaurants, (index, value) => {
            const marker = new google.maps.Marker({
                position: new google.maps.LatLng(this.restaurants[index].position),
                map: map
            });

            this.markers.push(marker);

            marker.addListener('click', function() {
                $(`#collapse${index}`).collapse('toggle');
            });
        });
    }

    setMapOnAll(map) {
        for (var i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(map);
        }
    }

    clearMarkers() {
        this.setMapOnAll(null);
    }

    deleteMarkers() {
        this.clearMarkers();
        this.markers = [];
    }
    
    /** 
    * Affiche les détails des restaurants (Nom, Adresse, Notes, Commentaires)
    *
    * @return {tab} array contient un template HTML pour afficher les détails des restaurants
    **/

    displayList() {
        let contentString = "";
        const array = [];

        $.each(this.restaurants, (index, value) => {
            contentString = `<ul class="noPadding"><li>${value.name}</li>
                             <li>Adresse : ${value.address}</li></ul>`;

            for(let i = 0; i < value.ratings.length; i++) {
                (function(i) {
                    contentString += (`<ul class="noPadding"><li>Notes : ${value.ratings[i].stars}</li>
                                       <li>Commentaires : ${value.ratings[i].comment}</li></ul>`);
                })(i)
            }
            array.push(contentString);
        });
        return array;
    }
    
    /** 
    * Affiche les détails des restaurants (Image, contient également la structure HTML pour la méthode displayList)
    *
    * @return {tab} array contient un template HTML pour afficher les détails des restaurants
    **/

    createInfoWindow() {
        let imageUrl;
        let infoWindow;
        const array = [];

        $.each(this.displayList(), (index, value) => {
            imageUrl = `https://maps.googleapis.com/maps/api/streetview?key=AIzaSyBuZW2mvBkazbPnl_jg_t5G5ilZmzhJfhU&size=400x400&location=${this.restaurants[index].position.lat},${this.restaurants[index].position.lng}&fov=90&heading=235&pitch=10`;

            infoWindow = new google.maps.InfoWindow({
                content: `<div class="card" style="width: 22rem;">
                            <img class="card-img-top" src=${imageUrl}>
                            <div class="card-body">
                              <p class="card-text">${value}</p>
                            </div>
                          </div>`
            });
            array.push(infoWindow);
        });
        return array;
    }
    
    /** 
    * Ajoute les détails des restaurants dans l'élément #restaurantAccordion
    **/

    displayInfoWindow() {
        let infoWindows = this.createInfoWindow();

        $.each(this.restaurants, (index, value) => {
            
            $("#restaurantAccordion").append(`
                <div class="card">
                  <div class="card-header" id="heading${index}">
                    <h5 class="mb-0">
                    <button id="restaurant${index}" class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapse${index}" aria-expanded="true" aria-controls="collapse${index}">
                        Nom du restaurant : ${value.name} ${value.sortByRating()} <i class="fas fa-star"></i>
                    </button>
                    </h5>
                  </div>
                  <div id="collapse${index}" class="collapse" aria-labelledby="heading${index}" data-parent="#restaurantAccordion">
                    <div id="info${index}" class="card-body">
                      ${infoWindows[index].content}
                    </div>
                  </div>
                </div>
            `);
            
        });
    }
}

    /** 
    * Initialise la carte avec l'API Google Maps
    * Centre la position sur celle de l'utilisateur grâce à un marqueur différent
    **/

function initMap() {
    let map;
    let app;
    let myPosition = new google.maps.LatLng(48.8737815, 2.3501649);
    
    navigator.geolocation.getCurrentPosition(function(position) {
        myPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        const iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';

        map = new google.maps.Map(document.getElementById('map'), {
            center: myPosition,
            zoom: 12
        });

        const marker = new google.maps.Marker({
            position: myPosition,
            map: map,
            icon: iconBase + 'library_maps.png',
        });
        
        app = new Application('restaurant.json');
    });
    
    document.addEventListener("restaurantLoaded", () => {
        const readMap = new Maps(app.listRestaurants);
        readMap.createMarkers(map);
        readMap.displayInfoWindow();
        app.clickStars(readMap, map);
    });
}
