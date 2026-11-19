// ==========================================
// ARSHIA AZMAT — PORTFOLIO JAVASCRIPT
// ==========================================


// ==========================================
// 1. MOBILE NAVIGATION
// ==========================================

const menuToggle = document.getElementById("menuToggle");

const navLinks = document.getElementById("navLinks");

const navigationLinks = document.querySelectorAll(".nav-links a");


menuToggle.addEventListener("click", function() {

    const isOpen = navLinks.classList.toggle("open");

    menuToggle.classList.toggle("active");

    menuToggle.setAttribute("aria-expanded", isOpen);

    menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
    );

});


// Close menu after clicking a navigation link

navigationLinks.forEach(function(link) {

    link.addEventListener("click", function() {

        navLinks.classList.remove("open");

        menuToggle.classList.remove("active");

        menuToggle.setAttribute("aria-expanded", "false");

        menuToggle.setAttribute("aria-label", "Open navigation");

    });

});


// ==========================================
// 2. HERO STAGE (pinned, scroll-driven projects)
// ==========================================
//
// The hero pins to the screen while the page scrolls underneath it.
// Scroll distance becomes "position" (0 = first project centred,
// 1 = second, ...). Position eases toward the scroll value, and after
// scrolling stops it snaps so exactly one card is centred.

const track = document.getElementById("home");

const stage = document.getElementById("stage");

const cardsBox = document.getElementById("projectGrid");

const projectCards = Array.from(document.querySelectorAll(".project-card"));

const infoList = document.getElementById("stageList");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const compactQuery = window.matchMedia("(max-width: 900px)");


