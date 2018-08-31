const express = require ('express');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT } = require('./config');
const { BlogPosts } = require('./models');

const app = express();

app.use(morgan('common'))l
app.use(express.json());

app.get('/blog-posts', (req, res) => {
	BlogPosts
	.find()
	.then(blogPosts => {
		res.json({
			blogPosts: blogPosts.map(
				(blogPosts) => blogPosts.serialize());
		});
	})
	.catch(
		err => {
			console.error(err);
			res.status(500).json(message: 'Not working');
		});
});

app.get('blog-posts/:id', (req, res) => {
	BlogPosts
	.findById(req.params.id)
	.then(blogPosts =>res.json(blogPosts.serialize()))
	.catch(err => {
		console.error(err);
		res.status(500).json({message: 'error in get'});
	});
});

app.post('/blog=posts', (req, res) => {

	const requiredFields = ['title,', 'content', 'author'];
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if(!(field in req.body)) {
			const message = `Missing ${field} in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}

	BlogPosts
	.create({
		title: req.body.title,
		content: req.body.content,
		author: req. body.author,
		date:req.body.date
	})
	.then(
		blogPosts => res.status(201).json(blogPosts.serialize()));
	.catch(err => {
		console.error(err);
		res.status(500).json({message: 'error in post'});
	});
});

app.put('/blog-posts/:id', (req, res) => {

	if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		const message = (
			`Request path id (${req.params.id}) and request body id (${req.body.id}}) must match`);
			console.error(message);
			return res.status(400).json({message: message});
	}

	const toUpdate = {};
	const updateableFIelds = ['title', 'content', 'author'];

	updateableFIelds.forEach(field => {
		if (field in req.body) {
			toUpdate[field] =req.body.[field];
		}
	});

	BlogPosts
		.findByIdAndUpdate(req.params.id, ({$set: toUpdate}))
		.then(blogPosts => res.status(204).end());
		.catch(err => res.status(500).json({message: 'error for put'}));
});


app.delete('/blog-posts/:id', (res, req) => {
	BlogPosts
	.findByIdAndRemove(req.params.id)
	,then(() => res.status(204).end())
	.catch(err => res.status(500).json(message: 'error in delete'));
});

let server;

function runServer(databaseUrl, port=PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, err => {
			if (err) {
				return reject(err);
			}

			server = app.listen(port, () => {
				console.log(`Your app is listening on port ${port}`);
				resolve();
			})
			.on('error', err => {
				mongoose.disconnect();
				reject(err);
			});
		});
	});
}


function closeServer() {
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			server.close(err => {
				if(err) {
					return reject(err);
				}
				resolve();
			});
		});
	});
}

if (require.main === module) {
	runServer(DATABASE_URL).catch(err => console.error(err));
};

module.exports = { runServer, app, closeServer };