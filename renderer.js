const { ipcRenderer } = require('electron')

function setIntervalMinutes() {
    const minutes = parseInt(document.getElementById("interval").value);
    if (minutes > 0) {
        ipcRenderer.send("set-interval", minutes);
    }
}

function start() {
    ipcRenderer.send("start");
}

function stop() {
    ipcRenderer.send("stop");
}

function updateTimerStatus(isRunning) {
    const statusDiv = document.getElementById("timer-status");
    if (isRunning) {
        statusDiv.textContent = "✓ Timer is running";
        statusDiv.classList.remove("stopped");
        statusDiv.classList.add("running");
    } else {
        statusDiv.textContent = "✗ Timer is stopped";
        statusDiv.classList.remove("running");
        statusDiv.classList.add("stopped");
    }
}

ipcRenderer.on("state-updated", (event, state) => {
    // Update timer status
    updateTimerStatus(state.isRunning);
    
    // Update history
    const list = document.getElementById("history");
    list.innerHTML = "";

    if (state.history.length === 0) {
        const li = document.createElement("li");
        li.style.padding = "15px";
        li.style.textAlign = "center";
        li.style.color = "#999";
        li.textContent = "No history yet. Start the timer to begin tracking!";
        list.appendChild(li);
        return;
    }

    state.history.forEach((entry, index) => {
        const li = document.createElement("li");
        li.className = "history-entry";
        
        const timeSpan = document.createElement("span");
        timeSpan.textContent = entry.timestamp;
        console.log(entry.timestamp);
        li.appendChild(timeSpan);
        
        // Add grade buttons
        const gradeContainer = document.createElement("div");
        gradeContainer.className = "grade-buttons";
        gradeContainer.textContent = "How was it? ";
        
        const grades = [
            { label: "🟢 Well Spent", value: "green", color: "#4CAF50" },
            { label: "🟡 Got Distracted", value: "yellow", color: "#FFC107" },
            { label: "🔴 Wasted", value: "red", color: "#f44336" }
        ];
        
        grades.forEach(grade => {
            const btn = document.createElement("button");
            btn.textContent = grade.label;
            btn.className = `grade-btn ${entry.grade === grade.value ? 'active' : ''}`;
            btn.style.backgroundColor = entry.grade === grade.value ? grade.color : "#e0e0e0";
            btn.style.color = entry.grade === grade.value ? "white" : "#333";
            btn.onclick = () => {
                ipcRenderer.send("grade-entry", index, grade.value);
            };
            gradeContainer.appendChild(btn);
        });
        
        li.appendChild(gradeContainer);
        list.appendChild(li);
    });
});
