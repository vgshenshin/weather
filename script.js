const link = "http://api.weatherstack.com/current?access_key=baff8484f694c9dbed4e654cb75a466b",
	root = document.getElementById('root'),
	popup = document.getElementById('popup'),
	textInput = document.getElementById('text-input'),
	form = document.getElementById('form'),
	popupClose = document.getElementById('close');

let store = {
	city: "Krasnodar",
	temperature: 0,
	observationTime: "07:29 AM",
	isDay: "yes",
	description: "",
	properties: {
		cloudcover: {},
		humidity: {},
		windSpeed: {},
		pressure: {},
		uvIndex: {},
		visibility: {},
	}
};

const fetchData = async () => {
try {
	const query = localStorage.getItem('query') || store.city;
	const result = await fetch(`${link}&query=${query}`);
	const data = await result.json(); //  конвертируем json в объект
	const {
		current: {
			cloudcover,
			temperature,
			humidity,
			observation_time: observationTime,
			pressure,
			uv_index: uvIndex,
			visibility,
			is_day: isDay,
			weather_descriptions: description,
			wind_speed: windSpeed
		}, //  прим-м деструктуризацию чтобы достать св-ва из объекта data.current
		location: {
			name
		}
	} = data;

	store = {
		...store,
		isDay,
		city: name,
		temperature,
		observationTime,
		description: description[0],
		properties: {
			cloudcover: {
				title: 'облачность',
				value: `${cloudcover}%`,
				icon: 'cloud.png'
			},
			humidity: {
				title: 'влажность',
				value: `${humidity}%`,
				icon: 'humidity.png'
			},
			windSpeed: {
				title: 'скорость ветра',
				value: `${(windSpeed * 1000 / 3600).toFixed(1) } м/с`,
				icon: 'wind.png'
			},
			pressure: {
				title: 'давление',
				value: `${Math.floor(pressure / 1.333)} мм рт. ст.`,
				icon: 'gauge.png'
			},
			uvIndex: {
				title: 'УФ-индекс',
				value: `${uvIndex}`,
				icon: 'uv-index.png'
			},
			visibility: {
				title: 'видимость',
				value: `${visibility} км`,
				icon: 'visibility.png'
			}
		}
	};

	renderComponent();
} catch (err) {
	console.log(err);
	localStorage.clear();
}
};

const getImage = (description) => {
	const value = description.toLowerCase();

	switch (value) {
		case "partly cloudy" || "cloudy":
		  return "partly.png";
		case "cloud":
		  return "cloud.png";
		case "fog":
		  return "fog.png";
		case "sunny":
		  return "sunny.png";
		case "cloud":
		  return "cloud.png";
		default:
		  return "loader.gif";
	}
};

const renderProperty = (properties) => {
	return Object.values(properties).map(({ title, value, icon }) => {
				return `<div class="property">
							<div class="property-icon">
								<img src="./img/icons/${icon}" alt="">
							</div>
							<div class="property-info">
								<div class="property-info__value">${value}</div>
								<div class="property-info__description">${title}</div>
							</div>
						</div>`;
			}).join("");
};

const markup = () => {
	const { city, description, observationTime, temperature, isDay, properties } = store;

	const containerClass = isDay === 'yes' ? 'is-day' : "";

	return `<div class="container ${containerClass}">
				<div class="top">
					<div class="city">
						<div class="city-subtitle">Погода сегодня</div>
						<div class="city-title" id="city">
							<span>${city}</span>
						</div>
					</div>
					<div class="city-info">
						<div class="top-left">
							<img class="icon" src="./img/${getImage(description)}" alt="" />
							<div class="description">${description}</div>
						</div>
				
						<div class="top-right">
							<div class="city-info__subtitle">текущее время ${observationTime}</div>
							<div class="city-info__title">${temperature}°</div>
						</div>
					</div>
				</div>
				<div id="properties">${renderProperty(properties)}</div>
			</div>`;
};

const renderComponent = () => {
	root.innerHTML = markup();

	const city = document.getElementById('city');
	city.addEventListener('click', togglePopupClass);
};

const togglePopupClass = () => {
	popup.classList.toggle('active');
};

document.addEventListener('keydown', (e) => {
	if (e.code === 'Escape' && popup.classList.contains('active')) {
		togglePopupClass();
	}
});

const handleInput = (e) => {
	store = {
		...store,
		city: e.target.value
	};
};

const handleSubmit = (e) => {
	e.preventDefault();
	const value = store.city;

	if (!value || value === ' ') return null;

	localStorage.setItem('query', value);
	fetchData();
	togglePopupClass();
};

form.addEventListener('submit', handleSubmit);
textInput.addEventListener('input', handleInput);
popupClose.addEventListener('click', togglePopupClass);

fetchData();