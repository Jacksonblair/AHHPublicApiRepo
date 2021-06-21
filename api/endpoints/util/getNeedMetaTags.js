module.exports = (url, need) => {
	console.log(url)
	console.log(need)

	return `<html>
		<head>
		    <meta property="og:markup_url"         content="${url}" />
		    <meta property="og:type"               content="article" />
		    <meta property="og:title"              content="A Helping Hand: ${need.name}" />
		    <meta property="og:description"        content="Fulfil this need: \"${need.details}\" " />
		    <meta property="og:image"              content="https://www.planetware.com/wpimages/2020/02/france-in-pictures-beautiful-places-to-photograph-eiffel-tower.jpg" />
		    <meta property="fb:app_id"             content="${process.env.FB_APP_ID}" />
		</head>
		<body>
		</body>
	</html>
`}