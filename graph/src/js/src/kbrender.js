function setup() {
	createCanvas(window.innerWidth, window.innerHeight);

	startIPCChannel();

	setInterval(update, 5000);
}

let osk = {};
const theThing = "1234567890\nQWERTYUIOP\nASDFGHJKL\nZXCVBNM".split("\n");
for (let thing of theThing) {
	const th = thing.split("");
	for (let t of th) {
		osk[t] = 0;
	}
}
const oskKeys = Object.keys(osk);
let largestTimes = 0;

function startIPCChannel() {
	// Init message channel
	window.ipcRenderer.on('asynchronous-reply', (event, res) => {
		const response = JSON.parse(res);
		switch (response.type) {
			case "qr":
				//console.log(response.data);
				for (let data of response.data) {
					try {
						osk[data.kbkey] = data.times;
						if (data.times > largestTimes) largestTimes = data.times;
					} catch (e) {

					}
				};
			break;
		}
	});
}

function draw() {
	background(0);

	//fill(255);
	noStroke();

	let i = 0;
	let times = 0;
	let fuck = 0;
	for (let key of oskKeys) {
		fill((osk[key] / largestTimes) * 255, 0, 0);
		push();
			translate(((i - fuck) * 50), times * 50);
			rect(0, 0, 50, 50);
			fill(255);
			text(key, 27 - textWidth(key), 30);
		pop();
		i++;
		if (i > 9 && times == 0) {
			times++;
			fuck = i - 0.5;
		}
		if (i > 19 && times == 1) {
			times++;
			fuck = i - 0.6;
		}
		if (i > 28 && times == 2) {
			times++;
			fuck = i - 0.8;
		}
		if (i > 35 && times == 3) {
			times++;
			fuck = i;
		}
	}
	text(times, 200, 200);
}

function update() {
	window.ipcRenderer.send('asynchronous-message', '{"type":"q"}');
}