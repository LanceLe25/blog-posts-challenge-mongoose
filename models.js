const mongoose require('mongoose');

const blogPostsSchema =m mongoose.Schema({
	title: {type: String, required: true},
	content: {type: String},
	created: {type: Date},
	author: {
		firstName: String,
		lastName: String,
	}
});

blogPostsSchema.virtual('authorName').get(function() {
	return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogPostsSchema.methods.serialize = function () {
	return {
		id: this._id,
		author: this.authorName,
		content: this.content,
		title: this.title,
		created: this.created
	};
};

const BlogPosts = mongoose.model('BlogPosts', blogPostsSchema);

module.exports = { BlogPosts };