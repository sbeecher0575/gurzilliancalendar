const fs = require('fs')
const seedrandom = require('seedrandom');
let DATA = {
	"WORDLENGTH": 5,
	"MAXATTEMPTS": 8
};

function initGuessWords(){
	fs.readFile('GDictionary.txt', 'utf8', (err,data) => {
		if(err){
			console.error(err)
			return []
		}
		var words = data.split("\n");
		for(var i=0;i<words.length;i++){
			words[i] = words[i].toUpperCase();
		}
		return words
	});
}

function initAnswerWords(){
	fs.readFile('ADictionary.txt', 'utf8', (err,data) => {
		if(err){
			console.error(err)
			return []
		}
		var words = data.split("\n");
		for(var i=0;i<words.length;i++){
			words[i] = words[i].toUpperCase();
		}
		return words
	});
}

function getRandomWords(count,wordList,seed){
	var rand = seedrandom();
	if(seed!=null){
		rand = seedrandom(seed);
	}
	let returnList = []
	while(returnList.length<count){
		let randomWord = wordList[~~(wordList.length*rand())];
		while(returnList.includes(randomWord)){
			randomWord = wordList[~~(wordList.length*rand())];
		}
		returnList.push(randomWord);
	}
	return returnList;
}

function isValid(word,wordList){
	let returnCode = 0;
	if(word.length>DATA.WORDLENGTH){
		returnCode = 3;
		word = word.substring(0,DATA.WORDLENGTH);
	}
	for(var i=0;i<word.length;i++){
		if(word[i].toUpperCase()==word[i].toLowerCase()){
			return 2;
		}
	}
	if(!wordList.includes(word.toUpperCase())){
		return 1;
	}
	return returnCode;
}

module.exports = {
	"ANSWERWORDS": [],
	"GUESSWORDS": [],
	"isValid": function(word){
		return isValid(word,this.GUESSWORDS);
	},
	
	"getRandomWords": function(count,seed){
		return getRandomWords(count,this.ANSWERWORDS,seed);
	},
	
	"initAW": function(){
		fs.readFile('ADictionary.txt', 'utf8', (err,data) => {
			if(err){
				console.error(err)
				return []
			}
			var words = data.split("\n");
			for(var i=0;i<words.length;i++){
				words[i] = words[i].toUpperCase();
			}
			this.ANSWERWORDS = words;
		});
	},
	
	"initGW": function(){
		fs.readFile('GDictionary.txt', 'utf8', (err,data) => {
			if(err){
				console.error(err)
				return []
			}
			var words = data.split("\n");
			for(var i=0;i<words.length;i++){
				words[i] = words[i].toUpperCase();
			}
			this.GUESSWORDS = words;
		});
	},
	
	"initAList": function(AList){
		this.ANSWERWORDS = AList;
	},
	
	"initGList": function(GList){
		this.GUESSWORDS = GList;
	},
	
	"initLists": function(AList,GList){
		this.initGW();
		this.initAW();
	}
};