/* =========================================
   KAP - MAIN JAVASCRIPT
========================================= */


/* =========================================
   1. LOADING SCREEN
========================================= */

function kapStartLoading() {

    const loader = document.getElementById("loader");
    const website = document.getElementById("website");

    if (!loader || !website) {
        console.error("Elemen loader atau website tidak ditemukan!");
        return;
    }

    // Pastikan website belum terlihat
    website.classList.remove("visible");

    // Tunggu animasi loading
    setTimeout(() => {

        // Sembunyikan loading screen
        loader.classList.add("hidden");

        // Tampilkan website
        website.classList.add("visible");

        console.log("KAP Website berhasil dimuat!");

    }, 3500);

}


/* Jalankan loading setelah HTML siap */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        kapStartLoading,
        { once: true }
    );

} else {

    kapStartLoading();

}


/* =========================================
   2. MOBILE NAVIGATION
========================================= */

const menuToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {

    menuToggle.addEventListener("click", () => {

        navMenu.classList.toggle("open");

    });

    // Tutup menu setelah link diklik
    navMenu.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            navMenu.classList.remove("open");

        });

    });

}


/* =========================================
   3. ACTIVE NAVIGATION
========================================= */

const navLinks = document.querySelectorAll(".nav-menu a");

navLinks.forEach(link => {

    link.addEventListener("click", () => {

        navLinks.forEach(item => {

            item.classList.remove("active");

        });

        link.classList.add("active");

    });

});


/* =========================================
   4. WEBSITE READY
========================================= */

console.log("KAP Main JavaScript Loaded");