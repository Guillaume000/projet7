class Maps {
    constructor(restaurants) {
        this.restaurants = restaurants;
        this.markers = [];
    }

    addMarker(location, map, ...markers) {
        const marker = new google.maps.Marker({
            position: location,
            map: map
        });
        
        $("#info").append(`<div class="modal" id="newRestaurant" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">${this.newRestaurantForm()}</div>`);
        
        $('#newRestaurant').modal('show');
        
        this.markers.push(marker);
    }
    
    validForm(event) {
        $("#validRestaurant").one('click', (e) => {                 
            const nextRestaurant = new Restaurant();

            nextRestaurant.name = $("#restaurantName").val();
            nextRestaurant.address = $("#restaurantAddress").val();
            nextRestaurant.position = {"lat":event.lat(), "lng":event.lng()};
            nextRestaurant.pic = `https://maps.googleapis.com/maps/api/streetview?key=AIzaSyBuZW2mvBkazbPnl_jg_t5G5ilZmzhJfhU&size=400x400&location=${nextRestaurant.position}&fov=90&heading=235&pitch=10`;

            $.each(this.restaurants, (index, value) => {
                nextRestaurant.id = index + 1;
            });
            
            $.each(this.markers, (index, value) => {
                nextRestaurant.marker = value;
            });
            
            this.restaurants.push(nextRestaurant);
            $(".card").remove();       
            this.displayInfoWindow();

            //console.log(this.restaurants);
            console.log(nextRestaurant);
            
            $("#nextForm")[0].reset(); 
        });
    }
    
    createRestaurant(element) {
        let contentString = "";
        
        contentString = `<ul><li>${element.name}</li>
                         <li>Adresse : ${element.address}</li></ul>`;

        if(element.ratings != undefined) {
            for(let i = 0; i < element.ratings.length; i++) {
                (function(i) {
                    contentString += (`<ul><li>Note : ${element.ratings[i].stars}</li>
                         <li>Commentaire : ${element.ratings[i].comment}</li></ul>`);
                })(i)
            }
        }
        
        return contentString;
    }
    
    displayList() {
        const array = [];

        $.each(this.restaurants, (index, value) => {
            array.push(this.createRestaurant(value));
        });
        
        return array;
    }

    createInfoWindow() {
        let imageUrl;
        let infoWindow;
        const array = [];

        $.each(this.displayList(), (index, value) => {
            imageUrl = `https://maps.googleapis.com/maps/api/streetview?key=AIzaSyBuZW2mvBkazbPnl_jg_t5G5ilZmzhJfhU&size=400x400&location=${this.restaurants[index].position.lat},${this.restaurants[index].position.lng}&fov=90&heading=235&pitch=10`;

            infoWindow = new google.maps.InfoWindow({
                content: `<div class="card">
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
        const infoWindows = this.createInfoWindow();

        $.each(this.restaurants, (index, value) => {
            $("#restaurantAccordion").append(`
                <div class="card">
                  <div class="card-header" id="heading${value.id}">
                    <h5 class="mb-0">
                    <button id="restaurant${value.id}" class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapse${value.id}" aria-expanded="true" aria-controls="collapse${value.id}">
                        ${value.name} <span id="restaurantRate${value.id}">${value.starsAverage}</span> <i class="fas fa-star"></i><br>
                    </button>
                    </h5>
                  </div>

                  <div id="collapse${value.id}" class="collapse" aria-labelledby="heading${value.id}" data-parent="#restaurantAccordion">
                    <div id="info${value.id}" class="card-body">
                      ${infoWindows[index].content}
                      <button type="button" class="btn btn-info review" data-toggle="modal" data-target="#modal${value.id}">Ajouter un avis</button>
                      <div class="modal fade" id="modal${value.id}" tabindex="-1" role="dialog" aria-labelledby="modalLabel${value.id}" aria-hidden="true">
                        <div class="modal-dialog" role="document">
                          <div class="modal-content">
                            <div class="modal-header">
                              <h5 class="modal-title" id="modalLabel${value.id}">Ajouter un avis</h5>
                              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                              </button>
                            </div>
                            <div class="modal-body">
                              <div class="form-group">
                                <label for="formControlTextarea${value.id}">Commentaire :</label>
                                <textarea class="form-control" id="formControlTextarea${value.id}" rows="3"></textarea>
                              </div>
                            </div>
                            <div class="modal-footer">
                              <button type="button" class="btn btn-danger" data-dismiss="modal">Annuler</button>
                              <button type="button" id="review${value.id}" class="btn btn-success" data-dismiss="modal">Ajouter</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            `);
        });
    }
    
    addForm() {
        $('.modal-body').append(this.addStars());
    }
    
    addStars() {
        return `
            <form>
              <div class='rating-stars text-center'>
                <ul id='stars' class="restaurantRatings">
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
        `;
    }
    
    newRestaurantForm() {
        return `
            <div class="modal-body jumbotron">
              <form id="nextForm" role="form">
                <div class="form-group">
                  <input type="text" class="form-control" id="restaurantName" placeholder="Nom du restaurant"/>
                </div>
                <div class="form-group">
                  <input type="text" class="form-control" id="restaurantAddress" placeholder="Adresse"/>
                </div>
            </div>
                <button type="button" id="cancelRestaurant" class="btn btn-danger" data-dismiss="modal">Annuler</button>
                <button type="button" id="validRestaurant" class="btn btn-success" data-dismiss="modal">Ajouter</button>
              </form>
        `;
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
        
        this.submitForm(rate);
    }
    
    submitForm(rate) {
        for(let k = 0; k < this.restaurants.length; k++) {
            const restaurantId = this.restaurants[k].id;
            $(`#review${restaurantId}`).click(() => {
                const comment = $(`#formControlTextarea${restaurantId}`).val();
                const json = `{"stars":${rate}, "comment":"${comment}"}`;
                const object = JSON.parse(json);

                this.restaurants[k].ratings.push(object);
                this.restaurants[k].sortByRating();

                document.getElementById("restaurantRate" + restaurantId).textContent = this.restaurants[k].starsAverage;

                $(`#info${restaurantId} .card-body`).append(`Note : ${rate} <br> Commentaire : ${comment} <br><br>`);
            });
        }
    }
}

let map;

function initMap() {
    let reims = new google.maps.LatLng(49.2535299, 3.9850489);
    
    const iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
    
    const request = {
        location: reims,
        radius: 10000,
        type: ['restaurant']
    }
    
    map = new google.maps.Map(document.getElementById('map'), {
        center: reims,
        zoom: 12
    });
    
    navigator.geolocation.getCurrentPosition(function(position) {
        reims = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        
        const marker = new google.maps.Marker({
            position: reims,
            map: map,
            icon: iconBase + 'library_maps.png',
        });
    });
    
    const app = new Application(map, request);

    document.addEventListener("restaurantLoaded", () => {
        const readMap = new Maps(app.listRestaurants);
        
        app.callBack();
        
        $("#info").append(`<div class="modal" id="loadingModal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false"></div>`);
        
        $('#loadingModal').modal('show');
        $("#loadingModal").append(`<i class="fa fa-spinner fa-5x fa-pulse" id="loadingSpin"></i><div id="loadingMessage">Chargement en cours ...</div>`);
        
        //setTimeout(() => {
        
            readMap.displayInfoWindow();
            readMap.addForm();
            readMap.addReview();

            app.clickStars(readMap, map);
            
            $('#loadingModal').modal('hide');
        
            map.addListener('click', function(event) {
                readMap.addMarker(event.latLng, map);
                readMap.validForm(event.latLng);
            });
        
        //}, 10000);
    }); 
}