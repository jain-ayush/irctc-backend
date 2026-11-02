const sgMail = require('@sendgrid/mail');
const logger = require('../config/logger');
const config = require('../config') 
const {
     getOtpTemplate,
     getWelcomeTemplate,
     getTicketConfirmationTemplate,
     getBookingConfirmedTemplate,
     getBookingFailedTemplate,
     getBookingCancelledTemplate,
} = require('../templates');

class EmailService {
    constructor() {
        this.from = config.MAIL_SEND;
        this.max_retries = 3;
        if (config.SENDGRID_API_KEY) {
            sgMail.setApiKey(config.SENDGRID_API_KEY);
        }
    }

    async sendWithRetry(msg, retries = 0) {
        try {
            await sgMail.send(msg);
            logger.info(`Email sent successfully to ${msg.to}`, {
                subject: msg.subject,
                attempt: retries + 1
            });
            return { success: true };
        } catch (error) {
            const responseErrors = error.response
                && error.response.body
                && Array.isArray(error.response.body.errors)
                ? error.response.body.errors
                    .map((item) => item.message)
                    .filter(Boolean)
                    .join("; ")
                : "";
            const errorDetails = [
                error.message || String(error),
                error.code && `code ${error.code}`,
                error.response && error.response.statusCode && `HTTP ${error.response.statusCode}`,
                responseErrors,
            ].filter(Boolean).join(" | ");
            logger.error(`Email sending failed (attempt ${retries + 1}/${this.max_retries}): ${errorDetails}`);
            if(retries < this.max_retries - 1) {
                const delay = Math.pow(2, retries) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.sendWithRetry(msg, retries + 1)
            }
            throw error;
        }
    }

    async sendOtpEmail(email, otp, ttlMinutes){
        const msg = {
            to: email,
            from: this.from,
            subject: 'Your verification code',
            html: getOtpTemplate(otp, ttlMinutes)
        }
        return this.sendWithRetry(msg)
    }

    async sendWelcomeEmail(email, firstName){
        const msg = {
            to: email,
            from: this.from,
            subject: 'Welcome to welcome email - Email Verified',
            html: getWelcomeTemplate(firstName),
        };

        return this.sendWithRetry(msg);
    }

}

module.exports = new EmailService();