class Restaurant {
    constructor(name, address, position, pic, starsAverage, id) {
        this.name = name;
        this.address = address;
        this.position = position;
        this.pic = pic;
        this.ratings;
        this.starsAverage = starsAverage;
        this.id = id;
    }
    
    /** 
    * Calcule la moyenne des notes d'un restaurant
    *
    * @return {number} this.starsAverage
    **/

    sortByRating() {
        const reducer = (accumulator, currentValue) => accumulator + currentValue;
        const stockRate = [];
        const totalRate = this.ratings ? this.ratings.length : 0;

        if(totalRate > 0) {
            for(let i = 0; i < totalRate; i++) {
                const note = this.ratings[i].stars;
                stockRate.push(note);
            }
            
           this.starsAverage = stockRate.reduce(reducer) / totalRate;
        }
        
        this.starsAverage = Math.round(this.starsAverage * 10) / 10;
    }
}