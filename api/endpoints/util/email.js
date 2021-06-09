const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { v4: uuidv4 } = require('uuid')

// Create SES service object.
const sesClient = new SESClient({ region: process.env.AWS_REGION });

let generateParams = (destination, content) => {
    return {
        Destination: {
            /* required */
            ToAddresses: [
                destination //RECEIVER_ADDRESS
                /* more To-email addresses */
            ],
        },
        Message: {
            /* required */
            Body: {
                /* required */
                Html: {
                    Charset: "UTF-8",
                    Data: `<div> ${content} </div>`,
                },
                Text: {
                    Charset: "UTF-8",
                    Data: `Hello does this survive`,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: "EMAIL_SUBJECT",
            },
        },
        Source: "jackson.blair@live.com" // SENDER_ADDRESS    
    }
}

module.exports = {

    sendPasswordResetCode: (uuid) => {

        let baseUrl = process.env.NODE_ENV == "development" ? "http://localhost:3000" : "TODO GET SERVER URL"
        let confirmationLink = `${baseUrl}/complete-reset-password/${uuid}`
        let content = `
            <div>
                <p> Please click the link to set a new password. If you did not request this change, please ignore this e-mail. This link will expire in 15 minutes. </p>
                <a href="${confirmationLink}">${confirmationLink}</a>
            </div>
        `
        let params = generateParams("jtblair@deakin.edu.au", content)
        let command = new SendEmailCommand(params);
        return sesClient.send(command)

    },

    sendEmailChangeConfirmationRequest: (destination, uuid) => {

        let baseUrl = process.env.NODE_ENV == "development" ? "http://localhost:3000" : "TODO GET SERVER URL"
        let confirmationLink = `${baseUrl}/confirm-update-email/${uuid}`
        let content = `
            <div>
                <p> Please click the link to confirm your e-mail change. If you did not request this change, please ignore this e-mail. This link will expire in 15 minutes. </p>
                <a href="${confirmationLink}">${confirmationLink}</a>
            </div>
        `
        let params = generateParams("jtblair@deakin.edu.au", content)
        // "Please click link to confirm your e-mail change. If you did not request this change, please ignore this e-mail. "
        
        let command = new SendEmailCommand(params);
        return sesClient.send(command)
    },

    sendEmail: async (destination,) => {
        // let command = new SendEmailCommand(params);

        // sesClient.send(command)
        // .then(res => {
        //     console.log("success")
        //     console.log(res)
        // })
        // .catch(err => {
        //     console.log(err.message)
        //     const { requestId, cfId, extendedRequestId } = err.$metadata;
        //     console.log({ requestId, cfId, extendedRequestId });
        // })
    }

}


