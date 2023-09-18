const { expect } = require('chai');
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

        expect(userJSON).to.have.property('id');
        expect(userJSON).to.have.property('name').to.equal('John');
        expect(userJSON).to.have.property('email').to.equal('johndoe@exemple.fr');
        expect(userJSON).to.have.property('created').to.be.a('date');

    });



});
