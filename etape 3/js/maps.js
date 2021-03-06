class Maps {
    constructor(restaurants) {
        this.restaurants = restaurants;
        this.newRestaurants = [];
        this.markers = [];
    }
    
    /** 
    * Create marker for a new restaurant
    *
    * @param {object} location = latitude and longitude
    * @param {object} map is for place the markers
    **/
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
    
    /** 
    * Cancel form (cancel marker too)
    **/
    cancelForm() {          
        $.each(this.markers, function(index, value) {  
            value.setVisible(false);
        });

        this.markers.pop();

        $.each(this.markers, function(index, value) {  
            value.setVisible(true);
        });

        this.removeModal();
    }
    
    /** 
    * Valid creation of new marker and new restaurant
    *
    * @param {object} event = latitude et longitude d'un marqueur
    **/
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

        if(nextRestaurant.starsAverage < 1) {
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
    
    /** 
    * erase modal
    **/
    removeModal() {
        $("#newRestaurant").modal('hide').remove();
    }
    
    /** 
    * toggle a restaurant when you click on it
    **/
    toggleRestaurant() {
        $.each(this.restaurants, (index, value) => {
            value.marker.addListener('click', () => {
                $(`#collapse${index}`).collapse('toggle'); 
            });
        });
    }
    
    /** 
    * display restaurant's details (name, address, notes, comments)
    *
    * @param {object} element = restaurant
    *
    * @return {template} contentString contains template for display restaurant's details
    **/
    createRestaurant(element) {
        let contentString = "";
        
        contentString = `<ul class="noPadding"><li>${element.name}</li>
                         <li>Adresse : ${element.address}</li></ul>`;

        if(element.ratings != undefined) {
            for(let i = 0; i < element.ratings.length; i++) {
                (function(i) {
                    contentString += (`<ul class="noPadding"><li>Note : ${element.ratings[i].stars}</li>
                         <li>Commentaire : ${element.ratings[i].comment}</li></ul>`);
                })(i)
            }
        }
        
        return contentString;
    }
    
    /** 
    * add restaurant in array for display
    *
    * @return {tab} array contains restaurants
    **/
    displayList() {
        const array = [];

        $.each(this.restaurants, (index, value) => {
            array.push(this.createRestaurant(value));
        });
        
        return array;
    }
    
    /** 
    * display restaurant's details (pic with template for displayList)
    *
    * @return {tab} array contains template for display restaurant's details
    **/
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
    
    /** 
    * Add restaurant's details in #restaurantAccordion
    **/
    displayInfoWindow() {
        const infoWindows = this.createInfoWindow();

        $.each(this.restaurants, (index, value) => {
            
            $("#restaurantAccordion").append(`
                <div class="card">
                  <div class="card-header" id="heading${value.id}">
                    <h5 class="mb-0">
                    <button id="restaurant${value.id}" class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapse${value.id}" aria-expanded="true" aria-controls="collapse${value.id}">
                        ${value.name} <span id="restaurantRate${value.id}">${value.starsAverage}</span> <i class="fas fa-star"></i>
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
                            ${this.addStars()}
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
    
    /** 
    * Template for add note with stars
    **/
    addStars() {
        return `
            <form id="starsForm">
              <div class='rating-stars text-center'>
                <ul id='stars' class="restaurantRatings noPadding">
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
    
    /** 
    * textarea for add a comment
    *
    * @param {number} id
    * @return {template} 
    **/
    addComment(id) {        
        return `
            <label for="formControlTextarea${id}">Commentaire :</label>
            <textarea class="form-control" id="formControlTextarea${id}" rows="3"></textarea>
        `;
    }
    
    /** 
    * form for add a new restaurant
    **/
    newRestaurantForm() {          
        return `
            <div class="modal-body jumbotron">
              <form id="nextForm" role="form">
                <div class="form-group">
                  <input type="text" class="form-control" id="restaurantName" placeholder="Nom du restaurant" autofocus/>
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
    
    /** 
    * control restaurant's form
    **/
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
    
    /** 
    * actions for valid and cancel form
    *
    * @param {object} marker
    **/
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
    
    /** 
    * Calculates stars to add or remove notes
    **/
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
    
    /** 
    * add a review (note + comment)
    *
    * @param {number} rate contains selected stars
    **/
    submitForm(rate) {
        $.each(this.restaurants, (index, value) => {
            const restaurantId = this.restaurants[index].id;
            $(`#review${restaurantId}`).click((e) => {
                e.stopImmediatePropagation();
                $(`#modal${restaurantId}`).modal('hide');
                
                if(rate.length == 0) {
                    const newStars = $("#stars .selected").attr('data-value');
                    rate.push(newStars);
                }
                
                const comment = $(`#formControlTextarea${restaurantId}`).val();
                const json = `{"stars":${rate}, "comment":"${comment}"}`;
                const object = JSON.parse(json);
                
                this.restaurants[index].ratings.push(object);                
                this.restaurants[index].sortByRating();

                document.getElementById("restaurantRate" + restaurantId).textContent = this.restaurants[index].starsAverage;
                
                $(`#info${restaurantId} .card-body`).append(`<div>Note : ${rate}</div><div class="breakLine">Commentaire : ${comment}</div>`);
            });
        });
    }
}
    
/** 
* initialize map with Google Maps API
* Center the position on user with a different marker
* setTimeout loads review's restaurants without QUERY_OVER_LIMIT because there is many requests
**/
let map;

function initMap() {
    let myPosition = new google.maps.LatLng(49.2535299, 3.9850489);
    let app;
    
    navigator.geolocation.getCurrentPosition(function(position) {
        myPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    
        const iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';

        const request = {
            location: myPosition,
            radius: 10000,
            type: ['restaurant']
        }

        map = new google.maps.Map(document.getElementById('map'), {
            center: myPosition,
            zoom: 12
        });
        
        const marker = new google.maps.Marker({
            position: myPosition,
            map: map,
            icon: iconBase + 'library_maps.png',
        });
    
        app = new Application(map, request); 
    });

    document.addEventListener("restaurantLoaded", () => {
        const readMap = new Maps(app.listRestaurants);
        
        app.callBack();
        
        $("#info").append(`<div class="modal" id="loadingModal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false"></div>`);
        
        $('#loadingModal').modal('show');
        
        $("#loadingModal").append(`<i class="fa fa-spinner fa-5x fa-pulse marginSpin" id="loadingSpin"></i><div id="loadingMessage" class="marginMessage">Chargement en cours ...</div>`);
        
        setTimeout(() => {
            readMap.displayInfoWindow();
            readMap.addReview();
            app.clickStars(readMap, map);
            
            $('#loadingModal').modal('hide').remove();
        
            map.addListener('click', function(event) {
                readMap.addMarker(event.latLng, map);
            });  
        }, 10000);
    }); 
}