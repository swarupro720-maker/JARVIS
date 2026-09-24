/* =====================================================
   JARVIS 2
   AI + VOICE + MEMORY + STUDY MANAGER
===================================================== */


/* =====================================================
   CONFIGURATION
===================================================== */

const JARVIS_CONFIG = {

  name: "JARVIS 2",

  version: "2.0",

  backendUrl:
    "https://script.google.com/macros/s/AKfycbxokIIF58cvABj-3oXI7GD6jkGH05R3eAkaD4o3TcJ__iS7nzCzQJWivcfc_WqUuGhD/exec",

  language: "en-US"

};


/* =====================================================
   DOM ELEMENTS
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
   STUDY TIMER
===================================================== */

let studySeconds = 0;

let studyRunning = false;

let studyInterval = null;


/* =====================================================
   INITIALIZE
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

  console.log(
    "JARVIS 2 ONLINE"
  );

}


/* =====================================================
   EVENTS
===================================================== */

function setupEvents() {

  if (sendButton) {

    sendButton.addEventListener(
      "click",
      sendMessage
    );

  }


  if (userInput) {

    userInput.addEventListener(
      "keydown",
      function(event) {

        if (event.key === "Enter") {

          event.preventDefault();

          sendMessage();

        }

      }
    );

  }


  if (micButton) {

    micButton.addEventListener(
      "click",
      toggleMicrophone
    );

  }


  if (stopButton) {

    stopButton.addEventListener(
      "click",
      stopVoice
    );

  }


  if (speed) {

    speed.addEventListener(
      "input",
      function() {

        speedValue.textContent =
          Number(speed.value).toFixed(2) +
          "x";

      }
    );

  }


  if (startStudy) {

    startStudy.addEventListener(
      "click",
      startStudyTimer
    );

  }


  if (pauseStudy) {

    pauseStudy.addEventListener(
      "click",
      pauseStudyTimer
    );

  }


  if (resetStudy) {

    resetStudy.addEventListener(
      "click",
      resetStudyTimer
    );

  }

}


/* =====================================================
   CHAT MESSAGE
===================================================== */

function addMessage(
  sender,
  message
) {

  if (!chatBox) {
    return;
  }


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


  messageElement.appendChild(
    label
  );


  messageElement.appendChild(
    content
  );


  chatBox.appendChild(
    messageElement
  );


  chatBox.scrollTop =
    chatBox.scrollHeight;

}


/* =====================================================
   THINKING STATUS
===================================================== */

