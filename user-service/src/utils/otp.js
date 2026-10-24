
const { TooManyRequestsError } = require("./error");
const config = require("../config");
const RATE_MAX = parseInt(config.OTP_RATE_MAX_PER_HOUR || '5', 10);
const VERIFY_MAX = parseInt(config.OTP_MAX_VERIFY_ATTEMPTS || '5', 10);
const otpGenerator = require('otp-generator')
const crypto = require('crypto')
const HMAC_SECRET = config.OTP_HMAC_SECRET
const {redis} = require('../config/redis');
const logger = require("../config/logger");
const OTP_TTL = parseInt(config.OTP_TTL || '300', 10)
const hmacFor = (email, otp) => {
    return crypto.createHmac('sha256', HMAC_SECRET).update(email + ':' + otp).digest('hex');
}

const generateAndStoreOtp = async(meta) => {
    const rateKey = `otp:rate:${meta.email}`;     // how many otp can be send in an hour
    const sentCount = parseInt(await redis.get(rateKey) || '0', 10)
    logger.info('logger rateKey', {rateKey})
    console.log('console rateKey', rateKey)
    if(sentCount >= RATE_MAX) {
        throw new TooManyRequestsError(
            "Too many request, try again later",
            "OTP_RATE_LIMIT"
        )
    }

    const otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false
    })

    const otpSessionId = crypto.randomUUID();
    const hashed = hmacFor(meta.email, otp)
    await redis.set(`otp:session:${otpSessionId}`, JSON.stringify({
        hashedOtp: hashed,
        meta
    }), 'Ex', OTP_TTL)
    const otpCount = await redis.incr(rateKey)
    await redis.expire(rateKey, 3600)
    // console.log(` otp count ${otpCount}/${RATE_MAX}`)
    return {otp, otpSessionId}
}

const verifyOtp = async(otp, otpSessionId) => {
    const rawData = await redis.get(`otp:session:${otpSessionId}`)

    if(!rawData) return null

    const {hashedOtp: storedOtp, meta} = JSON.parse(rawData);

    const attemptsKey = `otp:attempts:${meta.email}`;
    const attemptsCount = parseInt(await redis.get(attemptsKey) || '0', 10)
    if(attemptsCount >= VERIFY_MAX) {
        throw new TooManyRequestsError('Too many attempt request')
    }
    const hashedOtp = hmacFor(meta.email, otp)
    if(crypto.timingSafeEqual(
        Buffer.from(hashedOtp,'hex'),
        Buffer.from(storedOtp, 'hex')
    )) {
        await redis.del(`otp:session:${otpSessionId}`, attemptsKey);
        await redis.del(`otp:rate:${meta.email}`);
        return meta
    } else {
        await redis.incr(attemptsKey)
        await redis.expire(attemptsKey, OTP_TTL)
        return null;
    }
    
}

module.exports = {generateAndStoreOtp, verifyOtp}