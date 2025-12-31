/* ================= 1. FIREBASE CONFIG ================= */
try {
  firebase.initializeApp({
    apiKey: "AIzaSyAvveGOBWjV9-Zibp-7OTM6TXpYyzTA04E",
    authDomain: "zb1-zerose-gift.firebaseapp.com",
    projectId: "zb1-zerose-gift",
    storageBucket: "zb1-zerose-gift.firebasestorage.app",
    messagingSenderId: "9714864720",
    appId: "1:9714864720:web:2feb84233ae5afdeb67755"
  });
} catch (e) { console.log("Firebase config skipped"); }

const db = (typeof firebase !== 'undefined') ? firebase.firestore() : null;

/* ================= 2. HAMBURGER MENU & GLOBAL UI ================= */
const mobileMenu = document.getElementById('mobile-menu');
const navList = document.querySelector('.nav-list');

if (mobileMenu) {
    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        navList.classList.toggle('active');
    });
}

// Efek Global (Particles & Spotlight)
const particleContainer = document.getElementById("particle-container");
const spotlightContainer = document.getElementById("spotlight-container");

function createSpotlights() {
    if(!spotlightContainer) return;
    for(let i=0; i<2; i++) {
        const spot = document.createElement("div");
        spot.className = "spotlight";
        spotlightContainer.appendChild(spot);
    }
}
function createNightSky() {
    if(!particleContainer) return;
    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        star.className = 'bg-star';
        const size = Math.random() * 2 + 1;
        star.style.width = size + 'px'; star.style.height = size + 'px';
        star.style.left = Math.random() * 100 + '%'; star.style.top = Math.random() * 100 + '%';
        star.style.animationDuration = (Math.random() * 3 + 2) + 's';
        star.style.animationDelay = Math.random() * 2 + 's';
        particleContainer.appendChild(star);
    }
}
createSpotlights();
createNightSky();

// EFEK METEOR JATUH
function spawnMeteor() {
    if(!particleContainer) return;
    const meteor = document.createElement('div');
    meteor.className = 'meteor-effect';
    if (Math.random() > 0.5) {
        meteor.style.top = '-100px'; meteor.style.left = Math.random() * 80 + '%';
    } else {
        meteor.style.left = '-100px'; meteor.style.top = Math.random() * 40 + '%';
    }
    const duration = Math.random() * 1 + 1;
    meteor.style.animation = `meteorShoot ${duration}s linear forwards`;
    particleContainer.appendChild(meteor);
    setTimeout(() => meteor.remove(), duration * 1000);
}
setInterval(() => { if (Math.random() > 0.6) spawnMeteor(); }, 2500);


/* ================= 3. HALAMAN HOME & LOGIKA INTERAKSI ================= */
const giftOverlay = document.getElementById("gift-overlay");

