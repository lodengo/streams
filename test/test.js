var streams = require('../index');

function test1() {
	var input = new streams.ObjectStream([ 1, 2, 3 ]);
	input.pipe(new streams.JsonStringify(true)).pipe(process.stdout);
}

function test2() {
	var input = new streams.ObjectStream({
		name : 'a',
		type : 1
	});
	input.pipe(new streams.JsonStringify(false)).pipe(process.stdout);
}

function test3() {
	var input = new streams.ObjectStream([ 1, 2, 3 ]);

	var add1 = new streams.Transformer(function(obj, done) {
		done(null, obj + 1);
	});

	var copy = new streams.Transformer(function(obj, done) {
		this.push(obj);
		this.push(obj);
		done();
		// done(null, obj);
	});

	input.pipe(copy).pipe(new streams.JsonStringify(true)).pipe(process.stdout);
}

function test4() {
	var MongoClient = require('mongodb').MongoClient;	
	
	function Finder(find) {
		return new streams.Transformer(function(input, done) {
			var self = this;
			find(input).each(function(err, doc) {
				null == doc ? done() : self.push(doc);
			});
		});
	};
	
	MongoClient.connect('mongodb://192.168.107.242:27017/cost', function(err, db) {		
		var input = new streams.ObjectStream({
			date : '2014-01-09'
		});

		var fileQuery = function(input) {
			return db.collection('cost').find({
				Type : 'file',
				FileDate : input.date
			}, {
				limit : 2,
				fields : {
					ProjectName : 1
				}
			});
		};

		var qdQuery = function(f) {
			return db.collection('cost').find({
				Type : '清单',
				fileId : f._id
			}, {
				fields : {
					Price : 1,
					Name : 1
				}
			});
		};

		input.pipe(Finder(fileQuery)).pipe(Finder(qdQuery)).pipe(
				new streams.JsonStringify(true)).pipe(process.stdout);

	});
}

 test3();
// test2();
// test3();
