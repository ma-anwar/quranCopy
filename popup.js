function getInput() {
  //collect input from the form and send to eventPage
  var chapter = $("#chapter").val();
  var verse = $("#verse").val();
  if ($("#checkbox").is(":checked")){
    chrome.storage.sync.set({"useTranslation":true});
     var translation = $("#translations").val();
    chrome.storage.sync.set({"nameOfTranslation":translation});
  } else {
    chrome.storage.sync.set({"useTranslation":false});
  }
  chrome.runtime.sendMessage({from: "popup", ch:chapter, v:verse, t:translation});
}

function inputCheck () {
  //Validate input, remove previous output if valid and initiate new output
  //Array ordered by chapters
  var chapterLength = [0, 7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111,
     43, 52, 99, 128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34,
     30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45,
   60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44,
    28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20,
     15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6];
  if ($("#chapter").val() > 0 && $("#chapter").val() < 115) {
    if ($("#verse").val() > 0  && $("#verse").val() <= chapterLength[$("#chapter").val()]) {
      //Remove previous results then getInput()
      $("#heading, #resulttxt, #cpybtn").remove();
      getInput();
    }
  }
}

function timer (timeLength) {
  //Call inputCheck after passed interval
  if(timeout) {
    clearTimeout(timeout);
  }
  timeout=setTimeout(inputCheck, timeLength);
}


window.onload=function(){
  //Init timeout for event handlers & timer
  timeout=null;
  chrome.storage.sync.get("nameOfTranslation", function (obj) {
    $("#translations").prop("value", obj.nameOfTranslation);
  })
  //Manage enabling/disabling select option according to checkbox state
  chrome.storage.sync.get("useTranslation", function (dict) {
    if (dict.useTranslation) {
      $("#checkbox").prop("checked", true);
    }
     else {
      $("#checkbox").prop("checked", false);
      $("#translations").prop("disabled", true);
    }
  });

  //Change select state based on checkbox state
  $("#checkbox").change(function() {
    if($("#checkbox").is(":checked")) {
        $("#translations").prop("disabled", false);
      }     else {
      $("#translations").prop("disabled", true);
    }
  })

  //Listeners for input
  $("#frm").on("keyup", function () {
    timer(450);
  });
  $("#checkbox, #translations").on("change", function() {
    timer(100);
  });

chrome.runtime.onMessage.addListener(function (msg, sender) {
  if (msg.from == "event") {

    //Append results of xml query to the popup
    if(msg.t){
      x = $("#result").append("<span id='heading'>Verse "+msg.chapterNumber+":"+msg.verseNumber+ "<br></span><div id='resulttxt'>"+msg.v+"<br>"+msg.t+" ["+msg.chapterNumber+":"+msg.verseNumber+"]</div>").fadeIn("slow");
    } else {
      x = $("#result").append("<span id='heading'>Verse "+msg.chapterNumber+":"+msg.verseNumber+"<br></span><div id='resulttxt'><p id='arabicText'>"+msg.v+"</p> ["+msg.chapterNumber+":"+msg.verseNumber+"]</div>").fadeIn("slow");
  }
    //Create a copy "button" and introduce functionality to copy the verse to clipboard upon clicking
    $("#result").append("<div id='cpybtn'><a>Copy</a></div>");
    $("#cpybtn").click(function () {
      var $temp = $("<textarea>");
      $("main").append($temp);
      if(msg.t){
        $temp.val(msg.v+"\n"+msg.t+" ["+msg.chapterNumber+":"+msg.verseNumber+"]").select();
      } else{
        $temp.val(msg.v+" ["+msg.chapterNumber+":"+msg.verseNumber+"]").select();
      }
      document.execCommand("copy");
      $temp.remove();
      //Animate copy action
      $("#cpybtn").css({"color":"#838d9e"});
      $("#resulttxt").css({"border-style": "inset"});
      setTimeout(function () {
        $("#resulttxt").css({"border-style": "solid"});
      }, 80);
    });
  }
})

}
