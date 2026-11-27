/* =========================================
   KAP - TRAIN SCHEDULES
   DATA JADWAL SIMULASI
========================================= */

/*
   Catatan:
   Seluruh jadwal, nama kereta, harga, dan
   jumlah kursi merupakan data simulasi
   untuk proyek website KAP.
*/

/* ===== KONFIGURASI KERETA ===== */

const KAP_TRAIN_TYPES = [
    {
        name: "KAP Regional Express",
        class: "Ekonomi",
        departure: "06:30",
        duration: 75,
        price: 45000
    },
    {
        name: "KAP Premium",
        class: "Eksekutif",
        departure: "09:00",
        duration: 65,
        price: 85000
    }
];


/* ===== FUNGSI FORMAT WAKTU ===== */

function kapAddMinutes(time, minutes) {
    const [hours, mins] = time.split(":").map(Number);

    const totalMinutes = (hours * 60) + mins + minutes;

    const finalHours = Math.floor(totalMinutes / 60) % 24;
    const finalMinutes = totalMinutes % 60;

    return (
        String(finalHours).padStart(2, "0") +
        ":" +
        String(finalMinutes).padStart(2, "0")
    );
}


/* ===== FUNGSI DURASI ===== */

function kapFormatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
        return `${remainingMinutes} menit`;
    }

    return `${hours}j ${String(remainingMinutes).padStart(2, "0")}m`;
}


/* ===== DATABASE JADWAL ===== */

const KAP_SCHEDULES = [];


/* ===== GENERATE JADWAL SETIAP RUTE ===== */

KAP_ROUTES.forEach(([origin, destination], index) => {

    const routeNumber = index + 1;

    // Durasi simulasi berbeda untuk setiap rute
    const firstDuration = 55 + (index * 17) % 180;
    const secondDuration = firstDuration + 15;

    // Harga simulasi
    const firstPrice = 35000 + (index * 12500);
    const secondPrice = firstPrice + 40000;

    // Jadwal kereta pertama
    const firstDeparture = "06:30";

    KAP_SCHEDULES.push({
        origin: origin,
        destination: destination,

        name: "KAP Regional Express",

        code: `KAP-${String(100 + routeNumber * 2).padStart(3, "0")}`,

        departure: firstDeparture,

        arrival: kapAddMinutes(
            firstDeparture,
            firstDuration
        ),

        duration: kapFormatDuration(firstDuration),

        class: "Ekonomi",

        price: firstPrice,

        seats: 25 + (index % 20)
    });


    // Jadwal kereta kedua
    const secondDeparture = "13:00";

    KAP_SCHEDULES.push({
        origin: origin,
        destination: destination,

        name: "KAP Premium",

        code: `KAP-${String(101 + routeNumber * 2).padStart(3, "0")}`,

        departure: secondDeparture,

        arrival: kapAddMinutes(
            secondDeparture,
            secondDuration
        ),

        duration: kapFormatDuration(secondDuration),

        class: "Eksekutif",

        price: secondPrice,

        seats: 15 + (index % 15)
    });

});


/* ===== PENCARIAN JADWAL ===== */

function kapFindSchedules(origin, destination) {

    return KAP_SCHEDULES.filter(schedule => {

        const sameDirection =
            schedule.origin === origin &&
            schedule.destination === destination;

        const reverseDirection =
            schedule.origin === destination &&
            schedule.destination === origin;

        return sameDirection || reverseDirection;

    });

}


/* ===== INFORMASI JUMLAH JADWAL ===== */

console.log("KAP Schedule System Loaded");

console.log(
    `Total rute: ${KAP_ROUTES.length}`
);

console.log(
    `Total jadwal simulasi: ${KAP_SCHEDULES.length}`
);