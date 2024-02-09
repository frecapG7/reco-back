const { generateRandom } = require('./utils');


describe('Test generateRandom function', () => {




    it('Should test different random size values', async () => {

        const random1 = generateRandom(4);

        console.debug(random1);


        const random2 = generateRandom(6);

        console.debug(random2);


        const random3 = generateRandom(12);

        console.debug(random3);


    })

})