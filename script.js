// ============================================================
// JARVIS 2 — COMPLETE FRONTEND
// Gemini AI + Google Apps Script Backend
// ============================================================

const JARVIS_CONFIG = {
    backendUrl:
        "https://script.google.com/macros/s/AKfycbwYK7YKKp1Ww087kxCYATjIhiWJ0my4mi-vNGjMArACiSTpVuwfzQmSJrH1qJEkWehS/exec",

    assistantName: "JARVIS 2",

    maxHistory: 12,

    speechRate: 1.0,

    speechPitch: 1.0
};


// ============================================================
// DOM ELEMENTS
// ============================================================

const userInput =
    document.getElementById("userInput");

const sendButton =
    document.getElementById("sendButton");

const micButton =
    document.getElementById("micButton");

const stopButton =
    document.getElementById("stopButton");

const chatMessages =
    document.getElementById("chatMessages");

const thinkingText =
    document.getElementById("thinkingText");

const voiceSelect =
    document.getElementById("voiceSelect");

const speedSlider =
    document.getElementById("speed");

const speedValue =
    document.getElementById("speedValue");

const networkStatus =
    document.getElementById("networkStatus");

const voiceStatus =
    document.getElementById("voiceStatus");

const aiStatus =
    document.getElementById("aiStatus");

const aiStatus2 =
    document.getElementById("aiStatus2");

const memoryStatus =
    document.getElementById("memoryStatus");

const studyTimerDisplay =
    document.getElementById("studyTimer");

const startStudyButton =
    document.getElementById("startStudy");

const pauseStudyButton =
    document.getElementById("pauseStudy");

const resetStudyButton =
    document.getElementById("resetStudy");

const footerTime =
    document.getElementById("footerTime");


// ============================================================
// STATE
// ============================================================

let conversationHistory = [];

let voices = [];

let recognition = null;

let listening = false;

let isProcessing = false;

let studySeconds = 0;

let studyInterval = null;


// ============================================================
// INITIALIZATION
// ============================================================

function initializeJarvis() {

    loadConversation();

    loadStudyTime();

    loadVoices();

    setupSpeechRecognition();

    setupEventListeners();

    updateNetworkStatus();

    updateClock();

    setInterval(updateClock, 1000);

    addStartupMessage();

    console.log("JARVIS 2 initialized.");
}


// ============================================================
// STARTUP MESSAGE
// ============================================================

function addStartupMessage() {

    if (!chatMessages) return;

    if (chatMessages.children.length > 0) {
        return;
    }

    addMessage(
        "JARVIS",
        "Systems online. JARVIS 2 is ready."
    );
}


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {

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

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

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
            stopSpeaking
        );
    }


    if (speedSlider) {

        speedSlider.addEventListener(
            "input",
            function() {

                const value =
                    parseFloat(
                        speedSlider.value
                    );

                JARVIS_CONFIG.speechRate =
                    value;

                if (speedValue) {

                    speedValue.textContent =
                        value.toFixed(1) + "x";
                }
            }
        );
    }


    if (voiceSelect) {

        voiceSelect.addEventListener(
            "change",
            function() {

                localStorage.setItem(
                    "jarvisVoice",
                    voiceSelect.value
                );
            }
        );
    }


    if (startStudyButton) {

        startStudyButton.addEventListener(
            "click",
            startStudyTimer
        );
    }


    if (pauseStudyButton) {

        pauseStudyButton.addEventListener(
            "click",
            pauseStudyTimer
        );
    }


    if (resetStudyButton) {

        resetStudyButton.addEventListener(
            "click",
            resetStudyTimer
        );
    }


    document
        .querySelectorAll("[data-command]")
        .forEach(function(button) {

            button.addEventListener(
                "click",
                function() {

                    const command =
                        this.dataset.command;

                    if (command && userInput) {

                        userInput.value =
                            command;

                        sendMessage();
                    }
                }
            );
        });
}


// ============================================================
// ADD CHAT MESSAGE
// ============================================================

