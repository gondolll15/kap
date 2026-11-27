/* =========================================
   KAP - GALLERY JAVASCRIPT
========================================= */


/* =========================================
   1. ELEMENT SELECTOR
========================================= */

const kapGalleryGrid = document.getElementById("galleryGrid");

const kapGalleryLightbox =
    document.getElementById("galleryLightbox");

const kapLightboxImage =
    document.getElementById("lightboxImage");

const kapLightboxCaption =
    document.getElementById("lightboxCaption");

const kapLightboxClose =
    document.getElementById("lightboxClose");


/* =========================================
   2. GALLERY DATA
========================================= */

const KAP_GALLERY_DATA = [
    {
        title: "Railway Station",
        category: "STATION"
    },
    {
        title: "Waiting Platform",
        category: "PLATFORM"
    },
    {
        title: "Comfortable Interior",
        category: "INTERIOR"
    },
    {
        title: "Modern Train",
        category: "TRAIN"
    },
    {
        title: "Beautiful Journey",
        category: "LANDSCAPE"
    },
    {
        title: "Passenger Service",
        category: "SERVICE"
    }
];


/* =========================================
   3. GALLERY VARIABLES
========================================= */

let kapCurrentGalleryIndex = 0;

let kapGalleryItems = [];


/* =========================================
   4. GET GALLERY ITEMS
========================================= */

function kapGetGalleryItems() {

    if (!kapGalleryGrid) return [];

    return Array.from(
        kapGalleryGrid.querySelectorAll(".gallery-item")
    );

}


/* =========================================
   5. OPEN LIGHTBOX
========================================= */

function kapOpenLightbox(index) {

    kapGalleryItems = kapGetGalleryItems();

    if (
        !kapGalleryLightbox ||
        !kapLightboxImage ||
        !kapGalleryItems[index]
    ) {
        return;
    }

    kapCurrentGalleryIndex = index;

    const selectedItem = kapGalleryItems[index];

    const image = selectedItem.querySelector("img");

    const title = selectedItem.querySelector("h3");

    if (!image) return;


    kapLightboxImage.src = image.src;

    kapLightboxImage.alt = image.alt;

    kapLightboxCaption.textContent = title
        ? title.textContent
        : image.alt;


    kapGalleryLightbox.classList.add("active");

    document.body.classList.add("gallery-open");

}


/* =========================================
   6. CLOSE LIGHTBOX
========================================= */

function kapCloseLightbox() {

    if (!kapGalleryLightbox) return;

    kapGalleryLightbox.classList.remove("active");

    document.body.classList.remove("gallery-open");

}


/* =========================================
   7. NEXT IMAGE
========================================= */

function kapNextGalleryImage() {

    kapGalleryItems = kapGetGalleryItems();

    if (kapGalleryItems.length === 0) return;

    kapCurrentGalleryIndex++;

    if (kapCurrentGalleryIndex >= kapGalleryItems.length) {

        kapCurrentGalleryIndex = 0;

    }

    kapOpenLightbox(kapCurrentGalleryIndex);

}


/* =========================================
   8. PREVIOUS IMAGE
========================================= */

function kapPreviousGalleryImage() {

    kapGalleryItems = kapGetGalleryItems();

    if (kapGalleryItems.length === 0) return;

    kapCurrentGalleryIndex--;

    if (kapCurrentGalleryIndex < 0) {

        kapCurrentGalleryIndex = kapGalleryItems.length - 1;

    }

    kapOpenLightbox(kapCurrentGalleryIndex);

}


/* =========================================
   9. GALLERY CLICK EVENTS
========================================= */

function kapInitGallery() {

    kapGalleryItems = kapGetGalleryItems();

    if (!kapGalleryGrid) return;


    kapGalleryItems.forEach((item, index) => {

        item.style.cursor = "pointer";

        item.setAttribute("tabindex", "0");

        item.setAttribute("role", "button");

        item.setAttribute(
            "aria-label",
            `Buka foto ${index + 1}`
        );


        item.addEventListener("click", () => {

            kapOpenLightbox(index);

        });


        item.addEventListener("keydown", (event) => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                kapOpenLightbox(index);

            }

        });

    });


    if (kapLightboxClose) {

        kapLightboxClose.addEventListener(
            "click",
            kapCloseLightbox
        );

    }


    if (kapGalleryLightbox) {

        kapGalleryLightbox.addEventListener("click", (event) => {

            if (event.target === kapGalleryLightbox) {

                kapCloseLightbox();

            }

        });

    }

}


/* =========================================
   10. KEYBOARD NAVIGATION
========================================= */

function kapGalleryKeyboard() {

    document.addEventListener("keydown", (event) => {

        if (
            !kapGalleryLightbox ||
            !kapGalleryLightbox.classList.contains("active")
        ) {
            return;
        }


        if (event.key === "Escape") {

            kapCloseLightbox();

        }


        if (event.key === "ArrowRight") {

            kapNextGalleryImage();

        }


        if (event.key === "ArrowLeft") {

            kapPreviousGalleryImage();

        }

    });

}


/* =========================================
   11. INITIALIZE GALLERY
========================================= */

kapInitGallery();

kapGalleryKeyboard();


/* =========================================
   12. CONSOLE INFORMATION
========================================= */

console.log("KAP Gallery System Loaded");

console.log(
    `Total foto galeri: ${kapGetGalleryItems().length}`
);