const { app, BrowserWindow, Notification, ipcMain } = require('electron');
const path = require('path');

let win;
let timerInterval = null;
let appState = {
    isRunning: false,
    intervalMinutes: 5,
    history: []
};

function createWindow() {
    win = new BrowserWindow({
        width: 900,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('index.html');
    // Uncomment for debugging:
    // win.webContents.openDevTools();
    
    loadState();
    sendStateUpdate();
}

// IPC: Set interval in minutes
ipcMain.on('set-interval', (event, minutes) => {
    appState.intervalMinutes = minutes;
    console.log(`Interval set to ${minutes} minutes`);
    
    // If timer is running, restart it with the new interval
    if (appState.isRunning) {
        stopTimer();
        startTimer();
    }
    
    saveState();
    sendStateUpdate();
});

// IPC: Start the timer
ipcMain.on('start', (event) => {
    if (!appState.isRunning) {
        startTimer();
        appState.isRunning = true;
        console.log('Timer started');
        saveState();
        sendStateUpdate();
    }
});

// IPC: Stop the timer
ipcMain.on('stop', (event) => {
    if (appState.isRunning) {
        stopTimer();
        appState.isRunning = false;
        console.log('Timer stopped');
        saveState();
        sendStateUpdate();
    }
});

// IPC: Grade a history entry
ipcMain.on('grade-entry', (event, index, grade) => {
    if (index >= 0 && index < appState.history.length) {
        appState.history[index].grade = grade; // 'green', 'yellow', or 'red'
        console.log(`Entry ${index} graded as ${grade}`);
        saveState();
        sendStateUpdate();
    }
});

function startTimer() {
    if (timerInterval !== null) {
        return; // Already running
    }

    console.log(`Starting timer with interval ${appState.intervalMinutes} minutes`);

    timerInterval = setInterval(() => {
        
        const notificationTime = new Date();
        
        // Create notification
        new Notification({
            title: 'Scheduler Reminder',
            body: `${appState.intervalMinutes} minute(s) have passed!`,
            icon: path.join(__dirname, 'icon.png') // Optional: add an icon
        }).show();

        // Add to history (initially ungraded)
        const historyEntry = {
            timestamp: notificationTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }) 
            ,
            grade: null // No grade yet - user will grade it in the app
        };
        appState.history.unshift(historyEntry); // Add to front of array
        
        // Keep history limited to last 100 entries
        if (appState.history.length > 100) {
            appState.history.pop();
        }

        console.log(`Notification sent at ${notificationTime.toLocaleString()}`);
        saveState();
        sendStateUpdate();
    }, appState.intervalMinutes * 60 * 1000);
}

function stopTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function sendStateUpdate() {
    if (win) {
        win.webContents.send('state-updated', appState);
    }
}

function saveState() {
    // You can add localStorage or file system persistence here if needed
    // For now, state persists in memory during the app session
}

function loadState() {
    // Load state from storage if implemented
    // For now, we use the default state
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