function addMessage(
    sender,
    message
) {

    if (!chatMessages) return;


    const container =
        document.createElement("div");


    container.className =
        "chat-message " +
        (
            sender === "USER"
                ? "user-message"
                : "jarvis-message"
        );


    const senderElement =
        document.createElement("div");


    senderElement.className =
        "message-sender";


    senderElement.textContent =
        sender;


    const messageElement =
        document.createElement("div");


    messageElement.className =
        "message-text";


    messageElement.textContent =
        message;


    container.appendChild(
        senderElement
    );


    container.appendChild(
        messageElement
    );


    chatMessages.appendChild(
        container
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


// ============================================================
// SEND MESSAGE
// ============================================================

async function sendMessage() {

    if (isProcessing) return;

    if (!userInput) return;


    const message =
        userInput.value.trim();


    if (!message) return;


    isProcessing = true;


    userInput.value = "";


    addMessage(
        "USER",
        message
    );


    saveConversationMessage(
        "user",
        message
    );


    showThinking(true);


    try {

        // ----------------------------------------------------
        // LOCAL COMMANDS
        // ----------------------------------------------------

        const localResult =
            processLocalCommand(message);


        if (localResult !== null) {

            addMessage(
                "JARVIS",
                localResult
            );


            saveConversationMessage(
                "assistant",
                localResult
            );


            speak(localResult);

            return;
        }


        // ----------------------------------------------------
        // SIMPLE MATH
        // ----------------------------------------------------

        const mathResult =
            processMath(message);


        if (mathResult !== null) {

            addMessage(
                "JARVIS",
                mathResult
            );


            saveConversationMessage(
                "assistant",
                mathResult
            );


            speak(mathResult);

            return;
        }


        // ----------------------------------------------------
        // GEMINI
        // ----------------------------------------------------

        const reply =
            await askBackend(message);


        addMessage(
            "JARVIS",
            reply
        );


        saveConversationMessage(
            "assistant",
            reply
        );


        speak(reply);


    } catch (error) {

        console.error(
            "JARVIS ERROR:",
            error
        );


        const errorMessage =
            "AI backend connection failed. " +
            "Please check the JARVIS backend.";


        addMessage(
            "JARVIS",
            errorMessage
        );


    } finally {

        showThinking(false);

        isProcessing = false;
    }
}


// ============================================================
// LOCAL COMMANDS
// ============================================================

function processLocalCommand(message) {

    const command =
        message.toLowerCase().trim();


    // TIME
    if (
        command === "time" ||
        command.includes(
            "what time is it"
        ) ||
        command.includes(
            "current time"
        )
    ) {

        return (
            "The current time is " +
            new Date().toLocaleTimeString()
        );
    }


    // DATE
    if (
        command === "date" ||
        command.includes(
            "today's date"
        )
    ) {

        return (
            "Today's date is " +
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


    // YOUTUBE
    if (
        command.includes(
            "open youtube"
        )
    ) {

        window.open(
            "https://www.youtube.com",
            "_blank"
        );

        return "Opening YouTube.";
    }


    // GOOGLE
    if (
        command.includes(
            "open google"
        )
    ) {

        window.open(
            "https://www.google.com",
            "_blank"
        );

        return "Opening Google.";
    }


    // GMAIL
    if (
        command.includes(
            "open gmail"
        )
    ) {

        window.open(
            "https://mail.google.com",
            "_blank"
        );

        return "Opening Gmail.";
    }


    // DRIVE
    if (
        command.includes(
            "open drive"
        )
    ) {

        window.open(
            "https://drive.google.com",
            "_blank"
        );

        return "Opening Google Drive.";
    }


    // DOCS
    if (
        command.includes(
            "open docs"
        )
    ) {

        window.open(
            "https://docs.google.com",
            "_blank"
        );

        return "Opening Google Docs.";
    }


    // CALENDAR
    if (
        command.includes(
            "open calendar"
        )
    ) {

        window.open(
            "https://calendar.google.com",
            "_blank"
        );

        return "Opening Google Calendar.";
    }


    // MEET
    if (
        command.includes(
            "open meet"
        )
    ) {

        window.open(
            "https://meet.google.com",
            "_blank"
        );

        return "Opening Google Meet.";
    }


    // CALCULATOR
    if (
        command === "calculator" ||
        command.includes(
            "open calculator"
        )
    ) {

        window.open(
            "https://www.google.com/search?q=calculator",
            "_blank"
        );

        return "Opening calculator.";
    }


    // START STUDY
    if (
        command.includes(
            "start study timer"
        ) ||
        command === "start studying"
    ) {

        startStudyTimer();

        return "Study timer started.";
    }


    // PAUSE STUDY
    if (
        command.includes(
            "pause study timer"
        )
    ) {

        pauseStudyTimer();

        return "Study timer paused.";
    }


    // RESET STUDY
    if (
        command.includes(
            "reset study timer"
        )
    ) {

        resetStudyTimer();

        return "Study timer reset.";
    }


    // STUDY TIME
    if (
        command.includes(
            "study time"
        ) ||
        command.includes(
            "how long have i studied"
        )
    ) {

        return (
            "Your current study time is " +
            formatStudyTime(
                studySeconds
            )
        );
    }


    return null;
}


// ============================================================
// SIMPLE MATH
// ============================================================

function processMath(message) {

    const expression =
        message
            .toLowerCase()
            .replace(
                /what is/g,
                ""
            )
            .replace(
                /calculate/g,
                ""
            )
            .replace(
                /solve/g,
                ""
            )
            .replace(
                /\?/g,
                ""
            )
            .trim();


    if (
        !/^[0-9+\-*/().%\s^]+$/
            .test(expression)
    ) {

        return null;
    }


    if (
        !/[0-9]/
            .test(expression)
    ) {

        return null;
    }


    try {

        const safeExpression =
            expression.replace(
                /\^/g,
                "**"
            );


        const result =
            Function(
                '"use strict"; return (' +
                safeExpression +
                ')'
            )();


        if (
            typeof result === "number" &&
            Number.isFinite(result)
        ) {

            return (
                "The answer is " +
                result +
                "."
            );
        }

    } catch (error) {

        return null;
    }


    return null;
}


// ============================================================
// ASK BACKEND
// ============================================================

async function askBackend(message) {

    const history =
        conversationHistory.slice(
            -JARVIS_CONFIG.maxHistory
        );


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
        "JARVIS connecting to backend..."
    );


    const response =
        await fetch(
            url,
            {
                method: "GET",
                cache: "no-store",
                redirect: "follow"
            }
        );


    if (!response.ok) {

        throw new Error(
            "Backend HTTP " +
            response.status
        );
    }


    const responseText =
        await response.text();


    console.log(
        "Backend response:",
        responseText
    );


    let data;


    try {

        data =
            JSON.parse(
                responseText
            );

    } catch (error) {

        throw new Error(
            "Backend returned invalid JSON."
        );
    }


    if (!data.success) {

        throw new Error(
            data.error ||
            "Gemini backend error."
        );
    }


    if (!data.reply) {

        throw new Error(
            "Empty AI response."
        );
    }


    return data.reply;
}


// ============================================================
// THINKING STATUS
// ============================================================

function showThinking(show) {

    if (!thinkingText) return;


    if (show) {

        thinkingText.textContent =
            "JARVIS IS THINKING...";

    } else {

        thinkingText.textContent =
            "SYSTEM READY";
    }
}


// ============================================================
// VOICE OUTPUT
// ============================================================

function loadVoices() {

    if (
        !("speechSynthesis" in window)
    ) {

        if (voiceStatus) {

            voiceStatus.textContent =
                "VOICE: NOT SUPPORTED";
        }

        return;
    }


    function refreshVoices() {

        voices =
            window.speechSynthesis
                .getVoices();


        if (voiceSelect) {

            voiceSelect.innerHTML =
                "";


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
                        " (" +
                        voice.lang +
                        ")";


                    voiceSelect.appendChild(
                        option
                    );
                }
            );


            const saved =
                localStorage.getItem(
                    "jarvisVoice"
                );


            if (
                saved !== null &&
                voices[saved]
            ) {

                voiceSelect.value =
                    saved;
            }
        }


        if (voiceStatus) {

            voiceStatus.textContent =
                "VOICE: READY";
        }
    }


    refreshVoices();


    window.speechSynthesis
        .onvoiceschanged =
        refreshVoices;
}


// ============================================================
// SPEAK
// ============================================================

function speak(text) {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }


    window.speechSynthesis.cancel();


    const cleanText =
        String(text)
            .replace(
                /[*_#`]/g,
                ""
            )
            .replace(
                /\n+/g,
                ". "
            );


    const utterance =
        new SpeechSynthesisUtterance(
            cleanText
        );


    utterance.rate =
        JARVIS_CONFIG.speechRate;


    utterance.pitch =
        JARVIS_CONFIG.speechPitch;


    if (
        voiceSelect &&
        voices.length
    ) {

        const index =
            parseInt(
                voiceSelect.value,
                10
            );


        if (voices[index]) {

            utterance.voice =
                voices[index];
        }
    }


    utterance.onstart =
        function() {

            if (voiceStatus) {

                voiceStatus.textContent =
                    "VOICE: SPEAKING";
            }
        };


    utterance.onend =
        function() {

            if (voiceStatus) {

                voiceStatus.textContent =
                    "VOICE: READY";
            }
        };


    window.speechSynthesis.speak(
        utterance
    );
}


// ============================================================
// STOP SPEAKING
// ============================================================

function stopSpeaking() {

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();
    }


    if (voiceStatus) {

        voiceStatus.textContent =
            "VOICE: STOPPED";
    }
}