function setThinking(
  message
) {

  if (thinkingText) {

    thinkingText.textContent =
      message;

  }

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


  try {

    const response =
      await processCommand(
        message
      );


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

  catch (error) {

    console.error(
      "JARVIS ERROR:",
      error
    );


    const errorMessage =
      "I encountered an error while processing that request. " +
      "Please check the AI backend connection.";


    addMessage(
      "JARVIS",
      errorMessage
    );


    setThinking(
      "Connection error."
    );


    speak(
      errorMessage
    );

  }

}


/* =====================================================
   COMMAND PROCESSOR
===================================================== */

async function processCommand(
  message
) {

  const text =
    message
      .toLowerCase()
      .trim();


  /* =================================================
     BASIC COMMANDS
  ================================================= */


  if (
    text === "hello" ||
    text === "hi" ||
    text.includes("hello jarvis") ||
    text.includes("hi jarvis")
  ) {

    return (
      "Hello. JARVIS 2 is online and ready."
    );

  }


  if (
    text.includes("who are you") ||
    text.includes("what are you")
  ) {

    return (
      "I am JARVIS 2, your personal AI assistant. " +
      "My AI brain is connected to the Gemini backend."
    );

  }


  /* =================================================
     TIME
  ================================================= */

  if (
    text === "time" ||
    text.includes("what time") ||
    text.includes("current time")
  ) {

    return (
      "The current time is " +
      new Date().toLocaleTimeString()
    );

  }


  /* =================================================
     DATE
  ================================================= */

  if (
    text.includes("what date") ||
    text === "date" ||
    text.includes("today's date")
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


  /* =================================================
     STATUS
  ================================================= */

  if (
    text.includes("status")
  ) {

    return (
      "JARVIS 2 is online. " +
      "The Gemini AI backend is configured. " +
      "Voice input, voice output and local memory are available."
    );

  }


  /* =================================================
     HELP
  ================================================= */

  if (
    text === "help" ||
    text.includes("what can you do")
  ) {

    return (
      "I can answer questions using my AI backend, " +
      "speak responses, listen through your microphone, " +
      "open supported websites, remember conversations " +
      "and track your study time."
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
    text.includes("open meet")
  ) {

    openWebApp(
      "https://meet.google.com"
    );

    return "Opening Google Meet.";

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
      formatStudyTime(
        studySeconds
      )
    );

  }


  /* =================================================
     LOCAL MATH
  ================================================= */

  if (
    looksLikeMath(text)
  ) {

    const result =
      calculateSimpleMath(text);


    if (result !== null) {

      return (
        "The answer is " +
        result
      );

    }

  }


  /* =================================================
     GEMINI AI
  ================================================= */

  return await askBackend(
    message
  );

}


/* =====================================================
   GEMINI BACKEND CONNECTION
===================================================== */

async function askBackend(
  message
) {

  const history =
    conversationHistory
      .slice(-12);


  const params =
    new URLSearchParams();


  params.set(
    "message",
    message
  );


  params.set(
    "history",
    JSON.stringify(history)
  );


  const url =
    JARVIS_CONFIG.backendUrl +
    "?" +
    params.toString();


  console.log(
    "Sending request to JARVIS AI backend..."
  );


  const response =
    await fetch(
      url,
      {
        method: "GET",
        cache: "no-store"
      }
    );


  if (!response.ok) {

    throw new Error(
      "Backend HTTP error: " +
      response.status
    );

  }


  const data =
    await response.json();


  console.log(
    "Backend response:",
    data
  );


  if (!data.success) {

    throw new Error(
      data.error ||
      "Backend returned an error."
    );

  }


  if (
    !data.reply ||
    !data.reply.trim()
  ) {

    throw new Error(
      "Backend returned an empty answer."
    );

  }


  return data.reply;

}


/* =====================================================
   MATH
===================================================== */

function looksLikeMath(
  text
) {

  return /^[0-9+\-*/().%\s]+$/.test(
    text
  );

}


function calculateSimpleMath(
  text
) {

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
   OPEN WEBSITE
===================================================== */

function openWebApp(
  url
) {

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

  if (
    !("speechSynthesis" in window)
  ) {

    if (voiceStatus) {

      voiceStatus.textContent =
        "UNAVAILABLE";

    }

    return;

  }


  voices =
    window.speechSynthesis
      .getVoices();


  if (!voiceSelect) {
    return;
  }


  voiceSelect.innerHTML =
    '<option value="">Default voice</option>';


  voices.forEach(
    function(
      voice,
      index
    ) {

      const option =
        document.createElement(
          "option"
        );


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


if (
  "speechSynthesis" in window
) {

  window.speechSynthesis
    .onvoiceschanged =
      loadVoices;

}


function speak(
  text
) {

  if (
    !("speechSynthesis" in window)
  ) {

    return;

  }


  stopVoice();


  const utterance =
    new SpeechSynthesisUtterance(
      text
    );


  utterance.rate =
    speed
      ? Number(speed.value)
      : 1;


  utterance.pitch =
    0.85;


  utterance.lang =
    JARVIS_CONFIG.language;


  if (
    voiceSelect &&
    voiceSelect.value !== ""
  ) {

    const selectedVoice =
      voices[
        Number(
          voiceSelect.value
        )
      ];


    if (selectedVoice) {

      utterance.voice =
        selectedVoice;

    }

  }


  utterance.onstart =
    function() {

      isSpeaking = true;


      if (voiceStatus) {

        voiceStatus.textContent =
          "SPEAKING";

      }

    };


  utterance.onend =
    function() {

      isSpeaking = false;


      if (voiceStatus) {

        voiceStatus.textContent =
          "READY";

      }

    };


  utterance.onerror =
    function() {

      isSpeaking = false;


      if (voiceStatus) {

        voiceStatus.textContent =
          "READY";

      }

    };


  window.speechSynthesis.speak(
    utterance
  );

}


/* =====================================================
   STOP VOICE
===================================================== */

function stopVoice() {

  if (
    "speechSynthesis" in window
  ) {

    window.speechSynthesis.cancel();

  }


  isSpeaking = false;


  if (voiceStatus) {

    voiceStatus.textContent =
      "READY";

  }

}


/* =====================================================
   SPEECH RECOGNITION
===================================================== */

function setupSpeechRecognition() {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (!SpeechRecognition) {

    if (voiceStatus) {

      voiceStatus.textContent =
        "NOT SUPPORTED";

    }


    if (micButton) {

      micButton.disabled =
        true;

    }


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
          event.results[i][0]
            .transcript;


        if (
          event.results[i].isFinal
        ) {

          finalText += transcript;

        }

      }


      if (
        finalText.trim()
      ) {

        userInput.value =
          finalText.trim();


        sendMessage();

      }

    };


  recognition.onerror =
    function(error) {

      console.error(
        "Speech recognition:",
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


/* =====================================================
   MICROPHONE
===================================================== */

function toggleMicrophone() {

  if (!recognition) {

    return;

  }


  if (isListening) {

    recognition.stop();

    return;

  }


  try {

    recognition.start();

  }

  catch (error) {

    console.error(
      error
    );

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
        conversationHistory
          .slice(-50)
      )
    );


    if (memoryStatus) {

      memoryStatus.textContent =
        "ACTIVE";

    }

  }

  catch (error) {

    console.error(
      "Memory error:",
      error
    );


    if (memoryStatus) {

      memoryStatus.textContent =
        "ERROR";

    }

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

  if (networkStatus) {

    networkStatus.textContent =
      navigator.onLine
        ? "ONLINE"
        : "OFFLINE";

  }


  if (aiStatus) {

    aiStatus.textContent =
      JARVIS_CONFIG.backendUrl
        ? "BACKEND"
        : "LOCAL";

  }


  if (aiStatus2) {

    aiStatus2.textContent =
      JARVIS_CONFIG.backendUrl
        ? "BACKEND"
        : "LOCAL";

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

  if (footerTime) {

    footerTime.textContent =
      new Date()
        .toLocaleTimeString();

  }


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

  if (studyTimer) {

    studyTimer.textContent =
      formatStudyTime(
        studySeconds
      );

  }

}


function formatStudyTime(
  totalSeconds
) {

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
    String(hours)
      .padStart(2, "0") +
    ":" +
    String(minutes)
      .padStart(2, "0") +
    ":" +
    String(seconds)
      .padStart(2, "0")
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


  if (
    savedDate === today
  ) {

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
   START
===================================================== */

initializeJarvis();