
var months = ["maru", "bellust", "istari", "janusary", "amani", "concordium", "settember", "helios", "baldra", "vishnuber", "kalai", "ahrima", "nott", "midwinter"]
var gregMonths = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]

var globalYear = new Date().getFullYear()

var getStartYear = function(year){
    return(new Date("January 1," + year))
}

var isLeapYear = function(){
  return ((globalYear % 4 == 0) && (globalYear % 100 != 0)) || (globalYear % 400 == 0);
}

var prevMonth = function(event){
    var monthName = document.getElementById("monthName")
    var currentMonth = monthName.children[0].innerHTML
    var index = months.indexOf(currentMonth)
    if(index == 0){
        index = months.length
        globalYear--
    }
    index = index-1
    setMonth(months[index])
}

var nextMonth = function(event){
    var monthName = document.getElementById("monthName")
    var currentMonth = monthName.children[0].innerHTML
    var index = months.indexOf(currentMonth)
    if(index == months.length-1){
        index = -1
        globalYear++
    }
    index = index+1
    setMonth(months[index])
}

var setGurzDays = function(){
    while(document.getElementsByClassName("daynumber").length>0){
        document.getElementsByClassName("daynumber")[0].remove()
    }
    var startDay = getStartYear(globalYear).getDay()
    var month = document.getElementById("month")
    var count = 29-startDay
    var extraDays = -1
    for(var i=3; i<month.children.length; i++){
        var week = month.children[i]
        for(var j=0; j<week.children.length; j++){
            var day = week.children[j]
            var number = document.createElement("p")
            number.classList.add("daynumber")
            if(count==29){count=1; extraDays++} 
            number.innerHTML=count
            if(extraDays!=0){number.classList.add("extraDay")}
            // var currentGurzDate = greg2gurz(new Date())
            // var monthCheck = monthName.children[0].innerHTML
            // if(extraDays <0){monthCheck = normalizeIndices(months.indexOf(monthCheck)-1,months)}
            // if(extraDays >0){monthCheck = normalizeIndices(months.indexOf(monthCheck)+1,months)}
            // if(count == currentGurzDate[1] && currentGurzDate[0] == monthCheck && globalYear==new Date().getFullYear()){
            //     number.classList.add("currentDayNumber")
            // }
            count++
            if(monthName.children[0].innerHTML == "nott" && extraDays !=0 && count < 8){
                if(count > 2+isLeapYear()){
                    number.innerHTML=count-2-isLeapYear()
                }
            }
            if(monthName.children[0].innerHTML == "maru" && extraDays !=0 && count > 8){
                globalYear--
                if(count < 29-isLeapYear()){
                    number.innerHTML=count+isLeapYear()
                }
                else{
                    number.innerHTML=count-28+isLeapYear()
                }
                globalYear++
            }
            day.appendChild(number)
            if(monthName.children[0].innerHTML == "midwinter"){
                weekdays.children[j].classList = ["lastweek"]
            }
            if(monthName.children[0].innerHTML == "midwinter" && count>(2+isLeapYear())){
                day.classList.add("lastweek")
                continue
            }
            else{
                day.classList = ["day"]
                weekdays.children[j].classList = ["daylabel"]
            }

        }
        if(i>3 && monthName.children[0].innerHTML == "midwinter"){
            week.classList.add("lastweek")
            continue
        }
        if(i==month.children.length-1 && count == 8){
            week.classList.add("lastweek")
            continue
        }
        else{
            week.classList = ["week"]
        }
    }
}

var normalizeIndices = function(index, list){
    while(index < 0){
        index = index+list.length
    }
    while(index >= list.length){
        index = index-list.length
    }
    return list[index]
}

