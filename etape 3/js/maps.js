class Maps {
    constructor(restaurants) {
        this.restaurants = restaurants;
        this.markers = [];
    }

    createMarkers(map, markers) {
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

    addMarker(location, map, ...markers) {
        const marker = new google.maps.Marker({
            position: location,
            map: map
        });
        this.markers.push(marker);
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

    displayList() {
        let contentString = "";
        const array = [];

        $.each(this.restaurants, (index, value) => {
            contentString = `<ul><li>Nom du Restaurant : ${value.name}</li>
                             <li>Adresse : ${value.address}</li></ul>`;

            for(let i = 0; i < value.ratings.length; i++) {
                (function(i) {
                    contentString += (`<ul><li>Note : ${value.ratings[i].stars}</li>
                                       <li>Commentaire : ${value.ratings[i].comment}</li></ul>`);
                })(i)
            }
            array.push(contentString);
        });
        return array;
    }

    createInfoWindow() {
        let imageUrl;
        let infoWindow;
        const array = [];

        $.each(this.displayList(), (index, value) => {
            imageUrl = `https://maps.googleapis.com/maps/api/streetview?size=400x400&location=${this.restaurants[index].position.lat},${this.restaurants[index].position.lng}&fov=90&heading=235&pitch=10`;

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

    displayInfoWindow() {
        let template;
        let infoWindows = this.createInfoWindow();

        $.each(this.restaurants, (index, value) => {
            $("#restaurantAccordion").append(`
                <div class="card">
                  <div class="card-header" id="heading${index}">
                    <h5 class="mb-0">
                    <button id="restaurant${index}" class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapse${index}" aria-expanded="true" aria-controls="collapse${index}">
                        Nom du restaurant : ${value.name} ${value.sortByRating()} <i class="fas fa-star"></i><br>
                    </button>
                    </h5>
                  </div>

                  <div id="collapse${index}" class="collapse" aria-labelledby="heading${index}" data-parent="#restaurantAccordion">
                    <div id="info${index}" class="card-body">
                      ${infoWindows[index].content}
                      <button type="button" class="btn btn-info review" data-toggle="modal" data-target="#modal${index}">Ajouter un avis</button>
                      <div class="modal fade" id="modal${index}" tabindex="-1" role="dialog" aria-labelledby="modalLabel${index}" aria-hidden="true">
                        <div class="modal-dialog" role="document">
                          <div class="modal-content">
                            <div class="modal-header">
                              <h5 class="modal-title" id="modalLabel${index}">Ajouter un avis</h5>
                              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                              </button>
                            </div>
                            <div class="modal-body">
                              <div class="form-group">
                                <label for="formControlTextarea${index}">Commentaire :</label>
                                <textarea class="form-control" id="formControlTextarea${index}" rows="3"></textarea>
                              </div>
                            </div>
                            <div class="modal-footer">
                              <button type="button" class="btn btn-danger" data-dismiss="modal">Annuler</button>
                              <button type="button" id="review${index}" class="btn btn-success" data-dismiss="modal">Ajouter</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            `);
        });
        return template;
    }
    
    addForm() {
        $('.modal-body').append(`
            <form>
              <div class='rating-stars text-center'>
                <ul id='stars'>
                  <li class='star' data-value='1'>
                    <i class='fa fa-star fa-fw'></i>
                  </li>
                  <li class='star' data-value='2'>
                    <i class='fa fa-star fa-fw'></i>
                  </li>
                  <li class='star' data-value='3'>
                    <i class='fa fa-star fa-fw'></i>
                  </li>
                  <li class='star' data-value='4'>
                    <i class='fa fa-star fa-fw'></i>
                  </li>
                  <li class='star' data-value='5'>
                    <i class='fa fa-star fa-fw'></i>
                  </li>
                </ul>
              </div>
            </form>
        `);
    }
    
    addReview() {      
        const rate = [];
        
        $('#stars li').on('mouseover', function() {
            const onStar = parseInt($(this).data('value'), 10);

            $(this).parent().children('li.star').each(function(e) {
                if (e < onStar) {
                    $(this).addClass('hover');
                }
                else {
                    $(this).removeClass('hover');
                }
            });

        }).on('mouseout', function() {
            $(this).parent().children('li.star').each(function(e) {
                $(this).removeClass('hover');
            });
        });
        
        $('#stars li').on('click', function() {
            const onStar = parseInt($(this).data('value'), 10);
            const stars = $(this).parent().children('li.star');

            for(let i = 0; i < stars.length; i++) {
                $(stars[i]).removeClass('selected');
            }

            for(let j = 0; j < onStar; j++) {
                $(stars[j]).addClass('selected');
            }
            
            rate.push(onStar);
            
            if(rate.length > 1) {
                rate.shift();
            }
        });
        
        for(let k = 0; k < this.restaurants.length; k++) {
            $(`#review${k}`).click(() => {
                const comment = $(`#formControlTextarea${k}`).val();
                const json = `{"stars":${rate}, "comment":"${comment}"}`;
                let object;
                
                object = JSON.parse(json);
                this.restaurants[k].ratings.push(object);
                $(`#info${k} .card-body`).append(`Note : ${rate} <br> Commentaire : ${comment} <br><br>`);
            });
        }
    }
}

let map;
let infowindow;
let service;

function initMap() {
    const paris = new google.maps.LatLng(48.8589507, 2.2770201);
    const app = new Application('restaurant.json');

    map = new google.maps.Map(document.getElementById('map'), {
        center: paris,
        zoom: 12
    });
    
    const request = {
        location: paris,
        radius: 10000,
        type: ['restaurant']
    }
    
    infowindow = new google.maps.InfoWindow();
    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);

    document.addEventListener("restaurantLoaded", () => {
        const readMap = new Maps(app.listRestaurants);
        readMap.createMarkers(map);
        readMap.displayInfoWindow();
        app.clickStars(readMap, map);

        map.addListener('click', function(event) {
            readMap.addMarker(event.latLng, map);
        });
        
        readMap.addForm();
        readMap.addReview();
    });
}

function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        results.forEach(createMarker);
    }
}

function createMarker(place) {
    const placeLoc = place.geometry.location;
    const marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });
    
    marker.addListener('click', function() {
        const request = {
            reference: place.reference
        };
        
        service.getDetails(request, function(details, status) {
            let contentString = "";
            
            contentString = `<ul><li>Nom du Restaurant : ${details.name} ${details.rating}</li>
                                 <li>${details.icon}</li>
                                 <li>Adresse : ${details.vicinity}</li></ul>`;
            
            for(let i = 0; i < details.reviews.length; i++) {
                (function(i) {
                    contentString += (`<ul><li>Note: ${details.reviews[i].rating}</li>
                                        <li>Commentaire: ${details.reviews[i].text}</li></ul>`);
                })(i)
            }
            
            infowindow.setContent(contentString);
            infowindow.open(map, marker);
        });
    })
}




