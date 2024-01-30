export default {
	async fetch(request, env, ctx) {
		const API_KEY = env.ENV_BOT_TOKEN;
		const TELEGRAM_URL = `https://api.telegram.org/bot${API_KEY}/sendMessage?chat_id=`;
		return (await this.handleRequest(request, TELEGRAM_URL));
	},

	async handleRequest(request, TELEGRAM_URL) {
		try {
			const payload = await request.json();
			if (request.method !== "POST") {
				console.log("wrong method")
				return new Response(`Wrong method`, { status: 200 });
			}
			if (!payload) {
				console.log("no payload")
				return new Response(`No payload`, { status: 200 });
			}
			if (!('message' in payload)) {
				console.log("no message")
				return new Response(`No message`, { status: 200 });
			}
			if (!payload.message) {
				console.log("no message")
				return new Response(`No message`, { status: 200 });
			}
			const chatId = payload.message.chat.id;
			const text = String(payload.message.text);
			let textWithNoSpacesAndLowercase = text.replace(/\s/g, '').toLowerCase();
			if (!textWithNoSpacesAndLowercase.includes('4утра') &
				!textWithNoSpacesAndLowercase.includes('4часа') &
				!textWithNoSpacesAndLowercase.includes('четыречаса') &
				!textWithNoSpacesAndLowercase.includes('четыреутра')) {
				return new Response('No needed message', { status: 200 });
			}
			const timezonesURL = "https://raw.githubusercontent.com/dmfilipenko/timezones.json/master/timezones.json";
			const timezones = await fetch(timezonesURL).then(resp => resp.text());
			let zones = this.findSuitableZones(await JSON.parse(timezones));
			let randomZone = zones[Math.floor(Math.random() * zones.length)];
			let cities = randomZone.utc;
			let randomCity = cities[Math.floor(Math.random() * cities.length)];
			let randomCityName = randomCity.split('/')[1];
			await this.sendMessage(TELEGRAM_URL, chatId, randomCityName);

			return new Response('OK');
		} catch (err) {
			return new Response(err.stack || err);
		}
	},

	async sendMessage(TELEGRAM_URL, chatId, response) {
		const url = `${TELEGRAM_URL}${chatId}&text=Of course! Right now Pavel is in ${response}! Don't miss him next time!`;
		const data = await fetch(url).then(resp => resp.json());
		return data;
	},
	findSuitableZones(zonesData) {
		let suitableZones = [];
		let dateAbs = new Date();
		let utcHours = dateAbs.getUTCHours();
		let possibleOffsetPlus = Math.abs((4 - utcHours + 24) % 24)
		let possibleOffsetMinus = 0 - Math.abs((4 - utcHours) % 24)

		for (let i = 0; i < zonesData.length; i++) {
			if (zonesData[i].offset == possibleOffsetMinus) {
				suitableZones.push(zonesData[i]);
			};

			if (zonesData[i].offset == possibleOffsetPlus) {
				suitableZones.push(zonesData[i])

			};
		}
		return suitableZones;
	}
}