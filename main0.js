const { app, BrowserWindow, Notification } = require('electron');



function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('index.html');

    // Send a notification every 5 minutes
    setInterval(() => {
        new Notification({
            title: "Reminder",
            body: "5 minutes passed!"
        }).show();
    }, 5 * 60 * 1000);
}

app.whenReady().then(createWindow);
