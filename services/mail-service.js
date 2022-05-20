const nodemailer = require('nodemailer');

class MailService {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host:process.env.SMTP_HOST,
            port:process.env.SMTP_PORT,
            secure: false,
            tls: {rejectUnauthorized:false},
            auth: {
                type: "login",
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            }
        })
    }

    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Account activation for ' + process.env.API_URL,
            text: '',
            html: 
                    `
                    <div>

                        <h1>Follow link for account activation</h1>
                        <a href=${link}>${link}</a>
                    </div>

                    `
        })
    }
}

module.exports = new MailService();