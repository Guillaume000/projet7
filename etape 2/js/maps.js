class Maps {
    constructor(restaurants) {
        this.restaurants = restaurants;
        this.newRestaurants = [];
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

    addMarker(location, map) {
        const marker = new google.maps.Marker({
            position: location,
            map: map
        });

        $("#info").append(`<div class="modal" id="newRestaurant" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">${this.newRestaurantForm()}</div>`);

        this.submitNewRestaurant(marker);
        this.addReview();
        $('#rateComment').html(this.addComment(this.restaurants.length));
        $('#newRestaurant').modal('show');
    }

    cancelForm(marker) {      
        $.each(this.markers, function(index, value) {  
            value.setVisible(false);
        });

        this.markers.pop();

        $.each(this.markers, function(index, value) {  
            value.setVisible(true);
        });

        this.removeModal();
    }

    validForm(event) {     
        const nextRestaurant = new Restaurant();
        const starValue = $("#stars .selected");
        let comment;
        let json;
        let object;

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

        comment = $(`#formControlTextarea${nextRestaurant.id}`).val();

        $.each(starValue, (index, value) => {
            json = `{"stars":${starValue[index].dataset.value}, "comment":"${comment}"}`;
        });

        object = JSON.parse(json);

        nextRestaurant.ratings = [];   
        nextRestaurant.ratings.push(object);
        nextRestaurant.starsAverage = nextRestaurant.ratings[0].stars;

        if(nextRestaurant.starsAverage == 0) {
            nextRestaurant.starsAverage = 1;
        } 

        if(nextRestaurant.starsAverage > 5) {
            nextRestaurant.starsAverage = 5;
        } 

        this.newRestaurants.push(nextRestaurant);            
        this.restaurants.push(nextRestaurant);

        $(".card").remove();       
        this.displayInfoWindow();
        this.toggleRestaurant();            
        this.removeModal();
        this.addReview();
    }

    removeModal() {
        $("#newRestaurant").modal('hide').remove();
    }

    toggleRestaurant() {
        $.each(this.markers, (index, value) => {
            value.addListener('click', () => {
                $(`#collapse${this.restaurants.length - 1}`).collapse('toggle'); 
            });
        });
    }

    displayList() {
        let contentString = "";
        const array = [];

        $.each(this.restaurants, (index, value) => {
            contentString = `<ul><li>${value.name}</li>
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

    displayInfoWindow() {
        const infoWindows = this.createInfoWindow();

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
                            ${this.addStars()}
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
    }
    
    addStars() {
        return `
            <form id="starsForm">
              <div class='rating-stars text-center'>
                <ul id='stars' class="restaurantRatings">
                  <li class='star selected' data-value='1'>
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
    
    addComment(id) {        
        return `
            <label for="formControlTextarea${id}">Commentaire :</label>
            <textarea class="form-control" id="formControlTextarea${id}" rows="3"></textarea>
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
                <div class="form-group" id="rateComment"></div>
                <div class="form-group" id="rateStars">${this.addStars()}</div>
            </div>
            <button type="button" id="cancelRestaurant" class="btn btn-danger" data-dismiss="modal">Annuler</button>
            <button type="button" id="validRestaurant" class="btn btn-success" data-dismiss="modal">Ajouter</button>
            </form>
        `;
    }
    
    checkForm() {
        if($('#restaurantName').val().trim() == "" && $('#restaurantAddress').val().trim() == "") {
            $('#validRestaurant').prop('disabled', true);
        }

        $('#restaurantName').keyup(() => {
            if(!$('#restaurantName').val()) {
                $('#restaurantName').css('border', '4px solid red');
                $('#validRestaurant').prop('disabled', true);
            } else {
                $('#restaurantName').css('border', '4px solid green');
            }
        });

        $('#restaurantAddress').keyup(() => {
            if(!$('#restaurantAddress').val()) {
                $('#restaurantAddress').css('border', '4px solid red');
                $('#validRestaurant').prop('disabled', true);
            } else {
                $('#restaurantAddress').css('border', '4px solid green');
            }
        });

        $('#restaurantName, #restaurantAddress').keyup(() => {
            if($('#restaurantName').val().trim() != "" && $('#restaurantAddress').val().trim() != "") {
                $('#validRestaurant').prop('disabled', false);
            }
        });
    }

    submitNewRestaurant(marker) {
        this.markers.push(marker);

        this.checkForm();

        $('#validRestaurant').on('click', (e) => {
            if($('#restaurantName').val().trim() != "" && $('#restaurantAddress').val().trim() != "") {
                this.validForm(marker.position);
            } else {
                this.cancelForm(marker);
                e.preventDefault();
            }
        });

        $('#cancelRestaurant').on('click', (e) => {
            this.cancelForm(marker);
            e.preventDefault();
        });
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
            $(`#review${k}`).click((e) => {
                e.stopImmediatePropagation();
                $(`#modal${k}`).modal('hide');
                
                if(rate.length == 0) {
                    const etoiles = $("#stars .selected").attr('data-value');
                    rate.push(etoiles);
                }
                
                const comment = $(`#formControlTextarea${k}`).val();
                const json = `{"stars":${rate}, "comment":"${comment}"}`;
                const object = JSON.parse(json);

                this.restaurants[k].ratings.push(object);
                this.restaurants[k].sortByRating();
                
                $(`#info${k} .card-body`).append(`Note : ${rate} <br> Commentaire : ${comment} <br><br>`);
            });
        }
    }
}

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
        
        readMap.displayInfoWindow();
        readMap.addReview();
        readMap.createMarkers(map);
        app.clickStars(readMap, map, readMap.markers);

        map.addListener('click', function(event) {
            readMap.addMarker(event.latLng, map);
        });
    });
}
