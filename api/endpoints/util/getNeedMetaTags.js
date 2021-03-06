module.exports = (url, need) => {
	if (need == undefined) throw("Need does not exist")

	// TODO: Add in default image url

	return `<html>
		<head>
		    <meta property="og:url"                content="doesntmatter.com"/>
		    <meta property="og:type"               content="website" />
		    <meta property="og:title"              content="A Helping Hand: ${need.name}" />
		    <meta property="og:description"        content="Fulfil this need: ${need.details} " />
		    <meta property="og:image"              content="${need.need_image_url ? need.need_image_url : "https://ahelpinghandbucket.s3.ap-southeast-2.amazonaws.com/logoWithValue.png"}"/>
		    <meta property="og:image:type" 		   content="image/jpeg,image/png" />
		    <meta property="fb:app_id"             content="${process.env.FB_APP_ID}" />
		</head>
		<body>
		</body>

		<script>
			window.location.replace('${url}')
		</script>
	</html>
`}

