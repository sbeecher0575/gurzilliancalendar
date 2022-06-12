const express = require('express')
const exec = require('child_process')
const fs = require('fs')
const util = require('./wordUtil.js')
util.initLists();
const app = express()
const port = 3000
var files = {}

fs.readFile('files/StoryFile.md', 'utf8', (err,data) => {
	if(err){
		console.error(err)
		return []
	}
	files["story"] = data
});

app.use(express.static(__dirname + '/'));
app.get('/',(req,res)=>{
	res.setHeader('Access-Control-Allow-Origin','*')
	res.sendFile(__dirname + "/index.html",(err) => {
		if(err){
			console.log(err);
			res.end(err.message);
		}
	});
})

app.use(express.static(__dirname + '/qordle'));
app.get('/qordle/api', (req, res) => {
	res.setHeader('Access-Control-Allow-Origin','*')
	if(req.query.ask=="request"){
		debugger
		var randVals;
		if(!req.query.seed){
			randVals = util.getRandomWords(req.query.count,null);
		} else {
			randVals = util.getRandomWords(req.query.count,req.query.seed);
		}
		console.log(randVals)
		res.send(randVals)
	} else if(req.query.ask=="check"){
		debugger
		var dat = []
		dat.push(util.isValid(req.query.word))
		res.send(dat)
		console.log(dat)
	}
})
app.use(express.static(__dirname + '/qordle'));
app.get('/qordle',(req,res)=>{
	res.setHeader('Access-Control-Allow-Origin','*')
	res.sendFile(__dirname + "/qordle/index.html",(err) => {
		if(err){
			console.log(err);
			res.end(err.message);
		}
	});
})

app.use(express.static(__dirname + '/'));
app.get('/pull',(req,res)=>{
	res.setHeader('Access-Control-Allow-Origin','*')
	fs.readFile('key.txt', 'utf8', (err,data) => {
		if(data.trim()==req.query.pass){
			//run bash file pullAndReset.sh
			exec.execFileSync("pullAndReset.sh")
		}
	})
})

app.get('/date',(req,res)=>{
	res.setHeader('Access-Control-Allow-Origin','*')
	app.use(express.static(__dirname + '/dates/'+req.query.date));
	res.sendFile(__dirname + "/dates/"+req.query.date+"/index.html",(err) => {
		if(err){
			console.log(err);
			res.end(err.message);
		}
	});
})

app.use(express.static(__dirname + '/'));
app.get('/file',(req,res)=>{
	res.setHeader('Access-Control-Allow-Origin','*')
	if(req.query.file){
		res.send(files[req.query.file])
	}
	res.send(0)
})




app.use(express.static(__dirname + '/'));
app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})