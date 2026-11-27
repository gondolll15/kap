/* =========================================
   KAP - BOOKING SYSTEM
   PART 1: SEARCH, SCHEDULE & SEAT SELECTION
========================================= */


/* =========================================
   1. ELEMENT SELECTOR
========================================= */

const origin = document.getElementById("origin");
const destination = document.getElementById("destination");
const travelDate = document.getElementById("travelDate");
const passengers = document.getElementById("passengers");

const bookingForm = document.getElementById("bookingForm");
const searchResults = document.getElementById("searchResults");

const swapStations = document.getElementById("swapStations");


/* =========================================
   2. BOOKING STATE
========================================= */

let kapCurrentSearch = null;
let kapSelectedTrain = null;
let kapSelectedSeats = [];
let kapPassengerData = [];
let kapFinalBooking = null;


/* =========================================
   3. STORAGE KEY
========================================= */

const KAP_BOOKING_STORAGE = "kap_booking_data";


/* =========================================
   4. HTML ESCAPE
========================================= */

function kapEscapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, char => {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[char];

    });

}


/* =========================================
   5. FORMAT PRICE
========================================= */

function kapFormatBookingPrice(price) {

    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(price);

}


/* =========================================
   6. FORMAT DATE
========================================= */

function kapFormatDate(dateString) {

    const date = new Date(dateString + "T12:00:00");

    return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

}


/* =========================================
   7. TOAST NOTIFICATION
========================================= */

function kapShowToast(message, type = "success") {

    let toast = document.querySelector(".kap-toast");

    if (!toast) {

        toast = document.createElement("div");

        toast.className = "kap-toast";

        document.body.appendChild(toast);

    }

    toast.className = `kap-toast ${type}`;

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toast.timeout);

    toast.timeout = setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


/* =========================================
   8. INITIALIZE STATION SELECT
========================================= */

function kapInitializeStations() {

    if (!origin || !destination) return;

    if (typeof KAP_STATIONS === "undefined") {

        console.error("KAP_STATIONS tidak ditemukan.");

        return;

    }

    origin.innerHTML =
        '<option value="">Pilih stasiun asal</option>';

    destination.innerHTML =
        '<option value="">Pilih stasiun tujuan</option>';


    KAP_STATIONS.forEach(station => {

        const stationName =
            typeof station === "string"
                ? station
                : station.name;

        if (!stationName) return;

        const optionOrigin = document.createElement("option");

        optionOrigin.value = stationName;

        optionOrigin.textContent = stationName;


        const optionDestination = document.createElement("option");

        optionDestination.value = stationName;

        optionDestination.textContent = stationName;


        origin.appendChild(optionOrigin);

        destination.appendChild(optionDestination);

    });

}

kapInitializeStations();


/* =========================================
   9. DEFAULT TRAVEL DATE
========================================= */

function kapInitializeDate() {

    if (!travelDate) return;

    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    const todayString = `${year}-${month}-${day}`;

    travelDate.min = todayString;

    if (!travelDate.value) {

        travelDate.value = todayString;

    }

}

kapInitializeDate();


/* =========================================
   10. SWAP STATIONS
========================================= */

if (swapStations) {

    swapStations.addEventListener("click", () => {

        const oldOrigin = origin.value;

        origin.value = destination.value;

        destination.value = oldOrigin;

    });

}


/* =========================================
   11. CHECK ROUTE
========================================= */

function kapIsValidRoute(from, to) {

    if (
        typeof KAP_ROUTES === "undefined" ||
        !Array.isArray(KAP_ROUTES)
    ) {
        return false;
    }

    return KAP_ROUTES.some(([a, b]) => {

        return (
            (a === from && b === to) ||
            (a === to && b === from)
        );

    });

}


/* =========================================
   12. GET SCHEDULES
========================================= */

function kapGetAvailableSchedules(from, to) {

    if (typeof KAP_SCHEDULES === "undefined") {

        return [];

    }

    return KAP_SCHEDULES
        .filter(schedule => {

            return (
                (
                    schedule.origin === from &&
                    schedule.destination === to
                ) ||
                (
                    schedule.origin === to &&
                    schedule.destination === from
                )
            );

        })
        .map(schedule => {

            return {
                ...schedule,
                origin: from,
                destination: to
            };

        });

}


