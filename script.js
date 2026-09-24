/* =====================================================
   JARVIS 2
   MAIN JAVASCRIPT
===================================================== */


/* =====================================================
   CONFIGURATION
===================================================== */

const JARVIS_CONFIG = {

  name: "JARVIS 2",

  version: "2.0",

  /*
    Gemini/backend can be connected here later.

    Example:

    backendUrl:
      "https://YOUR-BACKEND-URL/exec"

  */

  backendUrl: "",

  language: "en-US"
};


/* =====================================================
   DOM
===================================================== */

const userInput =
  document.getElementById("userInput");

const sendButton =
  document.getElementById("sendButton");

const micButton =
  document.getElementById("micButton");

const stopButton =
  document.getElementById("stopButton");

const chatBox =
  document.getElementById("chatBox");

const thinkingText =
  document.getElementById("thinkingText");

const voiceSelect =
  document.getElementById("voiceSelect");

const speed =
  document.getElementById("speed");

const speedValue =
  document.getElementById("speedValue");

const voiceStatus =
  document.getElementById("voiceStatus");

const networkStatus =
  document.getElementById("networkStatus");

const memoryStatus =
  document.getElementById("memoryStatus");

const aiStatus =
  document.getElementById("aiStatus");

const aiStatus2 =
  document.getElementById("aiStatus2");

const footerTime =
  document.getElementById("footerTime");

const studyTimer =
  document.getElementById("studyTimer");

const startStudy =
  document.getElementById("startStudy");

const pauseStudy =
  document.getElementById("pauseStudy");

const resetStudy =
  document.getElementById("resetStudy");


/* =====================================================
   STATE
===================================================== */

let conversationHistory = [];

let voices = [];

let recognition = null;

let isListening = false;

let isSpeaking = false;


/* =====================================================
   STUDY TIMER STATE
===================================================== */

let studySeconds = 0;

let studyRunning = false;

let studyInterval = null;


/* =====================================================
   INITIALIZATION
===================================================== */

function initializeJarvis() {

  loadMemory();

  loadVoices();

  setupSpeechRecognition();

  setupEvents();

  updateNetworkStatus();

  updateClock();

  loadStudyTime();

  updateStudyDisplay();

  console.log("JARVIS 2 ONLINE");
}


/* =====================================================
   EVENTS
===================================================== */

function setupEvents() {

  sendButton.addEventListener(
    "click",
    sendMessage
  );


  userInput.addEventListener(
    "keydown",
    function(event) {

      if (event.key === "Enter") {

        event.preventDefault();

        sendMessage();

      }

    }
  );


  micButton.addEventListener(
    "click",
    toggleMicrophone
  );


  stopButton.addEventListener(
    "click",
    stopVoice
  );


  speed.addEventListener(
    "input",
    function() {

      speedValue.textContent =
        Number(speed.value).toFixed(2) + "x";

    }
  );


  startStudy.addEventListener(
    "click",
    startStudyTimer
  );


  pauseStudy.addEventListener(
    "click",
    pauseStudyTimer
  );


  resetStudy.addEventListener(
    "click",
    resetStudyTimer
  );

}


/* =====================================================
   CHAT
===================================================== */

function addMessage(sender, message) {

  const messageElement =
    document.createElement("div");

  messageElement.className =
    "message " +
    (
      sender === "USER"
        ? "user-message"
        : "jarvis-message"
    );


  const label =
    document.createElement("div");

  label.className =
    "message-label";

  label.textContent =
    sender;


  const content =
    document.createElement("div");

  content.textContent =
    message;


  messageElement.appendChild(label);

  messageElement.appendChild(content);

  chatBox.appendChild(messageElement);

  chatBox.scrollTop =
    chatBox.scrollHeight;
}


/* =====================================================
   THINKING
===================================================== */

function setThinking(message) {

  thinkingText.textContent =
    message;
}


/* =====================================================
   SEND MESSAGE
===================================================== */

async function sendMessage() {

  const message =
    userInput.value.trim();


  if (!message) {

    return;

  }


  userInput.value = "";


  addMessage(
    "USER",
    message
  );


  conversationHistory.push({

    role: "user",

    content: message

  });


  saveMemory();


  setThinking(
    "JARVIS is thinking..."
  );


  const response =
    await processCommand(message);


  addMessage(
    "JARVIS",
    response
  );


  conversationHistory.push({

    role: "assistant",

    content: response

  });


  saveMemory();


  setThinking(
    "JARVIS is ready."
  );


  speak(response);
}


