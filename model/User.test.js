const User = require('./User');



describe('User method.toJSON', () => {


    it('should return a JSON object', () => {
        const user = new User({
            _id: '64f6db09096d83b20116e62f',
            name: 'John',
            email: 'johndoe@exemple.fr',
            created: new Date(),
        });

        const userJSON = user.toJSON();
        console.log(userJSON);

        expect(userJSON).toEqual({
            //id: '64f6db09096d83b20116e62f',
            name: 'John',
            email: 'johndoe@exemple.fr',
            created: expect.any(Date),
        });
});



});
