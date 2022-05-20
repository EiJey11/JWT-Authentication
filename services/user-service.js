const UserModel = require('../models/user-model');
const uuid = require('uuid')
const bcrypt = require('bcrypt')
const mailService = require('./mail-service')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-error')

class UserService {
    async registration(email, password) {
        const candidate = await UserModel.findOne({ email})
        if(candidate) {
            throw ApiError.BadRequest(`User with this ${email} email already exists`)
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'

        const user = await UserModel.create({email, password: hashPassword, activationLink})
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);

        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})

        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {...tokens, user: userDto}
    }

    async activate (activationLink) {
        const user = await UserModel.findOne ({activationLink})
        if(!user) {
            throw ApiError.BadRequest('Link is not correct')
        }
        user.isActivated = true;
        await user.save();
    }
}

module.exports = new UserService();