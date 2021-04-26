const { decks } = require("cards");

const dailyPoints = () => {
    return 5000;
}

class BlackJack {

    constructor(){
        this.deck = new decks.StandardDeck();
        // shuffle deck
        this.deck.shuffleAll();

        // initialize first cards
        this.dealersHand = [];
        this.playersHand = [];
        this.faceCards = ['J', 'Q', 'K'];
    }

    hitPlayer() {
        this.playersHand.push(this._drawCard());
    }

    hitDealer(){
        this.dealersHand.push(this._drawCard());
    }

    playerCards(){
        return this.playersHand.map(card => this._convertingFaceCards(card.rank.shortName)).reduce((x,y) => y === 'A' ? (x + 11 > 21 ? x + 1 : x + 11) : x + y, 0);
    }

    dealerCards(){
        return this.dealersHand.map(card => this._convertingFaceCards(card.rank.shortName)).reduce((x,y) => y === 'A' ? (x + 11 > 21 ? x + 1 : x + 11) : x + y, 0);
    }

    isPlayerBust(){
        return this.playerCards() > 21;
    }

    isDealerBust(){
        return this.dealerCards() > 21;
    }

    _drawCard(){
        let card = this.deck.draw()[0];
        this.deck.discard(card);
        return card;
    }

    _convertingFaceCards(faceCard){
        return this.faceCards.includes(faceCard) ? 10 : faceCard === 'A' ? 'A' : parseInt(faceCard);
    }

}

module.exports = {
    BlackJack,
    dailyPoints
}