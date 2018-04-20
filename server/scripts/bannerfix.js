/*eslint no-console:0 */
const monk = require('monk');

let db = monk('mongodb://127.0.0.1:27017/throneteki');

let dbDecks = db.get('decks');

const fixBanners = async () => {
    let count = await dbDecks.count({});
    console.info(count, 'decks to process');
    let numberProcessed = 0;
    let chunkSize = 5000;

    while(numberProcessed < count) {
        let decks = await dbDecks.find({}, { limit: chunkSize, skip: numberProcessed});
        console.info('loaded', decks.length, 'decks');
        for(let deck of decks) {
            if(deck.bannerCards) {
                if(deck.bannerCards.some(card => {
                    return !card.code;
                })) {
                    console.info('found one', deck.name);
                    deck.bannerCards = deck.bannerCards.filter(card => {
                        return !!card.code;
                    });

                    await dbDecks.update({ _id: deck._id }, {'$set': {
                        bannerCards: deck.bannerCards
                    }});
                }
            }
        }

        numberProcessed += decks.length;
        console.info('processed', numberProcessed, 'decks');
    }

    db.close();
};

fixBanners();