if (giftOverlay) {
    const container = document.querySelector(".concert-container");
    const starContainer = document.getElementById("star-message-container");
    const cursorTrailContainer = document.getElementById("cursor-trail-container");
    const lightstickBtn = document.getElementById("lightstick-btn");
    const letterModal = document.getElementById("letter-modal");
    const modalTextBody = document.getElementById("modal-text-body");
    const memberModal = document.getElementById("member-modal");
    
    let memberData = {}; 
    let zeroniElements = []; 
    const zeroniFiles = [
      "zeroni_binini_2.jpg", "zeroni_gunini_2.jpg", "zeroni_gyunini_2.jpg",
      "zeroni_hanini_2.jpg", "zeroni_rinini_2.jpg", "zeroni_taenini_2.jpg",
      "zeroni_thwenini_2.jpg", "zeroni_woongnini_2.jpg", "zeroni_yunini_2.jpg"
    ];
    const zb1Colors = ["#4DA6FF", "#FF6F91", "#FFD700", "#9B5DE5", "#00F5D4", "#F15BB5", "#FEE440", "#A0C4FF", "#BDB2FF"];

    const healingMessages = [
        { text: "Your beginning might be humble, but your future will be prosperous.", song: "ZB1 Motto" },
        { text: "Don't worry, you are doing fine. Just keep running.", song: "New Kidz on the Block" },
        { text: "Even in the darkness, I will find you.", song: "Dear Eclipse" },
        { text: "You shine brighter than any star in the universe.", song: "Cosmic Dust (Fan Song)" },
        { text: "Whatever happens, we will always be one.", song: "Our Season" },
        { text: "It’s okay to cry sometimes. Let it all out.", song: "Always" }
    ];

    // FETCH DATA
    fetch('js/memberData.json')
        .then(response => {
            if(!response.ok) throw new Error("Gagal load memberData");
            return response.json();
        })
        .then(data => {
            memberData = data;
            initZeronis(); 
        })
        .catch(err => console.error("Error Member Data:", err));

    // CURSOR TRAIL
    document.addEventListener('mousemove', function(e) {
        if (Math.random() > 0.3) return; 
        const sparkle = document.createElement('div');
        sparkle.className = 'trail-sparkle';
        sparkle.style.left = e.pageX + 'px';
        sparkle.style.top = e.pageY + 'px';
        sparkle.style.backgroundColor = Math.random() > 0.5 ? '#ffd700' : '#ffffff';
        if(cursorTrailContainer) {
            cursorTrailContainer.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 800);
        }
    });

    // LIGHTSTICK LOGIC
    let isLightstickOn = false;
    if(lightstickBtn) {
        lightstickBtn.onclick = () => {
            isLightstickOn = !isLightstickOn;
            if (isLightstickOn) {
                container.classList.add("party-mode");
                lightstickBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Lightstick: ON';
                lightstickBtn.classList.add("active");
                spawnBurst(window.innerWidth/2, window.innerHeight/2);
            } else {
                container.classList.remove("party-mode");
                lightstickBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Lightstick: OFF';
                lightstickBtn.classList.remove("active");
            }
        };
    }

    // GIFT OPENING
    giftOverlay.onclick = () => {
        giftOverlay.style.opacity = "0";
        setTimeout(() => { giftOverlay.style.display = "none"; }, 500);
        // Musik dihapus, hanya efek visual
        spawnConfetti();
        spreadZeronis(); 
    };

    // MODAL MEMBER LOGIC
    let typeWriterTimeout; 

    window.openMemberModal = function(filename) {
        const data = memberData[filename];
        if (data) {
            document.getElementById("popup-img").src = "images/" + data.image; 
            document.getElementById("popup-name").innerText = data.name;
            document.getElementById("popup-role").innerText = data.role;
            
            if(data.lyrics && data.lyrics.length > 0) {
                const randomIndex = Math.floor(Math.random() * data.lyrics.length);
                const selectedLyric = data.lyrics[randomIndex];
                document.getElementById("popup-song").innerText = "🎵 " + selectedLyric.song;

                const lyricElement = document.getElementById("popup-lyric");
                lyricElement.innerText = ""; 
                const textToType = `"${selectedLyric.text}"`; 
                clearTimeout(typeWriterTimeout); 
                
                let charIndex = 0;
                function typeWriter() {
                    if (charIndex < textToType.length) {
                        lyricElement.innerHTML += textToType.charAt(charIndex);
                        charIndex++;
                        typeWriterTimeout = setTimeout(typeWriter, 50); 
                    }
                }
                typeWriter(); 
            }
            memberModal.classList.add("visible");
        }
    };
    window.closeMemberModal = function() { memberModal.classList.remove("visible"); };

    window.openModal = function(text) {
        modalTextBody.innerText = text;
        letterModal.classList.add("visible");
    }
    window.closeModal = function() { letterModal.classList.remove("visible"); }

    window.getHealingMessage = function() {
        const randomMsg = healingMessages[Math.floor(Math.random() * healingMessages.length)];
        const modalBody = document.getElementById("modal-text-body");
        modalBody.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h2 style="color: #6a0dad; margin-bottom: 20px;">🌙 Oracle Message</h2>
                <p style="font-size: 1.5rem; font-style: italic; color: #333;">"${randomMsg.text}"</p>
                <hr style="margin: 20px auto; width: 50px; border-color: #ffd700;">
                <p style="font-size: 0.9rem; color: #666;">Inspired by: <strong>${randomMsg.song}</strong></p>
            </div>
        `;
        letterModal.classList.add("visible");
    };

    // ZERONI LOGIC
    function makeDraggable(el) {
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;
        let hasMoved = false;

        el.addEventListener('mousedown', (e) => {
            isDragging = true; hasMoved = false;
            el.classList.add('dragging'); el.classList.remove('floating');
            startX = e.clientX; startY = e.clientY;
            initialLeft = el.offsetLeft; initialTop = el.offsetTop;
            e.preventDefault();
        });
        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX; const dy = e.clientY - startY;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved = true;
            el.style.left = `${initialLeft + dx}px`; el.style.top = `${initialTop + dy}px`;
        });
        window.addEventListener('mouseup', () => {
            if (!isDragging) return;
            isDragging = false;
            el.classList.remove('dragging'); el.classList.add('floating');
        });
        el.addEventListener('touchstart', (e) => {
            isDragging = true; hasMoved = false;
            el.classList.add('dragging'); el.classList.remove('floating');
            const touch = e.touches[0];
            startX = touch.clientX; startY = touch.clientY;
            initialLeft = el.offsetLeft; initialTop = el.offsetTop;
        });
        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            const dx = touch.clientX - startX; const dy = touch.clientY - startY;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) hasMoved = true;
            el.style.left = `${initialLeft + dx}px`; el.style.top = `${initialTop + dy}px`;
        }, { passive: false });
        window.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            el.classList.remove('dragging'); el.classList.add('floating');
        });
        el.hasMovedRecently = () => hasMoved;
    }

    function initZeronis() {
        zeroniFiles.forEach((file) => {
            const bubble = document.createElement("div");
            bubble.className = "zeroni-bubble";
            const img = document.createElement("img");
            img.src = "images/" + file;
            bubble.appendChild(img);
            container.appendChild(bubble);
            zeroniElements.push(bubble);
            makeDraggable(bubble); 
            bubble.addEventListener("click", (e) => {
                if (bubble.hasMovedRecently && bubble.hasMovedRecently()) return;
                spawnBurst(e.clientX, e.clientY);
                bubble.style.transform = "translate(-50%, -50%) scale(1.2)";
                setTimeout(() => { bubble.style.transform = "translate(-50%, -50%) scale(1)"; }, 300);
                openMemberModal(file); 
            });
        });
    }

    function spreadZeronis() {
        zeroniElements.forEach((bubble, i) => {
            setTimeout(() => {
                const randomLeft = Math.random() * 80 + 10; 
                const randomTop = Math.random() * 60 + 20; 
                bubble.style.left = randomLeft + "%"; bubble.style.top = randomTop + "%";
                bubble.classList.add("spread");
                setTimeout(() => {
                    bubble.classList.add("floating"); 
                    bubble.style.animationDelay = (Math.random() * 5) + "s";
                    bubble.style.animationDuration = (Math.random() * 5 + 10) + "s";
                }, 1200);
            }, i * 150);
        });
    }

    // BURST
    function spawnBurst(x, y) {
        for (let i = 0; i < 12; i++) {
            const p = document.createElement("div");
            p.style.position = "fixed"; p.style.left = x + "px"; p.style.top = y + "px";
            p.style.width = "6px"; p.style.height = "6px";
            p.style.backgroundColor = zb1Colors[Math.floor(Math.random() * zb1Colors.length)];
            p.style.borderRadius = "50%"; p.style.pointerEvents = "none"; p.style.zIndex = "9999";
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 80 + 40;
            const tx = Math.cos(angle) * velocity; const ty = Math.sin(angle) * velocity;
            p.animate([
                { transform: 'translate(0,0) scale(1)', opacity: 1 },
                { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
            ], { duration: 800, fill: "forwards", easing: "ease-out" });
            document.body.appendChild(p); setTimeout(() => p.remove(), 800);
        }
    }
    function spawnConfetti() {
        spawnBurst(window.innerWidth/2, window.innerHeight/2);
        setTimeout(() => spawnBurst(window.innerWidth/2, window.innerHeight/2), 300);
    }
    window.spawnBurst = spawnBurst;

    // MESSAGE
    window.checkWordCount = function() {
        const input = document.getElementById("user-msg");
        const counter = document.getElementById("word-counter");
        let text = input.value.trim();
        let words = text === "" ? 0 : text.split(/\s+/).length;
        counter.innerText = `${words} / 1000 Words`;
        if (words > 1000) counter.style.color = "#ff4444";
        else counter.style.color = "#ffd700";
    }

    function createStar(text) {
        const s = document.createElement("div");
        s.className = "msg-star"; s.innerHTML = "★"; 
        s.style.left = Math.random() * 90 + 5 + "%";
        s.style.top = Math.random() * 80 + 10 + "%";
        s.addEventListener("click", () => { openModal(text); });
        if(starContainer) starContainer.appendChild(s);
    }

    window.sendMessage = function() {
        const input = document.getElementById("user-msg");
        const text = input.value;
        if (text.trim() === "") return;
        createStar(text);
        input.value = "";
        document.getElementById("word-counter").innerText = "0 / 1000 Words";
        spawnBurst(window.innerWidth/2, window.innerHeight - 50);
        if(db) {
            db.collection("messages").add({
                text: text, time: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }

    if(db && starContainer) {
        db.collection("messages").orderBy("time", "desc").limit(20)
          .onSnapshot(snapshot => {
            starContainer.innerHTML = ""; 
            snapshot.forEach(doc => { createStar(doc.data().text); });
          });
    }
} 

/* ================= 4. LOGIKA CINEMA SLIDE ================= */
const cinemaImg = document.getElementById('cinema-img');
const cinemaVisual = document.querySelector('.visual-box');

if (cinemaImg) {
    let journeyData = []; 
    let currentIndex = 0;
    let touchStartX = 0; 
    let touchEndX = 0;

    const cinemaStage = document.querySelector('.cinema-stage');

    if(cinemaStage) {
        cinemaStage.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; });
        cinemaStage.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) document.getElementById('next-slide').click();
        if (touchEndX > touchStartX + 50) document.getElementById('prev-slide').click();
    }

    const titleEl = document.getElementById('cinema-title');
    const yearEl = document.getElementById('cinema-year');
    const descEl = document.getElementById('cinema-desc');
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    const indicatorsEl = document.getElementById('indicators');
    const cinemaBg = document.getElementById('cinema-bg');

    fetch('js/journeyData.json')
        .then(response => response.json())
        .then(data => {
            journeyData = data;
            createIndicators(); 
            updateSlide(0);     
        })
        .catch(error => { console.error('Error data:', error); });

    function preloadImage(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(url);
            img.onerror = () => resolve(url);
        });
    }

    async function updateSlide(index) {
        if (!journeyData || journeyData.length === 0) return;
        cinemaImg.classList.add('img-loading'); 
        titleEl.style.opacity = 0; yearEl.style.opacity = 0; descEl.style.opacity = 0;
        if(cinemaVisual) cinemaVisual.classList.add('is-loading');

        try {
            const data = journeyData[index];
            await preloadImage(data.img);
            cinemaImg.src = data.img;
            titleEl.innerText = data.title;
            yearEl.innerText = data.year;
            descEl.innerText = data.desc;
            if(cinemaBg) cinemaBg.style.backgroundImage = `url('${data.img}')`;

            const dots = document.querySelectorAll('.dot');
            dots.forEach((dot, i) => { dot.classList.toggle('active', i === index); });

            if(cinemaVisual) cinemaVisual.classList.remove('is-loading');
            setTimeout(() => {
                cinemaImg.classList.remove('img-loading');
                titleEl.style.opacity = 1; yearEl.style.opacity = 1; descEl.style.opacity = 1;
            }, 100);
        } catch (e) {
            console.error("Slide error", e);
            if(cinemaVisual) cinemaVisual.classList.remove('is-loading');
        }
    }

    function createIndicators() {
        indicatorsEl.innerHTML = '';
        journeyData.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                if (currentIndex !== i) {
                    currentIndex = i;
                    updateSlide(currentIndex);
                }
            });
            indicatorsEl.appendChild(dot);
        });
    }

    if(prevBtn) prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex === 0) ? journeyData.length - 1 : currentIndex - 1;
        updateSlide(currentIndex);
    });

    if(nextBtn) nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex === journeyData.length - 1) ? 0 : currentIndex + 1;
        updateSlide(currentIndex);
    });
}