// ============================================================
// SPEECH RECOGNITION
// ============================================================

function setupSpeechRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        if (voiceStatus) {

            voiceStatus.textContent =
                "MIC: NOT SUPPORTED";
        }

        return;
    }


    recognition =
        new SpeechRecognition();


    recognition.continuous =
        false;


    recognition.interimResults =
        true;


    recognition.lang =
        "en-IN";


    recognition.onstart =
        function() {

            listening = true;


            if (micButton) {

                micButton.classList.add(
                    "active"
                );
            }


            if (voiceStatus) {

                voiceStatus.textContent =
                    "MIC: LISTENING";
            }
        };


    recognition.onresult =
        function(event) {

            let text = "";


            for (
                let i =
                    event.resultIndex;

                i <
                    event.results.length;

                i++
            ) {

                text +=
                    event.results[i][0]
                        .transcript;
            }


            if (userInput) {

                userInput.value =
                    text;
            }
        };


    recognition.onerror =
        function(event) {

            console.error(
                "Microphone error:",
                event.error
            );


            listening = false;


            if (micButton) {

                micButton.classList.remove(
                    "active"
                );
            }


            if (voiceStatus) {

                voiceStatus.textContent =
                    "MIC: ERROR";
            }
        };


    recognition.onend =
        function() {

            listening = false;


            if (micButton) {

                micButton.classList.remove(
                    "active"
                );
            }


            if (voiceStatus) {

                voiceStatus.textContent =
                    "VOICE: READY";
            }
        };
}


