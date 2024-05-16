const User = require('./User');

describe('User method.toJSON', () => {


    it('should return a JSON object', () => {
        const user = new User({
            _id: '64f6db09096d83b20116e62f',
            name: 'John',
            title: 'Rookie Balboa',
            balance: 20,
        });

        const userJSON = user.toJSON();

        expect(userJSON.id).toBeDefined();
        expect(userJSON.name).toEqual('John');
        expect(userJSON.title).toEqual('Rookie Balboa');
        expect(userJSON.balance).toEqual(20);
        expect(userJSON.created).toBeDefined();

    });



});
