class Maps {
    constructor(restaurants) {
        this.restaurants = restaurants;
        this.newRestaurants = [];
        this.markers = [];
    }
    
    /** 
    * Créer le marqueur d'un nouveau restaurant
    *
    * @param {object} location = latitude et longitude d'un marqueur
    * @param {object} map correspond à la carte pour pouvoir placer les marqueurs
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
    * Annule le formulaire pour ajouter un nouveau restaurant (annule également son marqueur)
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
    * Valide la création d'un nouveau marqueur et d'un nouveau restaurant
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
    
    removeModal() {
        $("#newRestaurant").modal('hide').remove();
    }
    
    toggleRestaurant() {
        $.each(this.restaurants, (index, value) => {
            value.marker.addListener('click', () => {
                $(`#collapse${index}`).collapse('toggle'); 
            });
        });
    }
    
    /** 
    * Affiche les détails d'un restaurant (Nom, Adresse, Notes, Commentaires)
    *
    * @param {object} element = un restaurant
    *
    * @return {template} contentString contient un template HTML pour afficher les détails d'un restaurant
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
    * Ajoute les restaurants dans un tableau pour pouvoir les afficher plus tard
    *
    * @return {tab} array tableau qui contient les restaurants
    **/
    
    displayList() {
        const array = [];

        $.each(this.restaurants, (index, value) => {
            array.push(this.createRestaurant(value));
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
    * Ajoute les détails des restaurants dans l'élément #restaurantAccordion
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
    * Template HTML qui permet d'ajouter des notes sous forme d'étoiles
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
    * Retourne un textarea pour ajouter un commentaire
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
    * Formulaire pour ajouter un nouveau restaurant
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
    * Permet de contrôler le formulaire de création de restaurant
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
    * Actions qui correspondent à la validation et à l'annulation du formulaire
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
    * Calcule les étoiles à ajouter ou retirer pour les notes
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
    * Permet d'ajouter un avis (Note + Commentaire)
    *
    * @param {number} rate contient le nombre d'étoiles sélectionnées
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
    * Initialise la carte avec l'API Google Maps
    * Centre la position sur celle de l'utilisateur grâce à un marqueur différent
    * Le setTimeout permet de charger les avis des restaurants sans avoir un QUERY_OVER_LIMIT car il y a beaucoup de requêtes
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
        
        $("#loadingModal").append(`<i class="fa fa-spinner fa-5x fa-pulse" id="loadingSpin"></i><div id="loadingMessage">Chargement en cours ...</div>`);
        
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