// ============================================================
// MICROPHONE
// ============================================================

function toggleMicrophone() {

    if (!recognition) {

        addMessage(
            "JARVIS",
            "Voice input is not supported in this browser."
        );

        return;
    }


    if (listening) {

        recognition.stop();

    } else {

        try {

            recognition.start();

        } catch (error) {

            console.error(error);
        }
    }
}


// ============================================================
// MEMORY
// ============================================================

function saveConversationMessage(
    role,
    content
) {

    conversationHistory.push({

        role: role,

        content: content,

        timestamp: Date.now()
    });


    if (
        conversationHistory.length >
        JARVIS_CONFIG.maxHistory
    ) {

        conversationHistory =
            conversationHistory.slice(
                -JARVIS_CONFIG.maxHistory
            );
    }


    localStorage.setItem(
        "jarvisConversation",
        JSON.stringify(
            conversationHistory
        )
    );


    if (memoryStatus) {

        memoryStatus.textContent =
            "MEMORY: ACTIVE";
    }
}


function loadConversation() {

    try {

        const saved =
            localStorage.getItem(
                "jarvisConversation"
            );


        if (saved) {

            conversationHistory =
                JSON.parse(saved);
        }


        if (memoryStatus) {

            memoryStatus.textContent =
                "MEMORY: ACTIVE";
        }

    } catch (error) {

        conversationHistory = [];
    }
}


