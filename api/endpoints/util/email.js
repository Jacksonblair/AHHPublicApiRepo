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
                It is wonderful to hear that another local person has received help through your efforts. Thank you for letting us know.
                </p><p>
                A big part of the success of A Helping Hand will be through letting our community know the difference they are making to help others. We need your help to do this!
                </p><p>
                We would love any photos of the items, stories and thank you notes that in no way identifies the recipients but highlights the generosity of our community. It is these story that will encourage others to give a helping hand where they can.
                </p><p>
                Please share your stories along with any photos you have by emailing us at <strong>community@ahelpinghand.com.au.</strong>
                </p><p>
                Feel free to contact us any time with any questions you may have.
                </p><p>
                Warm regards, <br/>Elise, Lauren and Janneke
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
                Thank you for registering with A Helping Hand. Your Agency registration has been approved which means you are welcome to logon to <a href="https://ahelpinghand.com.au">https://ahelpinghand.com.au</a> and start listing the needs of those you care for. We hope that together with our generous local community that we can make a real and practical difference to those around us.
                A big part of the success of A Helping Hand will be through letting our community know the difference they are making to help others. We need your help to do this!
                </p><p>
                We would love any photos of the items, stories and thank you notes that in no way identifies the recipients but highlights the generosity of our community. It is these story that will encourage others to give a helping hand where they can.
                </p><p>
                Please share your stories along with any photos you have by emailing us at community@ahelpinghand.com.au.
                </p><p>
                Feel free to contact us any time with any questions you may have.
                </p><p>
                Warm regards, <br/>Elise, Lauren and Janneke
                </p>
            </div>`
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
            </div> `
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
                <p>
                    Dear ${reminder.contact_name}
                <p></p>
                    We are contacting you in regards to your needs listing for ${reminder.name}
                <p></p>
                    We are so pleased to see that someone has offered to fulfill your listed need. Could you please update your listing <a href="${getBaseUrl()}/org/${reminder.organization_id}/needs/${reminder.need_id}/set-fulfilled">here</a> if the need has been fulfilled?
                <p></p>
                    If the need is ongoing, please extend the listing <a href="${getBaseUrl()}/org/${reminder.organization_id}/needs/${reminder.need_id}/extend">here</a> to avoid it being deleted automatically.
                <p></p>
                    We appreciate the work you are doing to make a difference to so many in our community.
                <p></p>
                    Warm regards, <br/>Elise, Lauren and Janneke
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
            <p> Requirements: ${need.requirements ? need.requirements : " - "} </p>
            <p> Region: ${need.region} </p>
            <p> Category: ${need.category} </p>
            <p> 
                <a href="${getBaseUrl()}/admin"> Go to Admin Panel  </a> 
            </p>
        </div>
        `
        let params = generateParams(["elise@ahelpinghand.com.au", "janneke@ahelpinghand.com.au", "jtblair@deakin.edu.au"], content, `ahelpinghand.com New need notification`)

        let command = new SendEmailCommand(params);
        return sesClient.send(command)
    },

    sendUpdatedNeedNotification: (need) => {
        let content = `
        <div>
            <p> An existing need was just updated and requires approval again </p>
            <p> Name: ${need.name} </p>
            <p> Details: ${need.details} </p>
            <p> Requirements: ${need.requirements ? need.requirements : " - "} </p>
            <p> Region: ${need.region} </p>
            <p> Category: ${need.category} </p>
            <p> 
                <a href="${getBaseUrl()}/admin"> Go to Admin Panel </a> 
            </p>
        </div>
        `
        let params = generateParams(["elise@ahelpinghand.com.au", "janneke@ahelpinghand.com.au", "jtblair@deakin.edu.au"], content, `ahelpinghand.com Updated need notification`)
        let command = new SendEmailCommand(params);
        return sesClient.send(command)
    },

    sendNewOrgNotification: (org) => {
        let content = `
        <div>
            <p> A new organisation just registered and requires approval </p>
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