/* =========================================
   13. SEARCH FORM
========================================= */

if (bookingForm) {

    bookingForm.addEventListener("submit", event => {

        event.preventDefault();

        const from = origin.value;

        const to = destination.value;

        const date = travelDate.value;

        const passengerCount = Number(passengers.value);


        if (!from || !to || !date) {

            kapShowToast(
                "Lengkapi semua data perjalanan.",
                "error"
            );

            return;

        }


        if (from === to) {

            kapShowToast(
                "Stasiun asal dan tujuan tidak boleh sama.",
                "error"
            );

            return;

        }


        if (!kapIsValidRoute(from, to)) {

            kapShowToast(
                "Rute tersebut belum tersedia di KAP.",
                "error"
            );

            return;

        }


        if (date < travelDate.min) {

            kapShowToast(
                "Tanggal keberangkatan tidak valid.",
                "error"
            );

            return;

        }


        if (
            !Number.isInteger(passengerCount) ||
            passengerCount < 1 ||
            passengerCount > 6
        ) {

            kapShowToast(
                "Jumlah penumpang tidak valid.",
                "error"
            );

            return;

        }


        kapCurrentSearch = {
            origin: from,
            destination: to,
            date: date,
            passengers: passengerCount
        };


        kapSelectedTrain = null;

        kapSelectedSeats = [];

        kapPassengerData = [];

        kapFinalBooking = null;


        kapRenderSearchResults();

    });

}


/* =========================================
   14. RENDER SEARCH RESULTS
========================================= */

function kapRenderSearchResults() {

    if (!searchResults || !kapCurrentSearch) return;

    const {
        origin: from,
        destination: to,
        date,
        passengers: passengerCount
    } = kapCurrentSearch;


    const schedules = kapGetAvailableSchedules(from, to);


    if (schedules.length === 0) {

        searchResults.innerHTML = `
            <div class="empty-results">
                <h3>Jadwal Belum Tersedia</h3>
                <p>
                    Belum ada jadwal simulasi untuk rute
                    ${kapEscapeHTML(from)} menuju
                    ${kapEscapeHTML(to)}.
                </p>
            </div>
        `;

        return;

    }


    const scheduleCards = schedules.map((train, index) => {

        return `
            <article class="schedule-card">

                <div class="schedule-card-header">

                    <div>
                        <span class="schedule-label">
                            KAP RAILWAY
                        </span>

                        <h3>${kapEscapeHTML(train.name)}</h3>

                        <span class="train-code">
                            ${kapEscapeHTML(train.code)}
                        </span>
                    </div>

                    <span class="train-class">
                        ${kapEscapeHTML(train.class)}
                    </span>

                </div>


                <div class="schedule-route">

                    <div class="schedule-time">

                        <strong>
                            ${kapEscapeHTML(train.departure)}
                        </strong>

                        <span>
                            ${kapEscapeHTML(train.origin)}
                        </span>

                    </div>


                    <div class="schedule-duration">

                        <span>
                            ${kapEscapeHTML(train.duration)}
                        </span>

                        <div class="schedule-line"></div>

                        <small>DIRECT TRIP</small>

                    </div>


                    <div class="schedule-time">

                        <strong>
                            ${kapEscapeHTML(train.arrival)}
                        </strong>

                        <span>
                            ${kapEscapeHTML(train.destination)}
                        </span>

                    </div>

                </div>


                <div class="schedule-card-footer">

                    <div class="schedule-price">

                        <span>Harga per penumpang</span>

                        <strong>
                            ${kapFormatBookingPrice(train.price)}
                        </strong>

                        <small>
                            ${train.seats} kursi tersedia 
                        </small>

                    </div>


                    <button
                        type="button"
                        class="choose-train-btn"
                        data-schedule-index="${index}">

                        Pilih Kereta 

                    </button>

                </div>

            </article>
        `;

    }).join("");


    searchResults.innerHTML = `

        <div class="search-result-heading">

            <span class="section-label">
                AVAILABLE SCHEDULES
            </span>

            <h3>Hasil Pencarian Kereta</h3>

            <p>
                ${kapEscapeHTML(from)}
                 ${kapEscapeHTML(to)}
            </p>

            <p>
                ${kapEscapeHTML(kapFormatDate(date))}
                · ${passengerCount} penumpang
            </p>

        </div>


        <div class="schedule-list">

            ${scheduleCards}

        </div>


        <p class="booking-demo-note">
            * Seluruh jadwal, harga, dan kursi merupakan
            data simulasi proyek KAP
        </p>

    `;


    searchResults
        .querySelectorAll(".choose-train-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                const index = Number(
                    button.dataset.scheduleIndex
                );

                kapSelectedTrain = schedules[index];

                kapSelectedSeats = [];

                kapShowSeatSelection();

            });

        });


    searchResults.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================
   15. SEAT SELECTION