// ============================================================
// NETWORK
// ============================================================

function updateNetworkStatus() {

    if (!networkStatus) return;


    function update() {

        networkStatus.textContent =
            navigator.onLine
                ? "NETWORK: ONLINE"
                : "NETWORK: OFFLINE";
    }


    update();


    window.addEventListener(
        "online",
        update
    );


    window.addEventListener(
        "offline",
        update
    );
}


// ============================================================
// CLOCK
// ============================================================

function updateClock() {

    if (!footerTime) return;


    footerTime.textContent =
        new Date().toLocaleString(
            undefined,
            {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );
}


// ============================================================
// STUDY TIMER
// ============================================================

function startStudyTimer() {

    if (studyInterval !== null) {
        return;
    }


    studyInterval =
        setInterval(
            function() {

                studySeconds++;

                updateStudyTimer();

                saveStudyTime();

            },
            1000
        );
}


function pauseStudyTimer() {

    if (studyInterval !== null) {

        clearInterval(
            studyInterval
        );

        studyInterval = null;
    }
}


function resetStudyTimer() {

    pauseStudyTimer();

    studySeconds = 0;

    updateStudyTimer();

    saveStudyTime();
}


function updateStudyTimer() {

    if (!studyTimerDisplay) {
        return;
    }


    studyTimerDisplay.textContent =
        formatStudyTime(
            studySeconds
        );
}


function formatStudyTime(seconds) {

    const hours =
        Math.floor(
            seconds / 3600
        );


    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );


    const secs =
        seconds % 60;


    return (
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );
}


function saveStudyTime() {

    localStorage.setItem(
        "jarvisStudySeconds",
        String(studySeconds)
    );
}


function loadStudyTime() {

    const saved =
        localStorage.getItem(
            "jarvisStudySeconds"
        );


    if (saved) {

        studySeconds =
            parseInt(
                saved,
                10
            ) || 0;
    }


    updateStudyTimer();
}


// ============================================================
// BACKEND STATUS
// ============================================================

async function testBackendConnection() {

    try {

        const params =
            new URLSearchParams();


        params.set(
            "message",
            "hello"
        );


        params.set(
            "history",
            "[]"
        );


        const response =
            await fetch(
                JARVIS_CONFIG.backendUrl +
                "?" +
                params.toString(),
                {
                    method: "GET",
                    cache: "no-store",
                    redirect: "follow"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        if (
            data.success &&
            data.reply
        ) {

            if (aiStatus) {

                aiStatus.textContent =
                    "AI: ONLINE";
            }


            if (aiStatus2) {

                aiStatus2.textContent =
                    "GEMINI: CONNECTED";
            }


            console.log(
                "JARVIS AI backend ONLINE."
            );


            return true;
        }


        throw new Error(
            data.error ||
            "Backend test failed."
        );

    } catch (error) {

        console.error(
            "Backend connection failed:",
            error
        );


        if (aiStatus) {

            aiStatus.textContent =
                "AI: OFFLINE";
        }


        if (aiStatus2) {

            aiStatus2.textContent =
                "GEMINI: OFFLINE";
        }


        return false;
    }
}


// ============================================================
// GLOBAL FUNCTIONS
// ============================================================

window.sendMessage =
    sendMessage;

window.toggleMicrophone =
    toggleMicrophone;

window.stopSpeaking =
    stopSpeaking;

window.startStudyTimer =
    startStudyTimer;

window.pauseStudyTimer =
    pauseStudyTimer;

window.resetStudyTimer =
    resetStudyTimer;


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeJarvis();


        setTimeout(
            testBackendConnection,
            1500
        );
    }
);