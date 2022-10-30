DEFAULT_SPEED = 50
STORIES_PRINTED = 0
CURRENT_COLOR = "J"
DONEDONE = false
SKP = false
NEXT_STORY = false
function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

var delay = function(time){
    return new Promise(resolve => setTimeout(resolve, time))
}

var moveTagToEnd = function(tag, str){
    var n = str.lastIndexOf(tag)
    return str.substring(0,n) + str.substring(n+tag.length,str.length)+tag
}
/**
 * story markdown
 * Text is written character by character at default speed
 * <SPEED>Text is written character by character at SPEED milliseconds per character</>
 * [TIME] waits for TIME milliseconds before continuing
 * {C} changes color to C's color 
 */
var printText = async function(text,id,instant){
    var textBox = document.getElementById(id)
    var i = 0;
    var textSpeed = DEFAULT_SPEED
    var inSpeed = 0
    speeds = []
    textBox.innerHTML = textBox.innerHTML + "<span class='text"+CURRENT_COLOR+"'>"
    for(var i=0;i<text.length;i++){
        if(SKP || NEXT_STORY){
            break
        }
        if(text[i]=="{"){
            var person = text.substring(i+1, text.indexOf('}',i))
            i=text.indexOf('}',i)
            CURRENT_COLOR=person
            var n = textBox.innerHTML.lastIndexOf("</span>")
            textBox.innerHTML = moveTagToEnd("</span>",textBox.innerHTML)+"<span class='text"+person+"'>"
        } else if(text[i]=="<"){
            var contents = text.slice(i+1,text.indexOf(">",i+1))
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
                } else if(text[i+1]=="/"){
                    textBox.innerHTML = moveTagToEnd(text.substring(i,text.indexOf(">",i+1)+1),textBox.innerHTML)
                } else {
                    textBox.innerHTML = moveTagToEnd("</span>",textBox.innerHTML+text.slice(i,text.indexOf(">",i+1)+1))
                }
            }
            i = text.indexOf(">",i+1)
        } else if(text[i]=="["){
            var time = parseInt(text.slice(i+1,text.indexOf("]",i+1)))
            if(!instant){
                await delay(time)
            }
            i = text.indexOf("]",i+1)
        } else if(text[i]==">"){
            textBox.innerHTML = moveTagToEnd("</span>",textBox.innerHTML+"&gt;")
            if(!instant){
                await delay(textSpeed)
            }
        } else if(text[i]=="\\" && text[i+1]=="["){
            textBox.innerHTML = moveTagToEnd("</span>",textBox.innerHTML+"[")
            i++
            if(!instant){
                await delay(textSpeed)
            }
        } else {
            textBox.innerHTML = moveTagToEnd("</span>",textBox.innerHTML+text[i])
            if(!instant){
                await delay(textSpeed)
            }
        }
    }
    textBox.innerHTML = moveTagToEnd("</span>",textBox.innerHTML)
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
    await printText(paragraphs[0],titleP.id,false)
    if(SKP || NEXT_STORY){
        return
    }
    for(var i=1;i<paragraphs.length;i++){
        var p = document.createElement("p")
        p.classList.add("paragraph")
        p.id="p"+stories.indexOf(story)+"-"+i
        storyDiv.appendChild(p)
        if(SKP || NEXT_STORY){
            return
        }
        await printText(paragraphs[i],p.id,false)
        if(SKP || NEXT_STORY){
            return
        }
    }
}

var storyLoop = async function(stories){
    while(true){
        label.innerHTML = ""+(STORIES_PRINTED+1)+"/"+stories.length
        NEXT_STORY = false
        clearStories()
        await writeStory(stories)
        if(SKP){
            SKP = false
            NEXT_STORY = false
            clearStories()
            fillStory(stories,STORIES_PRINTED)
            DONEDONE = true
            break
        } else if(!NEXT_STORY){
            DONEDONE = true
            break
        }
    }
}

var main = async function(event,text){
    var label = document.getElementById("label")
    var stories = text.split("NEWSTORY")
    label.innerHTML = ""+(STORIES_PRINTED+1)+"/"+stories.length
    var btn = document.getElementById("skipButton")
    btn.addEventListener("click", function(event){
        if(!DONEDONE){
            SKP = true
        }
    })
    var rightBtn = document.getElementById("rightButton")
    rightBtn.addEventListener("click", async function(event){
        STORIES_PRINTED = STORIES_PRINTED + 1
        if(STORIES_PRINTED==stories.length){
            STORIES_PRINTED = stories.length-1
        }
        if(DONEDONE){
            DONEDONE = false
            await storyLoop(stories)
        } else {
            NEXT_STORY = true
        }
    })
    var leftBtn = document.getElementById("leftButton")
    leftBtn.addEventListener("click", async function(event){
        STORIES_PRINTED = STORIES_PRINTED - 1
        if(STORIES_PRINTED<0){
            STORIES_PRINTED = 0
        }
        if(DONEDONE){
            DONEDONE = false
            await storyLoop(stories)
        } else {
            NEXT_STORY = true
        }
    })
    var StoryBox = document.getElementById("storyBox")
    await storyLoop(stories)
}

document.addEventListener("DOMContentLoaded", async function(ev){fetch(new Request('http://localhost:3000/file?file=story2'))
.then(response => response.text())
.then(text => main(ev,text))})
