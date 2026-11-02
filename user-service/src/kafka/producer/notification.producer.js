const {producer, connectProducer} = require('../../config/kafka')
const { KAFKA_TOPICS } = require('../../../../shared/constants/kafka-topics');
const logger = require("../../config/logger")
class NotificationProducer {
    constructor() {
        this.isInitialized = false;
    }

    async initialize(){
        if(!this.isInitialized){
            await connectProducer();
            this.isInitialized = true;
        }

    }

    async sendOtpEmail(email, otp, ttlMinutes = 5){
        return this.sendMessage(
            KAFKA_TOPICS.OTP_EMAIL,
            `otp-${email}`,
            {email, otp, ttlMinutes}    
        )
    } 

    async sendWelcomeEmail(email, firstName){
        return this.sendMessage(
            KAFKA_TOPICS.WELCOME_EMAIL,
            `welcome-${email}`,
            {email, firstName}
        )
    }

    async sendMessage(topic, key, value){
        try {
            await this.initialize();

            const message = {
                topic,
                messages: [{
                    key: key || `${topic}-${Date.now()}`,
                    value: JSON.stringify(value),
                    timestamp: Date.now().toString()
                }]
            }
            const result = await producer.send(message)
            // console.log('kafka sendmessage result', result)
            logger.info(`Message sent to kafka topic: ${topic}`,{
                key,
                partition: result[0].partition,
                offset: result[0].offset
            })
            return result;
        } catch (error) {
            logger.error(`Failed to send message to kafka topic: ${topic}`, {
                error: error.message,
                stack: error.stack,
                key
            })
            throw error
        }
    }

}

module.exports = new NotificationProducer();