DEFAULT_SPEED = 1000
var delay = function(time){
    return new Promise(resolve => setTimeout(resolve, time))
}
/**
 * story markdown
 * Text is written character by character at default speed
 * <SPEED>Text is written character by character at SPEED milliseconds per character</>
 * [TIME] waits for TIME milliseconds before continuing 
 */
var printText = async function(text,id){
    var text = text.split("");
    var i = 0;
    var textSpeed = DEFAULT_SPEED
    var inSpeed = 0
    speeds = []
    for(var i=0;i<text.length;i++){
        if(text[i]=="<" && inSpeed==0){
            inSpeed = 1
            //find integer before next ">"
            var speed = text.join("").slice(i+1,text.indexOf(">",i+1))
            if(speed.length>0){
                speeds.push(textSpeed)
                textSpeed = parseInt(speed)
            }
            i = text.indexOf(">",i+1)
        } else if(text[i]=="<"&&inSpeed==1){
            if(text[i+1]=="/" && text[i+2]==">"){
                if(speeds.length>1){
                    textSpeed = speeds.pop()
                    inSpeed = 1
                } else {
                    textSpeed = DEFAULT_SPEED
                    inSpeed = 0
                    speeds = []
                }
            } else {
                var speed = text.join("").slice(i+1,text.indexOf(">",i+1))
                if(speed.length>0){
                    speeds.push(textSpeed)
                    textSpeed = parseInt(speed)
                }
            }
            i = text.indexOf(">",i+1)
        } else if(text[i]=="["){
            var time = parseInt(text.join("").slice(i+1,text.indexOf("]",i+1)))
            await delay(time)
            i = text.indexOf("]",i+1)
        } else {
            document.getElementById(id).innerHTML = document.getElementById(id).innerHTML+text[i]
            await delay(textSpeed)
        }
    }
}

var main = async function(event,text){
    StoryBox = document.getElementById("StoryBox")
    var stories = text.split("NEWSTORY")
    for(story of stories){
        var paragraphs = story.split("\\p")
        var titleP = document.createElement("p")
        titleP.class = "title"
        titleP.id="title"+stories.indexOf(story)
        StoryBox.appendChild(titleP)
        var storyDiv = document.createElement("div")
        storyDiv.class = "story"
        storyDiv.id="story"+stories.indexOf(story)
        StoryBox.appendChild(storyDiv)
        await printText(paragraphs[0],titleP.id)
        for(var i=1;i<paragraphs.length;i++){
            var p = document.createElement("p")
            p.class="paragraph"
            p.id="p"+stories.indexOf(story)+"-"+i
            storyDiv.appendChild(p)
            await printText(paragraphs[i],p.id)
        }
    }
}

document.addEventListener("DOMContentLoaded", async function(ev){fetch('file.txt')
.then(response => response.text())
.then(text => main(ev,text))})