var setGregDays = function(){
    while(document.getElementsByClassName("gregorian").length>0){
        document.getElementsByClassName("gregorian")[0].remove()
    }
    var startDay = getStartYear(globalYear).getDay()
    var month = document.getElementById("month")
    var count = 29-startDay
    var extraDays = -1
    var monthIndex = months.indexOf(month.children[0].children[0].innerHTML)
    for(var i=3; i<month.children.length; i++){
        var week = month.children[i]
        for(var j=0; j<week.children.length; j++){
            var day = week.children[j]
            var gurzDay = parseInt(day.children[0].innerHTML)
            if(count==29){count=1; extraDays++} 
            var gregDate = gurz2greg(months[monthIndex + extraDays], gurzDay)
            var number = document.createElement("p")
            if(monthName.children[0].innerHTML == "nott" && extraDays !=0 && count < 8){
                if(count > 1+isLeapYear()){
                    gregDate.setDate(count-isLeapYear()-1)
                    gregDate.setMonth(0)
                }
            }
            if(monthName.children[0].innerHTML == "maru" && extraDays !=0 && count > 8){
                if(count < 29){
                    gregDate.setDate(count+3)
                }
            }
            var gregMonth = gregMonths[gregDate.getMonth()]
            number.innerHTML = gregMonth + " " + gregDate.getDate()
            number.classList.add("gregorian")
            if(extraDays!=0){number.classList.add("extraDay")}
            /*var currentGurzDate = greg2gurz(new Date())
            var monthCheck = monthName.children[0].innerHTML
            if(extraDays <0){monthCheck = normalizeIndices(months.indexOf(monthCheck)-1,months)}
            if(extraDays >0){monthCheck = normalizeIndices(months.indexOf(monthCheck)+1,months)}
            if(count == currentGurzDate[1] && currentGurzDate[0] == monthCheck && globalYear==new Date().getFullYear()){
                number.classList.add("currentDayNumber")
            }*/
            count++
            day.appendChild(number)
            var testYear = globalYear
            if(extraDays < 0 && monthName.children[0].innerHTML == "maru"){
                testYear = globalYear-1
            }
            if(extraDays > 0 && monthName.children[0].innerHTML == "nott" && new Date().getMonth()==0){
                testYear = globalYear+1
            }
            if(gregDate.getMonth() == new Date().getMonth() && gregDate.getDate() == new Date().getDate() && testYear == new Date().getFullYear()){
                number.classList.add("currentDayNumber")
                day.children[0].classList.add("currentDayNumber")
            }
        }
    }
}

var gurz2greg = function(monthString, day){
    var monthIndex = months.indexOf(monthString)
    var yearDays = monthIndex*28+day
    var gregDay = getStartYear(globalYear)
    gregDay.setDate(yearDays)
    return gregDay
}

var greg2gurz = function(gregDate){
    var yearDays = Math.ceil((gregDate.getTime() - getStartYear(gregDate.getFullYear()).getTime())/(1000*3600*24))
    var gurzMonth = months[Math.floor(yearDays/28)]
    var gurzDay = yearDays%28
    return [gurzMonth, gurzDay]
}

var setMonth = function(monthString){
    var currentMonth = monthName.children[0].innerHTML
    if(currentMonth == "n&Oacute;tt"){
        currentMonth = "nott"
    }
    monthName.children[0].innerHTML = monthString
    if(currentMonth != monthString){
        while(document.getElementsByClassName(currentMonth).length>0){
            var elem = document.getElementsByClassName(currentMonth)[0]
            elem.classList.remove(currentMonth)
            if(monthString == "n&Oacute;tt"){
                elem.classList.add("nott")
            }
            else{elem.classList.add(monthString)}
        }
    }
    setGurzDays()
    setGregDays()
    setDisplayYear()
}

var setDisplayYear = function(){
    displayYear.innerHTML = globalYear
}

var main = function(event){
    var lButton = document.getElementById("leftButton")
    var rButton = document.getElementById("rightButton")

    lButton.addEventListener("click", prevMonth)
    rButton.addEventListener("click", nextMonth)

    setMonth(greg2gurz(new Date())[0])
}

document.addEventListener("DOMContentLoaded", main)