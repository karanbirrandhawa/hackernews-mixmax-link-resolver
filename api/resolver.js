var request = require('request');
var sync = require('synchronize');


// This resolver returns a representation of the article linked
// by utilizing official HackerNews API, powered by Firebase
// https://hacker-news.firebaseio.com/v0/item/{id}
module.exports = function (req, res) {
	var url = decodeURIComponent(req.query.url.trim());

	// Verify url is in the following formats: 
	// https://news.ycombinator.com/item?id={id}
	// https://www.news.ycombinator.com/item?id={id}
	// www.news.ycombinator.com/item?id={id}
	// news.ycombinator.com/item?id={id}
	var matches = url.match(/(?:news\.ycombinator\.com\/item\?id=)([0-9]+)$/);
	if (!matches) {
		res.status(400).send('Invalid URL format');
		return;
	}

	var id = matches[1];

	var response;
	var target_url = 'https://hacker-news.firebaseio.com/v0/item/' + id + '.json';
	try {
		response = sync.await(request({
			url : target_url
		}, sync.defer()));
	} catch (e) { 
		if (e.message) { // Such as in the case of URIError with encodeURIComponent
			res.send(500).send(e.toString());
		} else {
			res.send(500).send('Unknown Error');
		}
		return;
	}

	var data = JSON.parse(response.body);
	var by = data.by;
	var title = data.title;
	var url = data.url;
	var score = data.score;

	// Utilize tables for better email compatibility
	var hn_preview = 
		"<table cellpadding='0' cellspacing='0' border='0' style='text-align:left;'>"
			+ "<tbody>"
				+ "<tr>"
					+ "<td>"
						+ "<a href='news.ycombinator.com" 
						+ "' style='text-decoration: none;font-weight:bold;font-family:Helvetica;font-size:18px';color:#FFF>"
							+ "Hacker News"
						+ "</a>"
					+ "</td>"
				+ "</tr>"
				+ "<tr>"
					+ "<td>"
						+ "<a href='" + url 
						+ "' style='text-decoration: none;font-weight:bold;font-family:Helvetica;font-size:20px';color:#222>"
							+ title
						+ "</a>"
					+ "</td>"
				+ "</tr>"
				+ "<tr>"
					+ "<td style='font-family:Helvetica;font-size:15px';text-decoration:none;color:#777'>"
						+ 'Posted by: ' 
						+ "<a href='https://news.ycombinator.com/user?id=" + by + "'>" 
							+ by
						+ "</a>"
					+ "</td>"
				+ "</tr>"
				+ "<tr>"
					+ "<td>"
						+ "<a href='https://news.ycombinator.com/item?id=" + id
						+ "' style='font-family:Helvetica;font-size:14px';text-decoration:none;color:#999'>"
							+ score + ' points'
						+ "</a>"
					+ "</td>"
				+ "</tr>"
			+ "</tbody>"
		+ "</table>";

	res.json({
		body : hn_preview
	})

}