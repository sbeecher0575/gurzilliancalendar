DEFAULT_SPEED = 50
RST = false
STORIES_PRINTED = 0
PREV_STORY = 0
CURRENT_COLOR = "J"
DONE_PRINTING = false
DONEDONE = false
SKP = false
function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

var delay = function(time){
    return new Promise(resolve => setTimeout(resolve, time))
}

var moveSpanToEnd = function(str){
    var n = str.lastIndexOf("</span>")
    return str.substring(0,n) + str.substring(n+7,str.length)+"</span>"
}
/**
 * story markdown
 * Text is written character by character at default speed
 * <SPEED>Text is written character by character at SPEED milliseconds per character</>
 * [TIME] waits for TIME milliseconds before continuing
 * {C} changes color to C's color 
 */
var printText = async function(text,id,instant=false){
    var textBox = document.getElementById(id)
    var text = text.split("");
    var i = 0;
    var textSpeed = DEFAULT_SPEED
    var inSpeed = 0
    speeds = []
    textBox.innerHTML = textBox.innerHTML + "<span class='text"+CURRENT_COLOR+"'>"
    for(var i=0;i<text.length;i++){
        if(RST){
            break
        }
        if(text[i]=="{"){
            var person = text[i+1]
            i=i+2
            CURRENT_COLOR=person
            var n = textBox.innerHTML.lastIndexOf("</span>")
            textBox.innerHTML = moveSpanToEnd(textBox.innerHTML)+"<span class='text"+person+"'>"
        } else if(text[i]=="<"){
            var contents = text.join("").slice(i+1,text.indexOf(">",i+1))
            if(isNumeric(contents)){
                inSpeed = 1
                speeds.push(textSpeed)
                textSpeed = parseInt(contents)
            } else {
                if(text[i+1]=="/" && text[i+2]==">"){
                    if(speeds.length>1){
                        textSpeed = speeds.pop()
                        inSpeed = 1
                    } else {
                        textSpeed = DEFAULT_SPEED
                        inSpeed = 0
                        speeds = []
                    }
                }
                else{
                    textBox.innerHTML = textBox.innerHTML+text.join("").slice(i,text.indexOf(">",i+1))
                }
            }
            i = text.indexOf(">",i+1)
        } else if(text[i]=="["){
            var time = parseInt(text.join("").slice(i+1,text.indexOf("]",i+1)))
            if(!instant){
                await delay(time)
            }
            i = text.indexOf("]",i+1)
        } else if(text[i]==">"){
            textBox.innerHTML = moveSpanToEnd(textBox.innerHTML+"&gt;")
            if(!instant){
                await delay(textSpeed)
            }
        } else {
            textBox.innerHTML = moveSpanToEnd(textBox.innerHTML+text[i])
            if(!instant){
                await delay(textSpeed)
            }
        }
    }
    textBox.innerHTML = moveSpanToEnd(textBox.innerHTML)
}

var stripMarkdown = function(text){
    var text = text.replace(/\[.*\]/g,"")
    var text = text.replace(/<[0-9]*>/g,"")
    var text = text.replace(/<\\>/g,"")
    return text
}

var clearStories = function(){
    var StoryBox = document.getElementById("storyBox")
    while(StoryBox.firstChild){
        StoryBox.removeChild(StoryBox.firstChild)
    }
}

var fillStory = async function(stories,index){
    var StoryBox = document.getElementById("storyBox")
    var story = stories[index]
    var paragraphs = story.split("\\p")
    var titleP = document.createElement("p")
    titleP.classList.add("title")
    titleP.id="title"+index
    StoryBox.appendChild(titleP)
    var storyDiv = document.createElement("div")
    storyDiv.classList.add("story")
    storyDiv.id="story"+index
    StoryBox.appendChild(storyDiv)
    await printText(paragraphs[0],titleP.id,true)
    for(var i=1;i<paragraphs.length;i++){
        var p = document.createElement("p")
        p.classList.add("paragraph")
        p.id="p"+index+"-"+i
        storyDiv.appendChild(p)
        await printText(paragraphs[i],p.id,true)
    }
}

var writeStory = async function(stories){
    var StoryBox = document.getElementById("storyBox")
    if(DONE_PRINTING){
        RST = false
        await fillStory(stories,STORIES_PRINTED)
    } else {
        var story = stories[STORIES_PRINTED]
        var paragraphs = story.split("\\p")
        var titleP = document.createElement("p")
        titleP.classList.add("title")
        titleP.id="title"+stories.indexOf(story)
        StoryBox.appendChild(titleP)
        var storyDiv = document.createElement("div")
        storyDiv.classList.add("story")
        storyDiv.id="story"+stories.indexOf(story)
        StoryBox.appendChild(storyDiv)
        await printText(paragraphs[0],titleP.id)
        for(var i=1;i<paragraphs.length;i++){
            var p = document.createElement("p")
            p.classList.add("paragraph")
            p.id="p"+stories.indexOf(story)+"-"+i
            storyDiv.appendChild(p)
            if(RST){
                clearStories()
                break
            }
            await printText(paragraphs[i],p.id)
            if(RST){
                clearStories()
                break
            }
        }
        //If skipping, but not if moving to the next story
        if(SKP){
            DONE_PRINTING = true
            SKP = false
        }
    }
    if(RST){//if skipping, done_printing should be true. //if moving to the next story, done_printing should be false
        RST = false
        writeStory(stories)
    }
}

var main = async function(event,text){
    var stories = text.split("NEWSTORY")
    var btn = document.getElementById("skipButton")
    var goAgain = true
    btn.addEventListener("click", function(event){
        if(!DONEDONE){
            clearStories()
            RST = true
            SKP = true
        }
    })
    var rightBtn = document.getElementById("rightButton")
    rightBtn.addEventListener("click", async function(event){
        clearStories()
        STORIES_PRINTED = STORIES_PRINTED + 1
        if(STORIES_PRINTED==stories.length){
            STORIES_PRINTED = stories.length-1
        }
        if(!DONEDONE){
            RST = true
        } else {
            DONE_PRINTING = false
            DONEDONE = false
            goAgain = true
            while(goAgain){
                goAgain = false
                clearStories()
                PREV_STORY = STORIES_PRINTED
                await writeStory(stories)
                if(STORIES_PRINTED==PREV_STORY){
                    goAgain = false
                }
            }
            DONEDONE = true
        }
    })
    var leftBtn = document.getElementById("leftButton")
    leftBtn.addEventListener("click", async function(event){
        clearStories()
        STORIES_PRINTED = STORIES_PRINTED - 1
        if(STORIES_PRINTED<0){
            STORIES_PRINTED = 0
        }
        if(!DONEDONE){
            RST = true
        } else {
            DONE_PRINTING = false
            DONEDONE = false
            goAgain = true
            while(goAgain){
                goAgain = false
                clearStories()
                PREV_STORY = STORIES_PRINTED
                await writeStory(stories)
                if(STORIES_PRINTED==PREV_STORY){
                    goAgain = false
                }
            }
            DONEDONE = true
        }
    })
    var StoryBox = document.getElementById("storyBox")
    while(goAgain){
        goAgain = false
        clearStories()
        PREV_STORY = STORIES_PRINTED
        await writeStory(stories)
        if(STORIES_PRINTED!=PREV_STORY){
            PREV_STORY = STORIES_PRINTED
            goAgain = true
        }
    }
    DONEDONE = true
}

document.addEventListener("DOMContentLoaded", async function(ev){fetch(new Request('http://gurzilliancalendar.org/file?file=story'))
.then(response => response.text())
.then(text => main(ev,text))})
