const { consumer } = require("../../config/kafka");
const logger = require("../../config/logger");
const { TOPICS: KAFKA_TOPICS } = require("../../utils/constants");
const emailService = require('../../services/email.service')
class EmailConsumer {
  async start() {
    try {
      consumer.on(consumer.events.GROUP_JOIN, ({ payload }) => {
        logger.info(`Joined Kafka consumer group: ${payload.groupId}`);
      });
      consumer.on(consumer.events.CRASH, ({ payload }) => {
        logger.error(`Kafka consumer crashed: ${payload.error.message}`);
      });

      await consumer.connect();
      logger.info("Email consumer connected to Kafka");

      const topics = Object.values(KAFKA_TOPICS);
      logger.info(`Subscribing to Kafka topics: ${topics.join(", ")}`);
      await consumer.subscribe({
        topics,
        fromBeginning: false,
      });

      logger.info("Starting Kafka consumer run loop; waiting for messages");
      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            logger.info(`Received Kafka message on ${topic}, partition ${partition}, offset ${message.offset}`);
            const value = JSON.parse(message.value.toString());
            await this.handleMessage(topic, value);
          } catch (error) {
            logger.error(`Error processing message from ${topic}, partition ${partition}, offset ${message.offset}: ${error.message}`);
            throw error;
          }
        },
      });
    } catch (error) {
      logger.error(`Failed to start email consumer: ${error.message}`);
      throw error;
    }
  }

  async handleMessage(topic, data) {
    switch (topic) {
      case KAFKA_TOPICS.OTP_EMAIL:
        await this.handleOtpEmail(data);
        break;

      case KAFKA_TOPICS.WELCOME_EMAIL:
        await this.handleWelcomeEmail(data);
        break;

      case KAFKA_TOPICS.BOOKING_CONFIRMED:
        await this.handleBookingConfirmed(data);
        break;

      case KAFKA_TOPICS.BOOKING_FAILED:
        await this.handleBookingFailed(data);
        break;

      case KAFKA_TOPICS.BOOKING_CANCELLED:
        await this.handleBookingCancelled(data);
        break;

      default:
        logger.warn(`Unknown topic: ${topic}`);
    }
  }

  async handleOtpEmail(data) {
    const { email, otp, ttlMinutes } = data;
    if (!email || !otp) {
        throw new Error('Missing required fields: email or otp');
    }
    await emailService.sendOtpEmail(email, otp, ttlMinutes || 5)
    logger.info(`OTP Email sent to ${email}`)
  }

  async handleWelcomeEmail(data){
    const {email, firstName} = data;
    if (!email || !firstName) {
        throw new Error('Missing required fields: email or firstName');
    }
    await emailService.sendWelcomeEmail(email, firstName);
    logger.info(`Welcome email sent to ${email}`);
  }


}

module.exports = new EmailConsumer();
