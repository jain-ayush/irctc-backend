const KAFKA_TOPICS = {
    // Notification topics (user-service -> notification-service)
     OTP_EMAIL: 'notification.otp-email',
     WELCOME_EMAIL: 'notification.welcome-email',
     BOOKING_EMAIL: 'notification.booking-email',
     PAYMENT_EMAIL: 'notification.payment-email',
};

const DLQ_MAX_RETRIES = 3;

module.exports = {KAFKA_TOPICS, DLQ_MAX_RETRIES}