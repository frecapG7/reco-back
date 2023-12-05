const sinon = require('sinon');
const User = require('../model/User');


const userSettingsService = require('./userSettingsService');
const { NotFoundError } = require('../errors/error');


describe('Test getUserSettings', () => {


    let userFindOneStub;

    beforeEach(() => {
        userSettingsFindOneStub = sinon.stub(User, 'findOne');
    });
    afterEach(() => {
        userSettingsFindOneStub.restore();
    });

    it('Should throw a not found error', async () => {

        userSettingsFindOneStub.resolves(null);

        await expect(userSettingsService.getSettings('123'))
            .rejects
            .toThrow(NotFoundError);
    });

    it('Should test happy path', async () => {


        userSettingsFindOneStub.resolves({
            settings: {
                lang: 'en',
                theme: 'light',
                notifications: true,
            }
        });

        const result = await userSettingsService.getSettings('123');

        expect(result.lang).toEqual('en');
        expect(result.theme).toEqual('light');
        expect(result.notifications).toEqual(true);
    });

});


describe('Test updateUserSettings', () => {

    let userStub;
    beforeEach(() => {
        userStub = sinon.stub(User, 'findByIdAndUpdate');
    });
    afterEach(() => {
        userStub.restore();
    });

    it('Should throw a not found error', async () => {

        userStub.resolves(null);

        await expect(userSettingsService.updateSettings('123', {}))
            .rejects
            .toThrow(NotFoundError);
    });
    it('Should update settings', async () => {

        userStub.resolves({
            _id: '123',
            settings: {
                lang: 'fr',
                theme: 'dark',
                notifications: false,
            }
        });

        const result = await userSettingsService.updateSettings('123', {
            lang: 'fr',
            theme: 'dark',
            notifications: false,
        });


        sinon.assert.calledWith(userStub, '123', {
            settings: {
                lang: 'fr',
                theme: 'dark',
                notifications: false,
            }
        }, { new: true });

        expect(result.lang).toEqual('fr');
        expect(result.theme).toEqual('dark');
        expect(result.notifications).toEqual(false);
    });
});

