const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3001

// Set up supertokens
let cors = require("cors");
let supertokens = require("supertokens-node");
let Session = require("supertokens-node/recipe/session");
let websiteUrl = process.env.NODE_ENV == "production" ? process.env.WEBSITE_URL : "http://localhost:3000"
let serverUrl = process.env.NODE_ENV == "production" ? process.env.SERVER_URL : "http://localhost:3001"

// Initialize supertokens
supertokens.init({
    supertokens: {
		connectionURI: process.env.SUPERTOKENS_CONNECTION_URI,
		apiKey: process.env.SUPERTOKENS_API_KEY
    },
    appInfo: {
        // learn more about this on https://supertokens.io/docs/session/appinfo
        appName: "AHH", // Example: "SuperTokens",
        apiDomain: websiteUrl, // Example: "https://api.supertokens.io",
        websiteDomain: serverUrl // Example: "https://supertokens.io"
    },
    recipeList: [
        Session.init()
    ]
});

// Body-parser
app.use(bodyParser.json())

// Supertokens middlewares (have to go BEFORE endpoints)
app.use(cors({
    origin: websiteUrl,
    allowedHeaders: ["content-type", ...supertokens.getAllCORSHeaders()],
    credentials: true,
}));
app.use(supertokens.middleware());


// Endpoints
const authEndpoints = require('./api/endpoints/auth.js')
const organizationEndpoints = require('./api/endpoints/organization.js')
const currentNeedsEndpoints = require('./api/endpoints/currentNeeds.js')
const facebookEndpoints = require('./api/endpoints/facebook.js')
const awsEndpoints = require('./api/endpoints/aws.js')
const adminEndpoints = require('./api/endpoints/admin.js')

app.use('/auth', authEndpoints)
app.use('/org', organizationEndpoints)
app.use('/current-needs', currentNeedsEndpoints)
app.use('/facebook-feed', facebookEndpoints)
app.use('/aws', awsEndpoints)
app.use('/admin', adminEndpoints)

// Supertokens error handler (has to AFTER endpoints)
app.use(supertokens.errorHandler())


app.listen(port, (err) => {
	if (err) console.log(`Error: ${err}`)
	console.log(`Listening on ${port}`)
	console.log(`NODE_ENV: ${process.env.NODE_ENV}`)
})
