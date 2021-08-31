const { app, BrowserWindow, ipcMain } = require('electron')
const sqlite3 = require("sqlite3"), db = new sqlite3.Database('./keys.sqlite');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow () {
	// Create the browser window.
	win = new BrowserWindow({
		width: 990,
		height: 600,
		resizable: false,
		frame: true,
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: false,
			enableRemoteModule: true,
			preload: `${__dirname}/preload.js`
		}
	});

	// and load the index.html of the app.
	win.loadFile('index.html')

	// Open the DevTools.
	//win.webContents.openDevTools()

	// Emitted when the window is closed.
	win.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null;
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => setTimeout(createWindow, 500));

ipcMain.on('asynchronous-message', (event, arg) => {
	const resp = JSON.parse(arg);
	switch (resp.type) {
		case "q":
			db.get(`SELECT * FROM keyboard WHERE AND day = 1 LIMIT 1`, [], async (err, row) => {
				event.reply('asynchronous-reply', JSON.stringify({type:"qr",data:row}));
			});
		break;

		default:
			return event.reply('asynchronous-reply', `{"type":"empty"}`);
	}
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		createWindow();
	}
})