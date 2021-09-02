const gkm = require('gkm'), fs = require("fs"), sqlite3 = require('sqlite3'), db = new sqlite3.Database('./keys.sqlite'), net = require("net");

db.serialize(function() {
	if (!fs.existsSync("./keys.sqlite")) {
		db.run("CREATE TABLE keyboard (kbkey VARCHAR(16) NOT NULL, times BIGINT UNSIGNED NOT NULL, day INT UNSIGNED NOT NULL)");
	}
});

try {
	require("child_process").execSync("rm hs_err_* -r");
} catch (e) {}

//function day() { return Math.floor(new Date().getTime() / 86400000); }
function day() { return 1; }

gkm.events.on('key.released', async (data) => {
	const theday = day();
	db.get(`SELECT * FROM keyboard WHERE kbkey = "${data[0]}" AND day = ${theday} LIMIT 1`, [], async (err, row) => {
		if (row == null) {
			await db.run(`INSERT INTO keyboard (kbkey, times, day) VALUES ('${data[0]}', '1', ${theday})`);
		} else {
			db.get(`SELECT times FROM keyboard WHERE kbkey = "${data[0]}" AND day = ${theday} LIMIT 1`, [], async (err, roww) => {
				await db.run(`UPDATE keyboard SET times = ${roww.times + 1} WHERE kbkey = "${data[0]}" AND day = ${theday}`);
			});
		}
	});
});

const server = new net.Server();

server.listen(65534, () => {
	console.log(`Server at ${65534}`);
});

server.on('connection', function(socket) {
	console.log("rc");

	socket.on('data', async (data) => {
		const query = data.toString().split("//@");

		switch (query[0]) {
			case "r":
				socket.write(JSON.stringify(await db.run(query[1])));
			break;

			case "g":
				if (query[1].includes("LIMIT 1")) {
					db.get(query[1], [], (err, row) => {
						if (err) return socket.write(JSON.stringify([]));
						socket.write(JSON.stringify(row));
					});
				} else {
					db.all(query[1], [], (err, rows) => {
						if (err) return socket.write(JSON.stringify([]));
						socket.write(JSON.stringify(rows));
					});
				}
			break;

			default:
				socket.write("pong");
			break;
		}
	});

	socket.on('end', () => {
		console.log("dc");
	});

	socket.on('error', (err) => {
		console.error(err);
	});
});