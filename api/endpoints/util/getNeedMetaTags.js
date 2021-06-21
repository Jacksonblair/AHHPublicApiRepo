module.exports = (url, need) => { `
	<!DOCTYPE html>
		<html>
		<head>
		    <meta property="og:url"                content="${url}" />
		    <meta property="og:type"               content="article" />
		    <meta property="og:title"              content="${need.title}" />
		    <meta property="og:description"        content="${need.details}" />
		    <meta property="og:image"              content="${need.image_url}" />
		</head>
		<body>
		</body>
	</html>
`}