// index.js (front-end JavaScript file)

// Session management code
function generateSessionId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0,
              v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getSessionId() {
    const currentTimestamp = new Date().getTime(); // Current time in milliseconds
    const sessionData = JSON.parse(localStorage.getItem('sessionData'));

    if (sessionData) {
        const { sessionId, timestamp } = sessionData;
        
        // Check if 72 hours have passed (72 hours * 60 minutes * 60 seconds * 1000 milliseconds)
        const expirationTime = 72 * 60 * 60 * 1000;

        if (currentTimestamp - timestamp < expirationTime) {
            // Session is still valid
            return sessionId;
        }
    }

    // Session is expired or does not exist, generate a new one
    const newSessionId = generateSessionId();
    localStorage.setItem('sessionData', JSON.stringify({
        sessionId: newSessionId,
        timestamp: currentTimestamp
    }));
    
    return newSessionId;
}

// Use the session ID in your application
const sessionId = getSessionId();
console.log("Session ID:", sessionId);

// Example: Handling a button click
document.getElementById("submitButton").addEventListener("click", function() {
    alert("Button was clicked!");
    // You can also use the session ID here for any API calls or tracking
});
