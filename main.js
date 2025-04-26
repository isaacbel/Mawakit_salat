// Get HTML elements by their IDs
let timeId = document.getElementById("TIME");
let dateId = document.getElementById("dateId");
let select = document.getElementById("select");
let cityName = document.getElementById("city-name");
let chosenTime = document.querySelector(".chosenTime");
let Cards = document.getElementsByClassName("card");

// Set up a timer to update the time every second
setInterval(() => {
  let current = new Date();

  // Extract hours, minutes, and seconds
  let hr = String(current.getHours()).padStart(2, '0'); // Add leading zero
  let min = String(current.getMinutes()).padStart(2, '0');
  let sec = String(current.getSeconds()).padStart(2, '0');

  // Update the time display
  timeId.innerHTML = `<h1>${hr}:${min}:${sec}</h1>`;
}, 1000);

// Create a new Date object for the current date
const currentDate = new Date();
const monthNames = [
  'Jan', 'Feb', 'Mas', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Extract the day, month, and year
const day = String(currentDate.getDate()).padStart(2, '0');
const month = monthNames[currentDate.getMonth()];
const year = currentDate.getFullYear();

// Format the date and update the display
const formattedDate = `<p>${day} ${month} ${year}</p>`;
dateId.innerHTML = formattedDate;

// Define cities for the select dropdown
const cities = ["Jijel", "Alger", "Annaba", "Blida", "Béjaïa", "Oran", "Sétif", "Tizi Ouzou"];
let options = cities.map(city => `<option>${city}</option>`).join("");
select.innerHTML = options;
getPrayerTime("Jijel");

// Event listener for changing the selected city
select.addEventListener("change", () => {
  let selectedCity = select.value;
  cityName.innerHTML = selectedCity;
  getPrayerTime(selectedCity);
});

// Function to get prayer times for the selected city
// Function to get prayer times for the selected city
function getPrayerTime(city) {
  let params = {
    country: "DZ",
    city: city
  };

  // Make API request to fetch prayer times
  axios.get('https://api.aladhan.com/v1/timingsByCity', {
    params: params
  })
  .then((response) => {
    const timings = response.data.data.timings;
    fillTimeForPrayer("fajr-time", timings.Fajr);
    fillTimeForPrayer("dhuhr-time", timings.Dhuhr);
    fillTimeForPrayer("asr-time", timings.Asr);
    fillTimeForPrayer("maghrib-time", timings.Maghrib);
    fillTimeForPrayer("isha-time", timings.Isha);
    fillTimeForPrayer("time", timings.Sunrise);
 
    // Create an array of prayer times in minutes
    let timePrayArray = [
      { name: "Fajr", time: timings.Fajr },
      { name: "Dhuhr", time: timings.Dhuhr },
      { name: "Asr", time: timings.Asr },
      { name: "Maghrib", time: timings.Maghrib },
      { name: "Isha", time: timings.Isha }
    ];

    const now = new Date();
    const nowInMinutes = now.getHours() * 60 + now.getMinutes();

    // Find the next prayer time
    let nextPrayer = timePrayArray.find(prayer => {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTimeInMinutes = hours * 60 + minutes;
      return prayerTimeInMinutes > nowInMinutes;
    }) || timePrayArray[0]; // Default to the first prayer of the next day if no upcoming prayer is found

    // Calculate the difference in minutes
    const [nextHours, nextMinutes] = nextPrayer.time.split(':').map(Number);
    let nextPrayerInMinutes = nextHours * 60 + nextMinutes;

    // Adjust for the next day if needed
    if (nextPrayerInMinutes < nowInMinutes) {
      nextPrayerInMinutes += 24 * 60;
    }

    let timeDiff = nextPrayerInMinutes - nowInMinutes;

    // Convert timeDiff (in minutes) to a string in "HH:MM" format
    let hours = Math.floor(timeDiff / 60);
    let minutes = timeDiff % 60;
    let str = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    // Update the text with the next prayer and time difference
    document.querySelector('.rest-time-pray').textContent = `${nextPrayer.name} in ${str}`;

    // Remove 'close' class from all cards first
    Array.from(Cards).forEach(card => card.classList.remove('close'));

    // Add 'close' class to the next prayer's card
    let nextIndex = timePrayArray.indexOf(nextPrayer);
    Cards[nextIndex].classList.add('close');

  })
  .catch(error => {
    console.error("Error fetching prayer times:", error);
    alert("Failed to fetch prayer times. Please try again later.");
  });
}


// Function to update prayer times in the HTML
function fillTimeForPrayer(id, timing) {
  document.getElementById(id).innerHTML = timing;
}
