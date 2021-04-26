const { BlackJack } = require("../services/gamble");
let game;

beforeEach(()=>{
    game = new BlackJack();
});

test("getting two cards on a deck", () =>{
    game.hitDealer();
    game.hitPlayer();
    expect(game.deck.remainingLength).toBe(50);
});

test("converting faceCard to numbers", () => {
    game.playersHand = [
        {
            suit: {
                name: 'spades'
            },
            rank: {
                shortName: '5',
                longName: 'Five'
            }
        },
        {
            suit: {
                name: 'diamonds'
            },
            rank: {
                shortName: 'J',
                longName: 'Jack'
            }
        }
    ];

    expect(game.playerCards()).toBe(15);
});

test("testing total hand with an Ace card", () => {
    const handNotBust = [  
        {
        suit: {
            name: 'spades'
        },
        rank: {
            shortName: '10',
            longName: 'Ten'
        }
    },
    {
        suit: {
            name: 'diamonds'
        },
        rank: {
            shortName: 'A',
            longName: 'Ace'
        }
    }];
    const handIsBust = [
        {
            suit: {
                name: 'spades'
            },
            rank: {
                shortName: '5',
                longName: 'Five'
            }
        },
        {
            suit: {
                name: 'diamonds'
            },
            rank: {
                shortName: '10',
                longName: 'Ten'
            }
        },
        {
            suit: {
                name: 'diamonds'
            },
            rank: {
                shortName: 'A',
                longName: 'Ace'
            }
        }
    ];

    game.dealersHand = handNotBust;
    expect(game.dealerCards()).toBe(21);

    game.dealersHand = handIsBust;
    expect(game.dealerCards()).toBe(16);
})