const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { v4: uuidv4 } = require('uuid')

// Create SES service object.
const sesClient = new SESClient({ region: process.env.AWS_REGION });

let generateParams = (destination, content, subject) => {
    return {
        Destination: {
            /* required */
            ToAddresses: [ destination
                /* more To-email addresses */
            ],
        },
        Message: {
            /* required */
            Body: {
                /* required */
                Html: {
                    Charset: "UTF-8",
                    Data: content,
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject,
            },
        },
        Source: "jackson.blair@live.com" // SENDER_ADDRESS    
    }
}

module.exports = {

    sendPasswordResetCode: (destination, uuid) => {

        let confirmationLink = `${getBaseUrl()}/complete-reset-password/${uuid}`
        let content = `
            <div>
                <p> Please click the link to set a new password. If you did not request this change, please ignore this e-mail. This link will expire in 15 minutes. </p>
                <a href="${confirmationLink}">${confirmationLink}</a>
            </div>
        `
        let params = generateParams("jtblair@deakin.edu.au", content, "ahelpinghand.com Password reset confirmation")
        let command = new SendEmailCommand(params);
        return sesClient.send(command)

    },

    sendEmailChangeConfirmationRequest: (destination, uuid) => {

        let confirmationLink = `${getBaseUrl()}/confirm-update-email/${uuid}`
        let content = `
            <div>
                <p> Please click the link to confirm your e-mail change. If you did not request this change, please ignore this e-mail. This link will expire in 15 minutes. </p>
                <a href="${confirmationLink}">${confirmationLink}</a>
            </div>
        `
        let params = generateParams("jtblair@deakin.edu.au", content, "ahelpinghand.com Email change confirmation")
        
        let command = new SendEmailCommand(params);
        return sesClient.send(command)
    },

    sendFulfilledNeedNotification: (destination, details, need) => {

        let content = `
            <div>
                <p> ${details.contact_name} has left a message regarding fulfilment of ${need.name} </p>
                <p> MESSAGE CONTENTS </p>
                <p> ${details.message} </p>
                <p> Contact details </p>
                <p> Phone: ${details.contact_number ? details.contact_number : "None provided"} </p>
                <p> Email: ${details.email ? details.email : "None provided"} </p>
                <p> If this need is now fulfilled, please follow 
                    <a href="${getBaseUrl()}/org/${need.organization_id}/needs/${need.id}/delete"> this link </a> 
                to delete it. </p>
            </div>
        `

        let params = generateParams("jtblair@deakin.edu.au", content, `ahelpinghand.com Need details notification for ${need.name}`)

        let command = new SendEmailCommand(params);
        return sesClient.send(command)
    },

    sendFulfilledNeedReminder: (destination, reminder) => {

        let content = `
            <div>
                <p> Hi, this is a reminder about your need: ${reminder.name} </p>
                <p> The need is marked as fulfilled, but is still listed. </p>
                <p> We understand that the need may be ongoing, but if it is not, please delete it
                    <a href="${getBaseUrl()}/org/${reminder.organization_id}/needs/${reminder.need_id}/delete"> here </a> 
                <br/>
                </p> To 'extend' the need and avoid it being marked as 'inactive', please click
                    <a href="${getBaseUrl()}/org/${reminder.organization_id}/needs/${reminder.need_id}/extend"> here </a> 
                </p>
            </div>
        `

        let params = generateParams("jtblair@deakin.edu.au", content, `ahelpinghand.com Need details notification for ${reminder.name}`)

        let command = new SendEmailCommand(params);
        return sesClient.send(command)
    },




}

let getBaseUrl = () => {
    let url = process.env.NODE_ENV == "development" ? "http://localhost:3000" : "https://ahelpinghandclient.herokuapp.com"
    return url
}
