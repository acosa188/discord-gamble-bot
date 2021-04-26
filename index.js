require("dotenv").config();
const { BlackJack } = require("./services/gamble");
const ChannelPoints = require("./services/channelPointsApi");

const { Client, MessageEmbed } = require("discord.js");
const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });


class GameState {
    constructor() {
        this.game = new BlackJack();
        this.game.hitDealer();
        this.game.hitPlayer();
        this.game.hitPlayer();
        this.done = false;
        this.playerWins = false;
        this.amoutBet = 0;
    }
}

let gamestate;
let channelPointsApi;

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});


client.on("message", async (msg) => {
    const params = msg.content.split(" ");
    if (msg.content.startsWith("gamble") 
    && (params[1] === "blackjack" || params[1] === "bj")
    && params.length === 3
    && !isNaN(parseInt(params[2]))) {
        gamestate = new GameState();
        channelPointsApi = new ChannelPoints(msg.author);
        if(!await channelPointsApi.checkPoints(params[2])) return msg.channel.send("Insufficient points.");
        const game = gamestate.game;
        gamestate.amoutBet = parseInt(params[2]);

        const embeded = new MessageEmbed()
            .setColor('#0099ff')
            .setAuthor(`${msg.author.username}, you bet ${gamestate.amoutBet} points to play blackjack`, msg.author.avatarURL())
            .addFields(
                { name: 'Dealer', value: `Dealer [${game.dealerCards()}]`, inline: true },
                { name: 'Player', value: `${msg.author.username} [${game.playerCards()}]`, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: "Dealer's card", value: game.dealersHand.map(card => card.rank.longName).join(', '), inline: true },
                { name: "Player's card", value: game.playersHand.map(card => card.rank.longName).join(', '), inline: true }
            )
            .setFooter("- game in progress", "https://pngimg.com/uploads/dice/dice_PNG49.png");

        msg.channel.send(embeded).then(async embededMsg => {
            await embededMsg.react('👊');
            await embededMsg.react('🛑');
        });

    }
});


client.on('messageReactionAdd', async (reaction, user) => {
    // When we receive a reaction we check if the reaction is partial or not
    if (reaction.partial) {
        // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching the message: ', error);
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }

    if (user.username !== "Butler") {
        if (reaction.emoji.name === '👊' && !gamestate.done) {

            const embeded = await embededPlayerHit(reaction.message, user.username);

            reaction.message.edit(embeded);
        }
        if (reaction.emoji.name === '🛑' && !gamestate.done) {
            const embeded = await embededDealerHit(reaction.message, user.username);

            reaction.message.edit(embeded);
        }
    }

});

client.on('messageReactionRemove', async (reaction, user) => {
    // When we receive a reaction we check if the reaction is partial or not
    if (reaction.partial) {
        // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching the message: ', error);
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }

    if (user.username !== "Butler") {
        if (reaction.emoji.name === '👊' && !gamestate.done) {

            const embeded = await embededPlayerHit(reaction.message, user.username);

            reaction.message.edit(embeded);
        }
        if (reaction.emoji.name === '🛑' && !gamestate.done) {
            const embeded = await embededDealerHit(reaction.message, user.username);

            reaction.message.edit(embeded);
        }
    }

});

client.login(process.env.BOT_TOKEN);

const embededPlayerHit = async (message, playerName) => {
    gamestate.game.hitPlayer();
    const game = gamestate.game;

    // figure if player busted
    gamestate.done = game.isPlayerBust();

    const embeded = game.isPlayerBust() ? message.embeds[0]
        .setColor("#f54242")
        .setFooter(`- you lost ${gamestate.amoutBet} channel points`, "https://pngimg.com/uploads/dice/dice_PNG49.png") : message.embeds[0];      

    embeded.fields = [];
    embeded
        .addFields(
            { name: 'Dealer', value: `Dealer [${game.dealerCards()}]`, inline: true },
            { name: 'Player', value: `${playerName} [${game.playerCards()}]`, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: "Dealer's card", value: game.dealersHand.map(card => card.rank.longName).join(', '), inline: true },
            { name: "Player's card", value: game.playersHand.map(card => card.rank.longName).join(', '), inline: true }
        );

    if(game.isPlayerBust()) await channelPointsApi.losePoints(gamestate.amoutBet);
    
    return embeded;
}

const embededDealerHit = async (message, playerName) => {

    const game = gamestate.game;
    while (!gamestate.done) {
        gamestate.game.hitDealer();
    
        // figure if dealer is bust
        gamestate.done = game.isDealerBust() || game.dealerCards() >= game.playerCards();

        if (game.isDealerBust()) gamestate.playerWins = true;
    }

    const embeded = message.embeds[0];
    
    // if tie
    if (game.dealerCards() === game.playerCards()) {
        embeded
            .setColor("#9c9c9c")
            .setFooter("- you tied!", "https://pngimg.com/uploads/dice/dice_PNG49.png");    
    }
    else if(gamestate.playerWins){
        embeded
        .setColor("#42f569")
        .setFooter(`- you won ${gamestate.amoutBet} channel points`, "https://pngimg.com/uploads/dice/dice_PNG49.png");
        await channelPointsApi.winPoints(gamestate.amoutBet);
    }
    else{
        embeded
        .setColor("#f54242")
        .setFooter(`- you lost ${gamestate.amoutBet} channel points`, "https://pngimg.com/uploads/dice/dice_PNG49.png");
        await channelPointsApi.losePoints(gamestate.amoutBet);
    }

    embeded.fields = [];
        embeded
            .addFields(
                { name: 'Dealer', value: `Dealer [${game.dealerCards()}]`, inline: true },
                { name: 'Player', value: `${playerName} [${game.playerCards()}]`, inline: true },
                { name: '\u200B', value: '\u200B' },
                { name: "Dealer's card", value: game.dealersHand.map(card => card.rank.longName).join(', '), inline: true },
                { name: "Player's card", value: game.playersHand.map(card => card.rank.longName).join(', '), inline: true }
            );

        return embeded;

}