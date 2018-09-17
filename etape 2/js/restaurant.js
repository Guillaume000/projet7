class Restaurant {
    constructor(name, address, position, pic, ratings) {
        this.name = name;
        this.address = address;
        this.position = position;
        this.pic = pic;
        this.ratings = ratings;
        this.starsAverage = 0;
    }

    sortByRating() {
        const reducer = (accumulator, currentValue) => accumulator + currentValue;
        const stockRate = [];
        const totalRate = this.ratings.length;

        for(let i = 0; i < this.ratings.length; i++) {
            const note = this.ratings[i].stars;
            stockRate.push(note);
        }

        this.starsAverage = stockRate.reduce(reducer) / totalRate;

        return this.starsAverage;
    }
}
