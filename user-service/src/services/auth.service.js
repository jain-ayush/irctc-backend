const { Prisma } = require("@prisma/client")
const { ConflictError, BadRequestError } = require("../utils/error")
const {generateAndStoreOtp, verifyOtp} = require('../utils/otp')
const logger = require("../config/logger")
const bcrypt = require('bcrypt')
const prisma = require('../config/prisma')
const jwt = require('jsonwebtoken')
const {redis} = require('../config/redis');
const config = require("../config");

const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/auth')
const sendOTP = async(firstName, lastName, email, password) => {
    const existingUser = await prisma.user.findUnique({
        where: {email}
    })
    if(existingUser){
        throw new ConflictError("User already exist")
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const meta = {firstName, lastName, email, hashedPassword};
    const {otp, otpSessionId} = await generateAndStoreOtp(meta);
    // await sendOtpEmail(email, otp)
    console.log('otp',otp)
    console.log('otpSessionId',otpSessionId)
    return {otpSessionId}
}

const verifyOTP = async(otp, otpSessionId) => {
    const meta = await verifyOtp(otp, otpSessionId)
    console.log('metaaaaaaaa', meta)
    if(meta === null){
          throw new BadRequestError("Invalid or expired OTP", "OTP_INVALID");
     }
    
    const user = await prisma.user.create({
        data:{
            firstName: meta.firstName,
            lastName: meta.lastName,
            email: meta.email,
            password: meta.hashedPassword,
            emailVerified: true
        }
        
    });
    return user
}

const login = async(email, password, deviceId) =>{
     const existingUser = await prisma.user.findUnique({
          where: {email}
     })
     if(!existingUser){
          throw new UnauthorizedError("Invalid email or password", "INVALID_CREDENTIALS");
     }
     if(!existingUser.password){
          throw new BadRequestError(
               "This account was created with Google. Please sign in with Google.",
               "OAUTH_ONLY_ACCOUNT"
          );
     }
     const doesPasswordMatch = await bcrypt.compare(password, existingUser.password);
     if(!doesPasswordMatch){
          throw new UnauthorizedError("Invalid email or password", "INVALID_CREDENTIALS");
     }
     const accessToken = generateAccessToken(existingUser.id);
     const refreshToken = generateRefreshToken(existingUser.id);
     const {jti} = jwt.decode(refreshToken);
     await redis.set(`refresh:${existingUser.id}:${deviceId}`, jti, 'EX', config.REFRESH_TOKEN_EXP_SEC);
     const {password: _password, ...safeUser} = existingUser;
     await redis.set(`user:${existingUser.id}`, JSON.stringify(safeUser), 'EX', config.REDIS_USER_TTL);
     return {accessToken, refreshToken, loggedInUser: safeUser};
}

const rotateRefreshToken = async(refreshToken, deviceId) =>{
     const payload = verifyRefreshToken(refreshToken);
     const {id: userId, jti} = payload;
     const storedJti = await redis.get(`refresh:${userId}:${deviceId}`);
     if(!storedJti){
          throw new ForbiddenError("Session Expired", "Login AGAIN")
     }
     if(storedJti !== jti){
          await redis.del(`refresh:${userId}:${deviceId}`);
          throw new ForbiddenError("Refresh token reused", "LOGIN AGAIN")
     }
     const newAccessToken = generateAccessToken(payload.id);
     const newRefreshToken = generateRefreshToken(payload.id);
     const {jti: newJti} = jwt.decode(newRefreshToken);
     await redis.set(`refresh:${payload.id}:${deviceId}`, newJti, 'EX', config.REFRESH_TOKEN_EXP_SEC);
     return {newAccessToken, newRefreshToken};
}


module.exports = {sendOTP, verifyOTP, login, rotateRefreshToken}