const url = chrome.runtime.getURL("data/quran-simple.xml");
const translations =["none", "data/en.arberry.xml", "data/en.pickthall.xml", "data/en.qarai.xml", "data/en.sahih.xml", "data/en.shakir.xml", "data/en.yusufali.xml"];

chrome.runtime.onMessage.addListener(function (msg,sender){
  if (msg.from == "popup"){
    console.log(msg.t);
    //fetch the file and parse it so that we can use it
    if(msg.t) {
      translationNames = ["none", "arberry", "pickthall", "qarai", "sahih", "shakir", "yusufali"];
      console.log("We here");
      $.post('https://peaceful-castle-53409.herokuapp.com/handler.php', {chapter:msg.ch, verse:msg.v, translation:true, tname:translationNames[msg.t]});
    } else {
      $.post('https://peaceful-castle-53409.herokuapp.com/handler.php', {chapter:msg.ch, verse:msg.v, translation:false });
    }
    fetch(url)
    .then(response => response.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        //Once XML has been parsed, send it to findVerse for extraction
        .then(data => findVerse(data))

    function findVerse(data){
      //Retrieve the relevant verse from the xml file
      var y = data.getElementsByTagName("sura")[msg.ch-1].getAttribute("name");
      var verseText = data.getElementsByTagName("sura")[msg.ch-1].getElementsByTagName("aya")[msg.v-1].getAttribute("text");
      console.log(y);
      console.log(verseText);

      if (msg.t>0){
        fetch(chrome.runtime.getURL(translations[msg.t]))
          .then(response => response.text())
            .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
              .then(data => findTranslation(data, verseText))
      }

       else {
      chrome.runtime.sendMessage({from: "event", v:verseText, t:"", chapterNumber:msg.ch, verseNumber:msg.v})
      //relay the information back to popup
      }
    }
    function findTranslation(data, verseText){
      var z = data.getElementsByTagName("sura")[msg.ch-1].getAttribute("name");
      var translated = data.getElementsByTagName("sura")[msg.ch-1].getElementsByTagName("aya")[msg.v-1].getAttribute("text");
      chrome.runtime.sendMessage({from: "event", v:verseText, t:translated, chapterNumber:msg.ch, verseNumber:msg.v})
    }
    }
  }
);
