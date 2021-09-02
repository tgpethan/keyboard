const { app, BrowserWindow, ipcMain } = require('electron')

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
	win.loadFile('src/index.html')

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

let sendable = false;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

let evt = null;

ipcMain.on('asynchronous-message', (event, arg) => {
	const resp = JSON.parse(arg);
	switch (resp.type) {
		case "q":
			if (!sendable) return;
			client.write(`g//@SELECT * FROM keyboard WHERE day = 1`);
			evt = event;
			/*db.get(`SELECT * FROM keyboard WHERE day = 1`, [], (err, row) => {
				if (err) throw err;
				console.log(row);
				event.reply('asynchronous-reply', JSON.stringify({type:"qr",data:row}));
			});*/
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
});

// Include Nodejs' net module.
const net = require('net');
// The port number and hostname of the server.
const port = 65534;
const host = "127.0.0.1";

// Create a new TCP client.
const client = new net.Socket();
// Send a connection request to the server.
client.connect({ port: port, host: host }, function() {
    // If there is no error, the server has accepted the request and created a new 
    // socket dedicated to us.
    console.log('TCP connection established with the server.');
	sendable = true;
});

// The client can also receive data from the server by reading from its socket.
client.on('data', function(chunk) {
    //console.log(chunk.toString());
	evt.reply('asynchronous-reply', JSON.stringify({type:"qr",data:JSON.parse(chunk.toString())}));
});

client.on('end', function() {
    console.log('Requested an end to the TCP connection');
});