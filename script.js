import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAEPTqVXUULft96jWh4A7sVD7WoUiMcP4k",
  authDomain: "weather-app-752b7.firebaseapp.com",
  projectId: "weather-app-752b7",
  storageBucket: "weather-app-752b7.firebasestorage.app",
  messagingSenderId: "349566198908",
  appId: "1:349566198908:web:00e5d742e2ce1043e8455f9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const API_KEY = '184691ae223eee38728e0d9b29b56511';
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const saveBtn = document.getElementById('save-btn');
const cityInput = document.getElementById('city-input');
const resultDiv = document.getElementById('weather-result');
const bgIcon = document.getElementById('weather-bg-icon');
const clockEl = document.getElementById('digital-clock');
let currentCity = "";

function updateClock() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('ja-JP', { hour12: false });
    const hour = now.getHours();
    document.body.className = (hour >= 6 && hour < 18) ? 'day-bg' : 'night-bg';
}
setInterval(updateClock, 1000);
updateClock();

searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=ja`;
        fetchWeather(url);
    }
});

locationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert("GPSが使えません");
        return;
    }
    locationBtn.textContent = "⌛";
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=ja`;
            fetchWeather(url);
            locationBtn.textContent = "📍";
        },
        () => {
            alert("位置情報を取得できませんでした");
            locationBtn.textContent = "📍";
        }
    );
});

async function fetchWeather(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        currentCity = data.name;
        document.getElementById('city-name').textContent = data.name;
        document.getElementById('temp').textContent = `${Math.round(data.main.temp)}°`;
        document.getElementById('description').textContent = data.weather[0].description;
        
        const weather = data.weather[0].main;
        const icons = { Clear: "☀️", Clouds: "☁️", Rain: "☔", Snow: "❄️" };
        bgIcon.textContent = icons[weather] || "🌫️";
        resultDiv.classList.remove('hidden');
    } catch (e) { alert("都市が見つかりません"); }
}

saveBtn.addEventListener('click', async () => {
    if (!currentCity) return;
    await addDoc(collection(db, "cities"), { name: currentCity, createdAt: new Date() });
});

onSnapshot(query(collection(db, "cities"), orderBy("createdAt", "desc")), (snapshot) => {
    const cityList = document.getElementById('city-list');
    cityList.innerHTML = "";
    snapshot.forEach((snapshotDoc) => {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = snapshotDoc.data().name;
        span.style.cursor = "pointer";
        span.onclick = () => {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${snapshotDoc.data().name}&appid=${API_KEY}&units=metric&lang=ja`;
            fetchWeather(url);
        };
        const delBtn = document.createElement('button');
        delBtn.textContent = "削除";
        delBtn.className = "delete-btn";
        delBtn.onclick = async (e) => {
            e.stopPropagation();
            await deleteDoc(doc(db, "cities", snapshotDoc.id));
        };
        li.appendChild(span);
        li.appendChild(delBtn);
        cityList.appendChild(li);
    });
});
