const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { v4: uuidv4 } = require('uuid')

// Create SES service object.
const sesClient = new SESClient({ region: process.env.AWS_REGION });

let generateParams = (destinations, content, subject) => {
    console.log("Generating params for email")
    console.log("Destination: " + Array.isArray(destinations) ? destinations.toString() : destinations )

    return {
        Destination: {
            /* required */
            ToAddresses: Array.isArray(destinations) ? destinations : [destinations]
            // ToAddresses: Array.isArray(destinations) ? destinations.toString() : destinations
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
        Source: "noreply@ahelpinghand.com.au" // SENDER_ADDRESS    
    }
}

module.exports = {
    sendNeedFulfilledCallToAction: (destination) => {
        let content = `
            <div>
                <p>
                    A big part of the success of A Helping Hand will be through letting our community know the difference they are making and ensuring we thank our generous supporters. 
                </p><p>
                    We need your help to do this! We’d love any photos of the items, stories and thank you notes that <strong>do not identify the recipients</strong> but show the generosity of our community. It’s the beautiful stories of giving and the kindness that A Helping Hand shows and spreads that will encourage others to provide a helping hand where they can.
                </p><p>
                    Please share your stories along with any photos you have by emailing elise@ahelpinghand.com.au. 
                </p>
            </div>`
        let params = generateParams(destination, content, "ahelpinghand.com About your fulfilled need")
        let command = new SendEmailCommand(params);
        return sesClient.send(command)
    },

    sendOrganizationApprovalNotification: (destination) => {
        let content = `
            <div>
                <p>
                    Thank you for registering with A Helping Hand. Your Agency registration has been approved which means you are welcome to logon to <a href="https://ahelpinghand.com.au">https://ahelpinghand.com.au</a> and start listing needs of those you care for. 
                    We hope that together with our generous local community that we can make a real and practical difference to those around us.    
                </p><p>
                    A big part of the success of A Helping Hand will be through letting our community know the difference they are making and ensuring we thank our generous supporters. 
                </p><p>
                    We need your help to do this! We’d love any photos of the items, stories and thank you notes that no not identify the recipients but show the generosity of our community. It’s the beautiful stories of giving and the kindness that A Helping Hand shows and spreads that will encourage others to provide a helping hand where they can.
                </p><p>
                    Please share your stories along with any photos you have by emailing me at elise@ahelpinghand.com.au. 
                </p><p>
                    Feel free to contact us any time with any questions you may have. My personal mobile is 0438 191817.
                </p><p>
                    Warm regards,<br/>
                    Elise McKinnon
                </p>
            </div> `
        let params = generateParams([destination], content, "ahelpinghand.com Organization approval notification")
        let command = new SendEmailCommand(params);
        return sesClient.send(command)
    },

    sendPasswordResetCode: (destination, uuid) => {
        let confirmationLink = `${getBaseUrl()}/complete-reset-password/${uuid}`
        let content = `
            <div>
                <p> Please click the link to set a new password. If you did not request this change, please ignore this e-mail. This link will expire in 15 minutes. </p>
                <a href="${confirmationLink}">${confirmationLink}</a>
            </div>
        `
        let params = generateParams([destination], content, "ahelpinghand.com Password reset confirmation")
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
        let params = generateParams([destination], content, "ahelpinghand.com Email change confirmation")
        
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
                <p> If this need becomes fulfilled, please follow 
                    <a href="${getBaseUrl()}/org/${need.organization_id}/needs/${need.id}/set-fulfilled"> this link </a> 
                to mark it as fulfilled which will remove it from the public list of current needs. </p>
            </div>
        `

        let params = generateParams([destination], content, `ahelpinghand.com Need fulfilment message about: ${need.name}`)
        let command = new SendEmailCommand(params);
        return sesClient.send(command)
    },

    sendFulfilledNeedReminder: (destination, reminder) => {

        let content = `
            <div>
                <p> Hi, this is a reminder about your need: ${reminder.name} </p>
                <p> The need is marked as having been contacted about fulfilment, but is still listed as unfulfilled. </p>
                <p> 
                    If the need is ongoing, please 'extend' it 
                    <a href="${getBaseUrl()}/org/${reminder.organization_id}/needs/${reminder.need_id}/extend"> here </a> 
                    to prevent it being removed manually.
                </p>
                <p> 
                    If the need is fulfilled, please mark it as 'fulfilled' 
                    <a href="${getBaseUrl()}/org/${reminder.organization_id}/needs/${reminder.need_id}/set-fulfilled"> here </a>
                </p> 
                </p>
                    Else, you can delete the need 
                    <a href="${getBaseUrl()}/org/${reminder.organization_id}/needs/${reminder.need_id}/delete"> here </a> 
                </p>
            </div>
        `

        let params = generateParams([destination], content, `ahelpinghand.com Need reminder for: ${reminder.name}`)

        let command = new SendEmailCommand(params);
        return sesClient.send(command)
    },

    sendNewNeedNotification: (need) => {
        let content = `
        <div>
            <p> A new need was just posted and requires approval </p>
            <p> Name: ${need.name} </p>
            <p> Details: ${need.details} </p>
            <p> 
                <a href="${getBaseUrl()}/admin"> Go to Admin Panel  </a> 
            </p>
        </div>
        `
        let params = generateParams(["elise@ahelpinghand.com.au", "janneke@ahelpinghand.com.au", "jtblair@deakin.edu.au"], content, `ahelpinghand.com New need notification`)

        let command = new SendEmailCommand(params);
        return sesClient.send(command)
    },

    sendNewOrgNotification: (org) => {
        let content = `
        <div>
            <p> A new organization just registered and requires approval </p>
            <p> Name: ${org.organization_name} </p>
            <p> 
                <a href="${getBaseUrl()}/admin"> Go to Admin Panel  </a> 
            </p>
        </div>
        `
        let params = generateParams(["elise@ahelpinghand.com.au", "janneke@ahelpinghand.com.au", "jtblair@deakin.edu.au"], content, `ahelpinghand.com New organization notification`)

        let command = new SendEmailCommand(params);
        return sesClient.send(command)     
    }

}

let getBaseUrl = () => {
    let url = process.env.NODE_ENV == "development" ? "http://localhost:3000" : process.env.CLIENT_URL
    return url
}