/* =====================================================
   COMMAND PROCESSOR
===================================================== */

async function processCommand(message) {

  const text =
    message.toLowerCase().trim();


  /* -------------------------
     GREETING
  ------------------------- */

  if (
    text === "hello" ||
    text === "hi" ||
    text.includes("hello jarvis") ||
    text.includes("hi jarvis")
  ) {

    return "Hello. JARVIS 2 is online and ready.";

  }


  /* -------------------------
     IDENTITY
  ------------------------- */

  if (
    text.includes("who are you") ||
    text.includes("what are you")
  ) {

    return (
      "I am JARVIS 2, your personal AI assistant. " +
      "My system is being developed to help with study, " +
      "information, voice interaction and device control."
    );

  }


  /* -------------------------
     TIME
  ------------------------- */

  if (text.includes("time")) {

    return (
      "The current time is " +
      new Date().toLocaleTimeString()
    );

  }


  /* -------------------------
     DATE
  ------------------------- */

  if (
    text.includes("date") ||
    text.includes("today")
  ) {

    return (
      "Today is " +
      new Date().toLocaleDateString(
        undefined,
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        }
      )
    );

  }


  /* -------------------------
     STATUS
  ------------------------- */

  if (text.includes("status")) {

    return (
      "JARVIS 2 is online. " +
      "Voice system is ready. " +
      "Local memory is active. " +
      "The external AI backend is currently " +
      (
        JARVIS_CONFIG.backendUrl
          ? "connected."
          : "not connected yet."
      )
    );

  }


  /* -------------------------
     HELP
  ------------------------- */

  if (
    text === "help" ||
    text.includes("what can you do")
  ) {

    return (
      "I can currently respond to basic commands, " +
      "speak responses, listen through your microphone, " +
      "open supported websites, remember this browser session, " +
      "and track your study time. " +
      "Computer and phone control will require companion software."
    );

  }


  /* =================================================
     WEBSITE COMMANDS
  ================================================= */

  if (
    text.includes("open youtube")
  ) {

    openWebApp(
      "https://www.youtube.com"
    );

    return "Opening YouTube.";

  }


  if (
    text.includes("open gmail") ||
    text.includes("open mail")
  ) {

    openWebApp(
      "https://mail.google.com"
    );

    return "Opening Gmail.";

  }


  if (
    text.includes("open drive")
  ) {

    openWebApp(
      "https://drive.google.com"
    );

    return "Opening Google Drive.";

  }


  if (
    text.includes("open google")
  ) {

    openWebApp(
      "https://www.google.com"
    );

    return "Opening Google.";

  }


  if (
    text.includes("open docs")
  ) {

    openWebApp(
      "https://docs.google.com"
    );

    return "Opening Google Docs.";

  }


  if (
    text.includes("open calendar")
  ) {

    openWebApp(
      "https://calendar.google.com"
    );

    return "Opening Google Calendar.";

  }


  if (
    text.includes("open calculator")
  ) {

    openWebApp(
      "https://www.google.com/search?q=calculator"
    );

    return "Opening calculator.";

  }


  /* =================================================
     STUDY COMMANDS
  ================================================= */

  if (
    text.includes("start studying") ||
    text.includes("start study")
  ) {

    startStudyTimer();

    return "Study timer started.";

  }


  if (
    text.includes("stop studying") ||
    text.includes("pause study")
  ) {

    pauseStudyTimer();

    return "Study timer paused.";

  }


  if (
    text.includes("study time")
  ) {

    return (
      "Your study time today is " +
      formatStudyTime(studySeconds)
    );

  }


  /* =================================================
     SUBJECT RESPONSES
  ================================================= */

  if (
    text.includes("physics")
  ) {

    return (
      "Physics mode is ready. " +
      "Ask me a specific Physics question and I will help explain it."
    );

  }


  if (
    text.includes("chemistry")
  ) {

    return (
      "Chemistry mode is ready. " +
      "Give me the topic or question you want to study."
    );

  }


  if (
    text.includes("biology")
  ) {

    return (
      "Biology mode is ready. " +
      "Tell me the chapter or concept you want to study."
    );

  }


  if (
    text.includes("neet")
  ) {

    return (
      "NEET study mode is ready. " +
      "You can ask for explanations, practice questions, " +
      "revision help or chapter-based study assistance."
    );

  }


  /* =================================================
     EXTERNAL AI
  ================================================= */

  if (JARVIS_CONFIG.backendUrl) {

    try {

      return await askBackend(message);

    }

    catch (error) {

      console.error(error);

      return (
        "The external AI service could not be reached. " +
        "I am still available in local mode."
      );

    }

  }


  /* =================================================
     MATH
  ================================================= */

  if (
    looksLikeMath(text)
  ) {

    const answer =
      calculateSimpleMath(text);

    if (answer !== null) {

      return (
        "The calculated result is " +
        answer
      );

    }

  }


  /* =================================================
     DEFAULT
  ================================================= */

  return (
    "I received your message. " +
    "My external AI brain is not connected yet. " +
    "The next stage will connect JARVIS to the AI backend " +
    "so I can provide much more advanced answers."
  );

}


