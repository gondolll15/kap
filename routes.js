/* ==========================================
   KAP — ROUTES DATABASE
========================================== */

/* ===== DAFTAR STASIUN ===== */

const KAP_STATIONS = [
    "Medan",
    "Binjai",
    "Bandara Kualanamu",
    "Tebing Tinggi",
    "Kisaran",
    "Tanjungbalai",
    "Rantau Prapat",
    "Pematangsiantar",
    "Padang",
    "Pariaman",
    "Kertapati",
    "Prabumulih",
    "Lahat",
    "Lubuklinggau",
    "Tanjungkarang",
    "Kotabumi",
    "Gambir",
    "Pasar Senen",
    "Bandung",
    "Cirebon",
    "Semarang Tawang",
    "Yogyakarta",
    "Solo Balapan",
    "Surabaya Pasarturi",
    "Surabaya Gubeng",
    "Malang",
    "Ketapang"
];


/* ===== DAFTAR RUTE KERETA ===== */

const KAP_ROUTES = [
    ["Medan", "Binjai"],
    ["Medan", "Bandara Kualanamu"],
    ["Medan", "Tebing Tinggi"],
    ["Medan", "Kisaran"],
    ["Medan", "Tanjungbalai"],
    ["Medan", "Rantau Prapat"],
    ["Medan", "Pematangsiantar"],

    ["Padang", "Pariaman"],

    ["Kertapati", "Prabumulih"],
    ["Kertapati", "Lahat"],
    ["Kertapati", "Lubuklinggau"],

    ["Tanjungkarang", "Kotabumi"],

    ["Gambir", "Bandung"],
    ["Pasar Senen", "Yogyakarta"],
    ["Gambir", "Semarang Tawang"],
    ["Gambir", "Surabaya Pasarturi"],

    ["Bandung", "Yogyakarta"],
    ["Bandung", "Surabaya Gubeng"],

    ["Cirebon", "Semarang Tawang"],
    ["Semarang Tawang", "Yogyakarta"],

    ["Solo Balapan", "Surabaya Gubeng"],
    ["Yogyakarta", "Malang"],
    ["Surabaya Gubeng", "Malang"],
    ["Surabaya Gubeng", "Ketapang"]
];


/* ===== FORMAT HARGA ===== */

function kapFormatPrice(price) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(price);
}


/* ===== CARI JADWAL ===== */

function kapFindSchedules(origin, destination) {
    if (!Array.isArray(KAP_SCHEDULES)) {
        return [];
    }

    return KAP_SCHEDULES.filter(schedule => {
        return (
            (schedule.origin === origin &&
                schedule.destination === destination) ||

            (schedule.origin === destination &&
                schedule.destination === origin)
        );
    });
}


/* ===== TAMPILKAN SEMUA RUTE ===== */

function kapRenderRoutes() {
    const routeGrid = document.getElementById("routeGrid");

    if (!routeGrid) return;

    routeGrid.innerHTML = "";

    KAP_ROUTES.forEach((route, index) => {
        const origin = route[0];
        const destination = route[1];

        const card = document.createElement("article");
        card.className = "route-card";

        card.innerHTML = `
            <div class="route-card-top">
                <span class="route-badge">
                    KAP Route ${String(index + 1).padStart(2, "0")}
                </span>

                <span class="route-card-icon"></span>
            </div>

            <div class="route-stations">
                <div class="route-station">
                    <strong>${origin}</strong>
                    <span>Stasiun Asal</span>
                </div>

                <div class="route-connector">➜</div>

                <div class="route-station">
                    <strong>${destination}</strong>
                    <span>Stasiun Tujuan</span>
                </div>
            </div>

            <div class="route-card-bottom">
                <span>Rute perjalanan KAP</span>

                <button
                    type="button"
                    class="route-book-btn"
                    data-origin="${origin}"
                    data-destination="${destination}"
                >
                    Pesan Tiket
                </button>
            </div>
        `;

        routeGrid.appendChild(card);
    });

    routeGrid.querySelectorAll(".route-book-btn").forEach(button => {
        button.addEventListener("click", () => {
            const origin = button.dataset.origin;
            const destination = button.dataset.destination;

            const originInput = document.getElementById("origin");
            const destinationInput = document.getElementById("destination");
            const bookingSection = document.getElementById("booking");

            if (originInput && destinationInput) {
                originInput.value = origin;
                destinationInput.value = destination;
            }

            if (bookingSection) {
                bookingSection.scrollIntoView({
                    behavior: "smooth"
                });
            }
        });
    });
}


/* ===== PENCARIAN RUTE ===== */

function kapSearchRoutes(keyword = "") {
    const routeGrid = document.getElementById("routeGrid");

    if (!routeGrid) return;

    const search = keyword.toLowerCase().trim();

    const filteredRoutes = KAP_ROUTES.filter(route => {
        return (
            route[0].toLowerCase().includes(search) ||
            route[1].toLowerCase().includes(search)
        );
    });

    routeGrid.innerHTML = "";

    if (filteredRoutes.length === 0) {
        routeGrid.innerHTML = `
            <div class="route-empty">
                Rute yang kamu cari belum tersedia.
            </div>
        `;
        return;
    }

    filteredRoutes.forEach((route, index) => {
        const card = document.createElement("article");
        card.className = "route-card";

        card.innerHTML = `
            <div class="route-card-top">
                <span class="route-badge">KAP Route</span>
                <span class="route-card-icon"></span>
            </div>

            <div class="route-stations">
                <div class="route-station">
                    <strong>${route[0]}</strong>
                    <span>Stasiun Asal</span>
                </div>

                <div class="route-connector">➜</div>

                <div class="route-station">
                    <strong>${route[1]}</strong>
                    <span>Stasiun Tujuan</span>
                </div>
            </div>

            <div class="route-card-bottom">
                <span>Rute perjalanan KAP</span>

                <button
                    type="button"
                    class="route-book-btn"
                    data-origin="${route[0]}"
                    data-destination="${route[1]}"
                >
                    Pesan Tiket
                </button>
            </div>
        `;

        routeGrid.appendChild(card);
    });

    routeGrid.querySelectorAll(".route-book-btn").forEach(button => {
        button.addEventListener("click", () => {
            document.getElementById("origin").value =
                button.dataset.origin;

            document.getElementById("destination").value =
                button.dataset.destination;

            document.getElementById("booking").scrollIntoView({
                behavior: "smooth"
            });
        });
    });
}


/* ===== INISIALISASI RUTE ===== */

document.addEventListener("DOMContentLoaded", () => {
    kapRenderRoutes();

    const searchInput = document.getElementById("routeSearch");

    if (searchInput) {
        searchInput.addEventListener("input", event => {
            kapSearchRoutes(event.target.value);
        });
    }
});