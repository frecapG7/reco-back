const User = require('./User');

describe('User method.toJSON', () => {


    it('should return a JSON object', () => {
        const user = new User({
            _id: '64f6db09096d83b20116e62f',
            name: 'John',
            email: 'johndoe@exemple.fr',
        });

        const userJSON = user.toJSON();

        expect(userJSON.id).toBeDefined();
        expect(userJSON.name).toEqual('John');
        expect(userJSON.email).toEqual('johndoe@exemple.fr');
        expect(userJSON.created).toBeDefined();

    });



});