/* =====================================================
   BACKEND
===================================================== */

async function askBackend(message) {

  const response =
    await fetch(
      JARVIS_CONFIG.backendUrl,
      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          message: message,

          history: conversationHistory

        })

      }
    );


  if (!response.ok) {

    throw new Error(
      "Backend error: " +
      response.status
    );

  }


  const data =
    await response.json();


  return (
    data.reply ||
    data.response ||
    "The AI returned no response."
  );

}


/* =====================================================
   MATH
===================================================== */

function looksLikeMath(text) {

  return (
    /^[0-9+\-*/().%\s]+$/.test(text)
  );

}


function calculateSimpleMath(text) {

  try {

    if (!looksLikeMath(text)) {

      return null;

    }


    const result =
      Function(
        '"use strict"; return (' +
        text +
        ')'
      )();


    if (
      typeof result === "number" &&
      Number.isFinite(result)
    ) {

      return result;

    }

  }

  catch (error) {

    return null;

  }


  return null;

}


/* =====================================================
   OPEN WEB APP
===================================================== */

function openWebApp(url) {

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );

}


/* =====================================================
   VOICE OUTPUT
===================================================== */

function loadVoices() {

  voices =
    window.speechSynthesis.getVoices();


  voiceSelect.innerHTML =
    '<option value="">Default voice</option>';


  voices.forEach(
    (voice, index) => {

      const option =
        document.createElement("option");

      option.value =
        index;

      option.textContent =
        voice.name +
        " — " +
        voice.lang;

      voiceSelect.appendChild(
        option
      );

    }
  );

}


window.speechSynthesis.onvoiceschanged =
  loadVoices;


function speak(text) {

  if (
    !("speechSynthesis" in window)
  ) {

    voiceStatus.textContent =
      "UNAVAILABLE";

    return;

  }


  stopVoice();


  const utterance =
    new SpeechSynthesisUtterance(text);


  utterance.rate =
    Number(speed.value);


  utterance.pitch =
    0.85;


  utterance.lang =
    JARVIS_CONFIG.language;


  const selected =
    voiceSelect.value;


  if (selected !== "") {

    utterance.voice =
      voices[Number(selected)];

  }


  utterance.onstart =
    function() {

      isSpeaking = true;

      voiceStatus.textContent =
        "SPEAKING";

    };


  utterance.onend =
    function() {

      isSpeaking = false;

      voiceStatus.textContent =
        "READY";

    };


  utterance.onerror =
    function() {

      isSpeaking = false;

      voiceStatus.textContent =
        "READY";

    };


  window.speechSynthesis.speak(
    utterance
  );

}


function stopVoice() {

  if (
    "speechSynthesis" in window
  ) {

    window.speechSynthesis.cancel();

  }


  isSpeaking = false;

  voiceStatus.textContent =
    "READY";

}


/* =====================================================
   SPEECH RECOGNITION
===================================================== */

function setupSpeechRecognition() {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!SpeechRecognition) {

    voiceStatus.textContent =
      "NOT SUPPORTED";

    micButton.disabled =
      true;

    return;

  }


  recognition =
    new SpeechRecognition();


  recognition.lang =
    JARVIS_CONFIG.language;


  recognition.continuous =
    false;


  recognition.interimResults =
    true;


  recognition.onstart =
    function() {

      isListening = true;

      micButton.textContent =
        "🔴";

      voiceStatus.textContent =
        "LISTENING";

      setThinking(
        "Listening..."
      );

    };


  recognition.onresult =
    function(event) {

      let finalText = "";


      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {

        const transcript =
          event.results[i][0].transcript;


        if (
          event.results[i].isFinal
        ) {

          finalText += transcript;

        }

      }


      if (finalText.trim()) {

        userInput.value =
          finalText.trim();

        sendMessage();

      }

    };


  recognition.onerror =
    function(error) {

      console.error(
        "Speech recognition error:",
        error
      );

      setThinking(
        "Microphone error."
      );

    };


  recognition.onend =
    function() {

      isListening = false;

      micButton.textContent =
        "🎙";

      voiceStatus.textContent =
        "READY";

    };

}