========================================= */

function kapShowSeatSelection() {

    if (!searchResults || !kapSelectedTrain) return;

    const passengerCount = kapCurrentSearch.passengers;

    const train = kapSelectedTrain;


    // Kursi yang sudah terisi dalam simulasi
    const occupiedSeats = [
        "A1", "A4", "B2", "C3",
        "D1", "E4", "F2", "G3",
        "H1", "I4", "J2"
    ];


    let seatHTML = "";


    for (let row = 1; row <= 10; row++) {

        seatHTML += `<div class="seat-row">`;

        seatHTML += `<span class="seat-row-number">${row}</span>`;


        ["A", "B", "C", "D"].forEach((column, index) => {

            if (index === 2) {

                seatHTML += `<span class="seat-aisle"></span>`;

            }

            const seatCode = `${column}${row}`;

            const occupied = occupiedSeats.includes(seatCode);

            seatHTML += `

                <button
                    type="button"
                    class="seat ${occupied ? "occupied" : "available"}"
                    data-seat="${seatCode}"
                    ${occupied ? "disabled" : ""}
                    aria-label="Kursi ${seatCode}">

                    ${seatCode}

                </button>

            `;

        });


        seatHTML += `</div>`;

    }


    searchResults.innerHTML = `

        <div class="seat-section">

            <div class="seat-heading">

                <span class="section-label">
                    SELECT YOUR SEAT
                </span>

                <h3>Pilih Kursi Anda</h3>

                <p>
                    ${kapEscapeHTML(train.name)}
                    · ${kapEscapeHTML(train.code)}
                </p>

                <p>
                    ${kapEscapeHTML(train.origin)}
                     ${kapEscapeHTML(train.destination)}
                </p>

            </div>


            <div class="seat-legend">

                <span>
                    <i class="legend-available"></i>
                    Tersedia
                </span>

                <span>
                    <i class="legend-selected"></i>
                    Dipilih
                </span>

                <span>
                    <i class="legend-occupied"></i>
                    Terisi
                </span>

            </div>


            <div class="seat-map">

                <div class="seat-driver">
                     BAGIAN DEPAN KERETA
                </div>

                <div class="seat-list">

                    ${seatHTML}

                </div>

            </div>


            <div class="seat-selection-info">

                <p>
                    Kursi dipilih:
                    <strong id="selectedSeatText">Belum ada</strong>
                </p>

                <p>
                    Jumlah kursi:
                    <strong>
                        <span id="selectedSeatCount">0</span>
                        / ${passengerCount}
                    </strong>
                </p>

            </div>


            <button
                type="button"
                class="booking-submit"
                id="confirmSeats">

                Lanjutkan ke Data Penumpang 

            </button>


            <button
                type="button"
                class="back-booking-btn"
                id="backToSchedules">

                 Kembali ke Jadwal

            </button>

        </div>

    `;


    kapBindSeatEvents();

    document.getElementById("backToSchedules")
        .addEventListener("click", kapRenderSearchResults);


    document.getElementById("confirmSeats")
        .addEventListener("click", () => {

            if (kapSelectedSeats.length !== passengerCount) {

                kapShowToast(
                    `Pilih tepat ${passengerCount} kursi.`,
                    "error"
                );

                return;

            }

            kapShowPassengerForm();

        });


    searchResults.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================
   16. SEAT EVENT HANDLER
========================================= */

function kapBindSeatEvents() {

    const seatButtons = document.querySelectorAll(
        ".seat.available"
    );

    seatButtons.forEach(button => {

        button.addEventListener("click", () => {

            const seatCode = button.dataset.seat;

            const passengerCount = kapCurrentSearch.passengers;


            if (kapSelectedSeats.includes(seatCode)) {

                kapSelectedSeats =
                    kapSelectedSeats.filter(seat => seat !== seatCode);

                button.classList.remove("selected");

            } else {

                if (kapSelectedSeats.length >= passengerCount) {

                    kapShowToast(
                        "Jumlah kursi sudah sesuai jumlah penumpang.",
                        "error"
                    );

                    return;

                }

                kapSelectedSeats.push(seatCode);

                button.classList.add("selected");

            }


            const seatText = document.getElementById(
                "selectedSeatText"
            );

            const seatCount = document.getElementById(
                "selectedSeatCount"
            );


            if (seatText) {

                seatText.textContent =
                    kapSelectedSeats.length
                        ? kapSelectedSeats.join(", ")
                        : "Belum ada";

            }


            if (seatCount) {

                seatCount.textContent =
                    kapSelectedSeats.length;

            }

        });

    });

}
/* =========================================
   KAP - BOOKING SYSTEM
   PART 2: PASSENGER, PAYMENT & E-TICKET
========================================= */


/* =========================================
   17. PASSENGER FORM
========================================= */

function kapShowPassengerForm() {

    if (!searchResults || !kapSelectedTrain) return;

    const passengerCount = kapCurrentSearch.passengers;


    let passengerFields = "";


    for (let i = 0; i < passengerCount; i++) {

        passengerFields += `

            <div class="passenger-card">

                <h4>Penumpang ${i + 1}</h4>

                <div class="form-group">

                    <label for="passengerName${i}">
                        Nama Lengkap
                    </label>

                    <input
                        type="text"
                        id="passengerName${i}"
                        name="passengerName${i}"
                        placeholder="Masukkan nama lengkap"
                        maxlength="80"
                        required>

                </div>


                <div class="form-group">

                    <label for="passengerIdentity${i}">
                        JENIS KELAMIN
                    </label>

                    <input
                        type="text"
                        id="passengerIdentity${i}"
                        name="passengerIdentity${i}"
                        placeholder="Masukkan jenis kelamin"
                        maxlength="30"
                        required>

                </div>


                <div class="form-group">

                    <label for="passengerSeat${i}">
                        Nomor Kursi
                    </label>

                    <input
                        type="text"
                        value="${kapEscapeHTML(kapSelectedSeats[i])}"
                        readonly>

                </div>

            </div>

        `;

    }


    searchResults.innerHTML = `

        <div class="passenger-section">

            <span class="section-label">
                PASSENGER INFORMATION
            </span>

            <h3>Data Penumpang</h3>

            <p>
                Lengkapi informasi penumpang untuk
                melanjutkan pemesanan.
            </p>


            <form id="passengerForm">

                ${passengerFields}


                <div class="form-group">

                    <label for="contactPhone">
                        Nomor Telepon (opsional)
                    </label>

                    <input
                        type="tel"
                        id="contactPhone"
                        placeholder="Contoh: 081234567890"
                        maxlength="20">

                </div>


                <div class="passenger-actions">

                    <button
                        type="button"
                        class="back-booking-btn"
                        id="backToSeats">

                         Kembali ke Kursi

                    </button>


                    <button
                        type="submit"
                        class="booking-submit">

                        Lanjutkan ke Ringkasan 

                    </button>

                </div>

            </form>

        </div>

    `;


    document.getElementById("backToSeats")
        .addEventListener("click", kapShowSeatSelection);


    document.getElementById("passengerForm")
        .addEventListener("submit", event => {

            event.preventDefault();

            kapPassengerData = [];


            for (let i = 0; i < passengerCount; i++) {

                const name = document.getElementById(
                    `passengerName${i}`
                ).value.trim();

                const identity = document.getElementById(
                    `passengerIdentity${i}`
                ).value.trim();


                if (!name || !identity) {

                    kapShowToast(
                        "Lengkapi seluruh data penumpang.",
                        "error"
                    );

                    return;

                }


                kapPassengerData.push({

                    name: name,

                    identity: identity,

                    seat: kapSelectedSeats[i]

                });

            }


            const phone = document.getElementById(
                "contactPhone"
            ).value.trim();


            kapCurrentSearch.phone = phone;


            kapShowBookingSummary();

        });


    searchResults.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================
   18. BOOKING SUMMARY
========================================= */

function kapShowBookingSummary() {

    if (!searchResults || !kapSelectedTrain) return;

    const train = kapSelectedTrain;

    const totalPrice =
        train.price * kapCurrentSearch.passengers;


    const passengerList = kapPassengerData.map((person, index) => {

        return `

            <div class="summary-passenger">

                <span>${index + 1}. ${kapEscapeHTML(person.name)}</span>

                <strong>
                    Kursi ${kapEscapeHTML(person.seat)}
                </strong>

            </div>

        `;

    }).join("");


    searchResults.innerHTML = `

        <div class="booking-summary">

            <span class="section-label">
                BOOKING SUMMARY
            </span>

            <h3>Ringkasan Pemesanan</h3>

            <p>Periksa kembali informasi perjalanan Anda.</p>


            <div class="summary-route">

                <div>
                    <span>DARI</span>
                    <strong>${kapEscapeHTML(train.origin)}</strong>
                    <small>${kapEscapeHTML(train.departure)}</small>
                </div>

                <span class="summary-arrow">→</span>

                <div>
                    <span>KE</span>
                    <strong>${kapEscapeHTML(train.destination)}</strong>
                    <small>${kapEscapeHTML(train.arrival)}</small>
                </div>

            </div>


            <div class="summary-details">

                <div>
                    <span>Nama Kereta</span>
                    <strong>${kapEscapeHTML(train.name)}</strong>
                </div>

                <div>
                    <span>Kode Kereta</span>
                    <strong>${kapEscapeHTML(train.code)}</strong>
                </div>

                <div>
                    <span>Tanggal</span>
                    <strong>
                        ${kapEscapeHTML(
                            kapFormatDate(kapCurrentSearch.date)
                        )}
                    </strong>
                </div>

                <div>
                    <span>Kelas</span>
                    <strong>${kapEscapeHTML(train.class)}</strong>
                </div>

                <div>
                    <span>Jumlah Penumpang</span>
                    <strong>${kapCurrentSearch.passengers} orang</strong>
                </div>

                <div>
                    <span>Nomor Kursi</span>
                    <strong>
                        ${kapEscapeHTML(kapSelectedSeats.join(", "))}
                    </strong>
                </div>

            </div>


            <div class="summary-passengers">

                <h4>Informasi Penumpang</h4>

                ${passengerList}

            </div>


            <div class="summary-total">

                <span>Total Pembayaran</span>

                <strong>
                    ${kapFormatBookingPrice(totalPrice)}
                </strong>

            </div>


            <div class="summary-disclaimer">

                Ini merupakan transaksi simulasi.
                Tidak ada uang yang ditagihkan.

            </div>


            <div class="summary-actions">

                <button
                    type="button"
                    class="back-booking-btn"
                    id="backToPassenger">

                    Kembali

                </button>


                <button
                    type="button"
                    class="booking-submit"
                    id="continuePayment">

                    Lanjutkan Pembayaran 

                </button>

            </div>

        </div>

    `;


    document.getElementById("backToPassenger")
        .addEventListener("click", kapShowPassengerForm);


    document.getElementById("continuePayment")
        .addEventListener("click", () => { kapShowPayment()});


    searchResults.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================
   19. PAYMENT SECTION
========================================= */

function kapShowPayment() {

    if (!searchResults || !kapSelectedTrain) return;

    const totalPrice =
        kapSelectedTrain.price * kapCurrentSearch.passengers;


    searchResults.innerHTML = `

        <div class="payment-section">

            <span class="section-label">
                PAYMENT SIMULATION
            </span>

            <h3>Pilih Metode Pembayaran</h3>

            <p>
                Pilih metode pembayaran untuk menyelesaikan
                simulasi pemesanan tiket.
            </p>


            <div class="payment-total">

                <span>Total Pembayaran</span>

                <strong>
                    ${kapFormatBookingPrice(totalPrice)}
                </strong>

            </div>


            <form id="paymentForm">

                <label class="payment-option">

                    <input
                        type="radio"
                        name="paymentMethod"
                        value="Virtual Account"
                        checked>

                    <span class="payment-option-content">

                        <strong>Virtual Account</strong>

                        <small>Simulasi pembayaran melalui nomor virtual account</small>

                    </span>

                </label>


                <label class="payment-option">

                    <input
                        type="radio"
                        name="paymentMethod"
                        value="QRIS">

                    <span class="payment-option-content">

                        <strong>QRIS</strong>

                        <small>Simulasi pembayaran menggunakan QR</small>

                    </span>

                </label>


                <label class="payment-option">

                    <input
                        type="radio"
                        name="paymentMethod"
                        value="Transfer Bank">

                    <span class="payment-option-content">

                        <strong>Transfer Bank</strong>

                        <small>Simulasi transfer melalui bank</small>

                    </span>

                </label>


                <p class="payment-disclaimer">

                    PERHATIAN: Pembayaran ini hanya simulasi.
                    Jangan memasukkan informasi rekening,
                    kartu, PIN, atau kode keamanan.
                    Tidak ada transaksi keuangan sungguhan.

                </p>


                <button
                    type="submit"
                    class="booking-submit"
                    id="payNow">

                    Konfirmasi Pembayaran Simulasi

                </button>

            </form>


            <button
                type="button"
                class="back-booking-btn"
                id="backToSummary">

                 Kembali ke Ringkasan

            </button>

        </div>

    `;


    document.getElementById("backToSummary")
        .addEventListener("click", kapShowBookingSummary);


    document.getElementById("paymentForm")
        .addEventListener("submit", event => {

            event.preventDefault();

            const method = document.querySelector(
                'input[name="paymentMethod"]:checked'
            ).value;

            kapProcessPayment(method);

        });


    searchResults.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================
   20. PAYMENT SIMULATION
========================================= */

function kapProcessPayment(method) {

    const payButton = document.getElementById("payNow");

    if (!payButton) return;

    payButton.disabled = true;

    payButton.textContent = "Memproses Simulasi...";


    setTimeout(() => {

        const bookingCode =
            "KAP" + Date.now().toString().slice(-8);


        kapFinalBooking = {

            code: bookingCode,

            date: kapCurrentSearch.date,

            origin: kapSelectedTrain.origin,

            destination: kapSelectedTrain.destination,

            train: kapSelectedTrain.name,

            trainCode: kapSelectedTrain.code,

            departure: kapSelectedTrain.departure,

            arrival: kapSelectedTrain.arrival,

            duration: kapSelectedTrain.duration,

            class: kapSelectedTrain.class,

            price: kapSelectedTrain.price,

            passengers: kapPassengerData,

            seats: kapSelectedSeats,

            paymentMethod: method,

            total:
                kapSelectedTrain.price *
                kapCurrentSearch.passengers,

            status: "SIMULATED_SUCCESS"

        };


        try {

            localStorage.setItem(
                KAP_BOOKING_STORAGE,
                JSON.stringify(kapFinalBooking)
            );

        } catch (error) {

            console.warn(
                "Data booking tidak dapat disimpan.",
                error
            );

        }


        kapShowETicket();

    }, 1200);

}


/* =========================================
   21. E-TICKET
========================================= */

function kapShowETicket() {

    if (!searchResults || !kapFinalBooking) return;

    const booking = kapFinalBooking;


    const passengerList = booking.passengers.map((person, index) => {

        return `

            <div class="ticket-passenger">

                <span>${index + 1}. ${kapEscapeHTML(person.name)}</span>

                <strong>
                    Kursi ${kapEscapeHTML(person.seat)}
                </strong>

            </div>

        `;

    }).join("");


    searchResults.innerHTML = `

        <div class="eticket-section">

            <div class="ticket-success">

                <span class="ticket-success-icon">✓</span>

                <h3>Pemesanan Berhasil!</h3>

                <p>
                     pemesanan tiket KAP telah selesai.
                </p>

            </div>


            <div class="eticket-card" id="printableTicket">

                <div class="ticket-header">

                    <div class="ticket-brand">

                        <strong>KAP</strong>

                        <span>KERETA API PRATAMA</span>

                    </div>

                    <span class="ticket-status">
                        DEMO TICKET
                    </span>

                </div>


                <div class="ticket-code">

                    <span>KODE PEMESANAN</span>

                    <strong>
                        ${kapEscapeHTML(booking.code)}
                    </strong>

                </div>


                <div class="ticket-route">

                    <div>

                        <span>STASIUN ASAL</span>

                        <strong>
                            ${kapEscapeHTML(booking.origin)}
                        </strong>

                        <b>${kapEscapeHTML(booking.departure)}</b>

                    </div>


                    <div class="ticket-route-line">
                        <span></span>
                        <i></i>
                        <small>
                            ${kapEscapeHTML(booking.duration)}
                        </small>
                    </div>


                    <div>

                        <span>STASIUN TUJUAN</span>

                        <strong>
                            ${kapEscapeHTML(booking.destination)}
                        </strong>

                        <b>${kapEscapeHTML(booking.arrival)}</b>

                    </div>

                </div>


                <div class="ticket-details">

                    <div>

                        <span>Nama Kereta</span>

                        <strong>
                            ${kapEscapeHTML(booking.train)}
                        </strong>

                    </div>

                    <div>

                        <span>Kode Kereta</span>

                        <strong>
                            ${kapEscapeHTML(booking.trainCode)}
                        </strong>

                    </div>

                    <div>

                        <span>Tanggal</span>

                        <strong>
                            ${kapEscapeHTML(
                                kapFormatDate(booking.date)
                            )}
                        </strong>

                    </div>

                    <div>

                        <span>Kelas</span>

                        <strong>
                            ${kapEscapeHTML(booking.class)}
                        </strong>

                    </div>

                    <div>

                        <span>Metode Pembayaran</span>

                        <strong>
                            ${kapEscapeHTML(booking.paymentMethod)}
                        </strong>

                    </div>

                    <div>

                        <span>Total Simulasi</span>

                        <strong>
                            ${kapFormatBookingPrice(booking.total)}
                        </strong>

                    </div>

                </div>


                <div class="ticket-passengers">

                    <h4>Data Penumpang</h4>

                    ${passengerList}

                </div>


                <div class="ticket-qr-area">

                    <div id="ticketQRCode"></div>

                    <p>
                        QR Code simulasi pemesanan
                    </p>

                </div>


                <div class="ticket-footer">

                    KAP — YOUR SAFETY IS OUR PRIORITY

                </div>

            </div>


            <div class="ticket-demo-warning">

                <strong>CATATAN</strong>

                <p>
                    E-ticket ini dibuat untuk demonstrasi
                    website KAP. Bukan tiket perjalanan resmi,
                    tidak berlaku untuk keberangkatan kereta,
                    dan tidak dapat digunakan untuk naik kereta.
                </p>

            </div>


            <div class="ticket-actions">

                <button
                    type="button"
                    class="booking-submit"
                    id="printTicket">

                    Cetak / Simpan PDF

                </button>


                <button
                    type="button"
                    class="back-booking-btn"
                    id="newBooking">

                    Buat Pemesanan Baru

                </button>

            </div>

        </div>

    `;


    kapGenerateQRCode(booking);


    document.getElementById("printTicket")
        .addEventListener("click", kapPrintTicket);


    document.getElementById("newBooking")
        .addEventListener("click", kapResetBooking);


    searchResults.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================
   22. GENERATE QR CODE
========================================= */

function kapGenerateQRCode(booking) {

    const qrContainer = document.getElementById("ticketQRCode");

    if (!qrContainer) return;


    if (typeof QRCode === "undefined") {

        qrContainer.textContent = "QR Code tidak tersedia.";

        return;

    }


    const qrData = JSON.stringify({

        project: "KAP",

        type: "SIMULATED_TICKET",

        bookingCode: booking.code,

        train: booking.trainCode,

        date: booking.date,

        seats: booking.seats

    });


    new QRCode(qrContainer, {

        text: qrData,

        width: 150,

        height: 150,

        colorDark: "#102D50",

        colorLight: "#ffffff",

        correctLevel: QRCode.CorrectLevel.M

    });

}


/* =========================================
   23. PRINT TICKET
========================================= */

function kapPrintTicket() {

    const ticket = document.getElementById(
        "printableTicket"
    );

    if (!ticket) return;


    const printWindow = window.open(
        "",
        "_blank",
        "width=850,height=750"
    );

    if (!printWindow) {

        kapShowToast(
            "Izinkan pop-up untuk mencetak tiket.",
            "error"
        );

        return;

    }


    const ticketHTML = ticket.outerHTML;

    const printStyles = `

        <style>

            * {
                box-sizing: border-box;
            }

            body {
                font-family: Arial, sans-serif;
                padding: 25px;
                color: #102D50;
            }

            .eticket-card {
                max-width: 700px;
                margin: auto;
                border: 1px solid #ddd;
                border-radius: 14px;
                padding: 25px;
            }

            .ticket-header,
            .ticket-route,
            .ticket-details,
            .ticket-passenger {
                display: flex;
                justify-content: space-between;
                gap: 15px;
            }

            .ticket-brand strong {
                display: block;
                font-size: 28px;
                font-weight: bold;
            }

            .ticket-brand span,
            .ticket-code span,
            .ticket-route span,
            .ticket-details span {
                display: block;
                font-size: 10px;
                color: #777;
            }

            .ticket-code,
            .ticket-route,
            .ticket-details,
            .ticket-passengers,
            .ticket-qr-area {
                margin-top: 25px;
                padding-top: 15px;
                border-top: 1px dashed #ccc;
            }

            .ticket-code strong {
                font-size: 22px;
            }

            .ticket-route strong {
                display: block;
                margin: 8px 0;
                font-size: 17px;
            }

            .ticket-route b {
                font-size: 20px;
            }

            .ticket-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }

            .ticket-details strong {
                display: block;
                margin-top: 6px;
            }

            .ticket-passenger {
                padding: 10px 0;
                border-bottom: 1px solid #eee;
            }

            .ticket-qr-area {
                text-align: center;
            }

            #ticketQRCode {
                display: flex;
                justify-content: center;
            }

            .ticket-footer {
                margin-top: 25px;
                text-align: center;
                font-size: 11px;
            }

            @media print {
                body {
                    padding: 0;
                }

                .eticket-card {
                    border: 1px solid #ccc;
                }
            }

        </style>

    `;


    printWindow.document.open();

    printWindow.document.write(`

        <!DOCTYPE html>

        <html lang="id">

        <head>

            <meta charset="UTF-8">

            <title>KAP Demo Ticket</title>

            ${printStyles}

        </head>

        <body>

            ${ticketHTML}

            <script>

                window.onload = function() {

                    setTimeout(function() {

                        window.print();

                    }, 500);

                };

            <\/script>

        </body>

        </html>

    `);

    printWindow.document.close();

}


/* =========================================
   24. RESET BOOKING
========================================= */

function kapResetBooking() {

    kapCurrentSearch = null;

    kapSelectedTrain = null;

    kapSelectedSeats = [];

    kapPassengerData = [];

    kapFinalBooking = null;


    try {

        localStorage.removeItem(KAP_BOOKING_STORAGE);

    } catch (error) {

        console.warn("Gagal menghapus data booking.", error);

    }


    if (origin) origin.value = "";

    if (destination) destination.value = "";


    kapInitializeDate();


    if (passengers) passengers.value = "1";


    if (searchResults) {

        searchResults.innerHTML = "";

    }


    if (bookingForm) {

        bookingForm.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }


    kapShowToast(
        "Siap untuk pemesanan baru."
    );

}


/* =========================================
   25. SYSTEM READY
========================================= */

console.log("KAP Booking System Loaded");

console.log(
    "Booking features: Search, Schedule, Seat, Passenger, Payment and E-Ticket."
);

console.log(
    "All booking and payment processes are simulations."
);