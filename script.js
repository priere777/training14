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
const saveBtn = document.getElementById('save-btn');
const cityInput = document.getElementById('city-input');
const resultDiv = document.getElementById('weather-result');
const bgIcon = document.getElementById('weather-bg-icon');
const clockEl = document.getElementById('digital-clock');
let currentCity = "";

// --- 時計と背景のリアルタイム更新 ---
function updateTime() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('ja-JP', { hour12: false });
    
    const hour = now.getHours();
    document.body.className = (hour >= 6 && hour < 18) ? 'day-bg' : 'night-bg';
}
setInterval(updateTime, 1000);
updateTime();

// --- 天気取得 ---
searchBtn.addEventListener('click', () => getWeather(cityInput.value));

async function getWeather(city) {
    if (!city) return;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=ja`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('City not found');
        const data = await response.json();
        currentCity = data.name;
        document.getElementById('city-name').textContent = data.name;
        document.getElementById('temp').textContent = `${Math.round(data.main.temp)}°`;
        document.getElementById('description').textContent = data.weather[0].description;
        
        const weather = data.weather[0].main;
        const iconMap = { Clear: "☀️", Clouds: "☁️", Rain: "☔", Snow: "❄️" };
        bgIcon.textContent = iconMap[weather] || "🌫️";
        resultDiv.classList.remove('hidden');
    } catch (error) {
        alert(error.message);
    }
}

// --- 保存機能 ---
saveBtn.addEventListener('click', async () => {
    if (!currentCity) return;
    await addDoc(collection(db, "cities"), { name: currentCity, createdAt: new Date() });
});

// --- リスト表示と削除機能 ---
onSnapshot(query(collection(db, "cities"), orderBy("createdAt", "desc")), (snapshot) => {
    const cityList = document.getElementById('city-list');
    cityList.innerHTML = "";
    snapshot.forEach((snapDoc) => {
        const li = document.createElement('li');
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = snapDoc.data().name;
        nameSpan.style.cursor = "pointer";
        nameSpan.onclick = () => getWeather(snapDoc.data().name);
        
        const delBtn = document.createElement('button');
        delBtn.textContent = "削除";
        delBtn.className = "delete-btn";
        delBtn.onclick = async (e) => {
            e.stopPropagation(); // 都市名クリックを発動させない
            await deleteDoc(doc(db, "cities", snapDoc.id));
        };
        
        li.appendChild(nameSpan);
        li.appendChild(delBtn);
        cityList.appendChild(li);
    });
});