function toggleMicrophone() {

  if (!recognition) {

    return;

  }


  if (isListening) {

    recognition.stop();

  }
  else {

    try {

      recognition.start();

    }

    catch (error) {

      console.error(error);

    }

  }

}


/* =====================================================
   MEMORY
===================================================== */

function saveMemory() {

  try {

    localStorage.setItem(
      "jarvisConversation",
      JSON.stringify(
        conversationHistory.slice(-50)
      )
    );

    memoryStatus.textContent =
      "ACTIVE";

  }

  catch (error) {

    memoryStatus.textContent =
      "ERROR";

  }

}


function loadMemory() {

  try {

    const saved =
      localStorage.getItem(
        "jarvisConversation"
      );


    if (saved) {

      conversationHistory =
        JSON.parse(saved);

    }

  }

  catch (error) {

    conversationHistory = [];

  }

}


/* =====================================================
   NETWORK
===================================================== */

function updateNetworkStatus() {

  if (navigator.onLine) {

    networkStatus.textContent =
      "ONLINE";

  }
  else {

    networkStatus.textContent =
      "OFFLINE";

  }


  if (JARVIS_CONFIG.backendUrl) {

    aiStatus.textContent =
      "BACKEND";

    aiStatus2.textContent =
      "BACKEND";

  }
  else {

    aiStatus.textContent =
      "LOCAL";

    aiStatus2.textContent =
      "LOCAL";

  }

}


window.addEventListener(
  "online",
  updateNetworkStatus
);


window.addEventListener(
  "offline",
  updateNetworkStatus
);


/* =====================================================
   CLOCK
===================================================== */

function updateClock() {

  const now =
    new Date();


  footerTime.textContent =
    now.toLocaleTimeString();


  setTimeout(
    updateClock,
    1000
  );

}


/* =====================================================
   STUDY TIMER
===================================================== */

function startStudyTimer() {

  if (studyRunning) {

    return;

  }


  studyRunning = true;


  studyInterval =
    setInterval(
      function() {

        studySeconds++;

        updateStudyDisplay();

        saveStudyTime();

      },
      1000
    );


  setThinking(
    "Study session running."
  );

}


function pauseStudyTimer() {

  studyRunning = false;


  clearInterval(
    studyInterval
  );


  studyInterval =
    null;


  saveStudyTime();


  setThinking(
    "Study session paused."
  );

}


function resetStudyTimer() {

  pauseStudyTimer();


  studySeconds = 0;


  updateStudyDisplay();

  saveStudyTime();


  setThinking(
    "Study timer reset."
  );

}


function updateStudyDisplay() {

  studyTimer.textContent =
    formatStudyTime(
      studySeconds
    );

}


function formatStudyTime(totalSeconds) {

  const hours =
    Math.floor(
      totalSeconds / 3600
    );


  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60
    );


  const seconds =
    totalSeconds % 60;


  return (
    String(hours).padStart(2, "0") +
    ":" +
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0")
  );

}


function saveStudyTime() {

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);


  localStorage.setItem(
    "jarvisStudyDate",
    today
  );


  localStorage.setItem(
    "jarvisStudySeconds",
    studySeconds
  );

}


function loadStudyTime() {

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);


  const savedDate =
    localStorage.getItem(
      "jarvisStudyDate"
    );


  if (savedDate === today) {

    studySeconds =
      Number(
        localStorage.getItem(
          "jarvisStudySeconds"
        )
      ) || 0;

  }
  else {

    studySeconds = 0;

  }

}


/* =====================================================
   GLOBAL FUNCTIONS
===================================================== */

window.openWebApp =
  openWebApp;

window.sendMessage =
  sendMessage;

window.stopVoice =
  stopVoice;


/* =====================================================
   START JARVIS
===================================================== */

initializeJarvis();