if (track && stage && cardsBox && projectCards.length) {

    const count = projectCards.length;

    const counterNow = document.getElementById("stageCurrent");

    document.getElementById("stageTotal").textContent =
        String(count).padStart(2, "0");


    // Build the text list on the right from each card's own info

    const textItems = projectCards.map(function(card) {

        const href = card.getAttribute("href");

        const item = document.createElement("div");

        item.className = "stage-item";

        item.innerHTML =
            '<p class="project-type"></p>' +
            '<h3></h3>' +
            '<p class="project-description"></p>' +
            '<a class="text-link stage-link"></a>';

        item.querySelector(".project-type").textContent =
            card.querySelector(".project-type").textContent.trim();

        item.querySelector("h3").textContent =
            card.querySelector("h3").textContent.trim();

        item.querySelector(".project-description").textContent =
            card.querySelector(".project-description").textContent.replace(/\s+/g, " ").trim();

        const link = item.querySelector(".stage-link");

        if (href) {
            link.href = href;
            link.textContent = "View case study ↗";
        } else {
            link.textContent = "Case study coming soon";
            link.classList.add("is-disabled");
            link.setAttribute("aria-disabled", "true");
        }

        infoList.appendChild(item);

        card.setAttribute("draggable", "false");

        return item;

    });


    let step = 520;          // scroll pixels per project
    let position = 0;        // what is drawn
    let target = 0;          // what the scroll asks for
    let settled = 0;         // last snapped project
    let activeIndex = -1;
    let frame = null;
    let snapTimer = null;


    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    // How far the page has scrolled into the pinned hero

    function scrolledIn() {
        return window.scrollY - track.offsetTop;
    }

    function layout() {

        step = Math.round(Math.max(360, window.innerHeight * 0.62));

        track.style.height = (stage.offsetHeight + (count - 1) * step) + "px";

        readScroll();
        position = target;
        render();

    }

    function readScroll() {
        target = clamp(scrolledIn() / step, 0, count - 1);
    }


    function render() {

        const compact = compactQuery.matches;

        const boxW = cardsBox.clientWidth;
        const boxH = cardsBox.clientHeight;
        const cardW = projectCards[0].offsetWidth || 300;
        const listStep = compact ? 16 : clamp(stage.clientHeight * 0.34, 190, 300);

        projectCards.forEach(function(card, i) {

            const d = i - position;
            const a = Math.abs(d);

            let x, y, rotateZ, rotateY, scale, opacity;

            if (compact) {

                // Phones: cards slide sideways in a row

                x = d * cardW * 1.06;
                y = 0;
                rotateZ = d * -3;
                rotateY = 0;
                scale = 1 - Math.min(a, 2) * 0.06;
                opacity = a <= 1 ? 1 - a * 0.35 : Math.max(0, 0.65 - (a - 1) * 0.65);

            } else {

                // Desktop: next card comes up from the bottom-left,
                // the one you just saw leaves toward the top-right.

                x = -d * cardW * 0.78;
                y = d * boxH * 0.6;
                rotateZ = -5;
                rotateY = -14;
                scale = 1 - Math.min(a, 2) * 0.05;
                opacity = a <= 1 ? 1 : Math.max(0, 1 - (a - 1) * 1.5);

            }

            card.style.transform =
                "translate(-50%, -50%) " +
                "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) " +
                "rotateZ(" + rotateZ.toFixed(2) + "deg) " +
                "rotateY(" + rotateY + "deg) " +
                "scale(" + scale.toFixed(3) + ")";

            card.style.opacity = opacity.toFixed(3);
            card.style.zIndex = String(100 - Math.round(a * 10));
            card.style.pointerEvents = opacity < 0.05 ? "none" : "auto";

            // Text list on the right

            const item = textItems[i];

            const itemY = d * listStep;

            const itemOpacity = compact
                ? clamp(1 - a * 2, 0, 1)
                : clamp(1 - a * 0.8, 0, 1);

            item.style.transform =
                "translateY(-50%) translateY(" + itemY.toFixed(1) + "px)";

            item.style.opacity = itemOpacity.toFixed(3);

            item.style.pointerEvents = a < 0.5 ? "auto" : "none";

        });

        const nearest = clamp(Math.round(position), 0, count - 1);

        if (nearest !== activeIndex) {

            activeIndex = nearest;

            counterNow.textContent = String(nearest + 1).padStart(2, "0");

            textItems.forEach(function(item, i) {

                const isActive = i === nearest;

                item.setAttribute("aria-hidden", isActive ? "false" : "true");

                item.querySelector(".stage-link").tabIndex = isActive ? 0 : -1;

            });

            projectCards.forEach(function(card, i) {
                card.setAttribute("aria-current", i === nearest ? "true" : "false");
            });

        }

    }


    // Ease the drawn position toward the scroll position

    function animate() {

        const diff = target - position;

        if (Math.abs(diff) > 0.0008) {
            position += diff * (reduceMotion ? 1 : 0.12);
            render();
            frame = requestAnimationFrame(animate);
        } else {
            position = target;
            render();
            frame = null;
        }

    }

    function kick() {
        if (frame === null) {
            frame = requestAnimationFrame(animate);
        }
    }


    // After scrolling stops, move exactly one project in the direction
    // of travel, so a single wheel notch or swipe changes one card.

    function snap() {

        const s = scrolledIn();

        const end = (count - 1) * step;

        // Not pinned (above the hero or already past it): leave scrolling alone

        if (s < -4 || s > end + 4) return;

        const raw = s / step;

        const delta = raw - settled;

        let next;

        if (Math.abs(delta) > 1.2) {
            next = Math.round(raw);
        } else if (Math.abs(delta) > 0.04) {
            next = settled + (delta > 0 ? 1 : -1);
        } else {
            next = settled;
        }

        next = clamp(next, 0, count - 1);

        settled = next;

        const destination = track.offsetTop + next * step;

        if (Math.abs(destination - window.scrollY) > 2) {
            window.scrollTo({
                top: destination,
                behavior: reduceMotion ? "auto" : "smooth"
            });
        }

    }

    window.addEventListener("scroll", function() {

        readScroll();
        kick();

        window.clearTimeout(snapTimer);
        snapTimer = window.setTimeout(snap, 110);

    }, { passive: true });

    window.addEventListener("resize", layout);


    // Clicking a card: centre card opens its page, others scroll into place

    cardsBox.addEventListener("click", function(e) {

        const card = e.target.closest(".project-card");

        if (!card) return;

        const i = projectCards.indexOf(card);

        if (i !== activeIndex) {

            e.preventDefault();

            settled = i;

            window.scrollTo({
                top: track.offsetTop + i * step,
                behavior: reduceMotion ? "auto" : "smooth"
            });

        } else if (!card.getAttribute("href")) {

            e.preventDefault();

        }

    });


    layout();

    // Fonts can change the stage height once loaded

    window.addEventListener("load", layout);

}


// ==========================================
// 3. SCROLL REVEAL ANIMATIONS
// ==========================================

const revealElements = document.querySelectorAll(".reveal");


if ("IntersectionObserver" in window) {

    const revealObserver = new IntersectionObserver(

        function(entries, observer) {

            entries.forEach(function(entry) {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    observer.unobserve(entry.target);

                }

            });

        },

        {
            threshold: 0.12
        }

    );


    revealElements.forEach(function(element) {

        revealObserver.observe(element);

    });

} else {

    // Fallback for older browsers

    revealElements.forEach(function(element) {

        element.classList.add("visible");

    });

}


// ==========================================
// 4. AUTOMATIC COPYRIGHT YEAR
// ==========================================

const currentYear = document.getElementById("currentYear");

currentYear.textContent = new Date().getFullYear();


// ==========================================
// 5. CONSOLE MESSAGE
// ==========================================

console.log(
    "%cHello, curious mind! 👋",
    "color: #d97745; font-size: 20px; font-weight: bold;"
);

console.log(
    "Welcome to Arshia's Product Design Portfolio."
);