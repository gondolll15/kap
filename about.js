/* =========================================
   KAP - ABOUT JAVASCRIPT
========================================= */


/* =========================================
   1. ELEMENT SELECTOR
========================================= */

const kapAboutSection = document.getElementById("about");

const kapAboutImage = document.querySelector(
    ".about-image"
);

const kapAboutContent = document.querySelector(
    ".about-content"
);

const kapValueCards = document.querySelectorAll(
    ".value-card"
);


/* =========================================
   2. ABOUT SECTION ANIMATION
========================================= */

function kapAboutAnimation() {

    if (!kapAboutSection) return;

    if (!("IntersectionObserver" in window)) {

        kapAboutSection.classList.add("about-visible");

        return;

    }

    const aboutObserver = new IntersectionObserver(
        (entries, observer) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("about-visible");

                    observer.unobserve(entry.target);

                }

            });

        },
        {
            threshold: 0.15
        }
    );

    aboutObserver.observe(kapAboutSection);

}

kapAboutAnimation();


/* =========================================
   3. MASCOT INTERACTION
========================================= */

function kapMascotInteraction() {

    if (!kapAboutImage) return;

    const mascot = kapAboutImage.querySelector("img");

    if (!mascot) return;


    mascot.addEventListener("mouseenter", () => {

        mascot.classList.add("mascot-active");

    });


    mascot.addEventListener("mouseleave", () => {

        mascot.classList.remove("mascot-active");

    });

}

kapMascotInteraction();


/* =========================================
   4. VALUE CARD ANIMATION
========================================= */

function kapValueCardAnimation() {

    if (!kapValueCards.length) return;

    kapValueCards.forEach((card, index) => {

        card.style.transitionDelay = `${index * 100}ms`;

        card.addEventListener("mouseenter", () => {

            card.classList.add("value-active");

        });


        card.addEventListener("mouseleave", () => {

            card.classList.remove("value-active");

        });

    });

}

kapValueCardAnimation();


/* =========================================
   5. ABOUT CONTENT INTERACTION
========================================= */

function kapAboutContentInteraction() {

    if (!kapAboutContent) return;

    const paragraphs = kapAboutContent.querySelectorAll("p");

    paragraphs.forEach(paragraph => {

        paragraph.setAttribute("data-about-text", "true");

    });

}

kapAboutContentInteraction();


/* =========================================
   6. KAP COMPANY INFORMATION
========================================= */

const KAP_COMPANY = {

    name: "KAP - Kereta Api Pratama",

    slogan: "Your Safety is Our Priority",

    type: "Personal Web Development Project",

    developer: "Yogi Pratama",

    description:
        "Website pemesanan tiket kereta api berbasis web"

};


/* =========================================
   7. CONSOLE INFORMATION
========================================= */

console.log("KAP About System Loaded");

console.log("Company Information:", KAP_COMPANY);