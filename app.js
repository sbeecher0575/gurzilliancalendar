const express = require('express')
const fs = require('fs')
const app = express()
const port = 3000

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
app.use(express.static(__dirname + '/'));
app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})