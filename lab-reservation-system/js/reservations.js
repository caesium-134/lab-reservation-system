// handle all reservation functions 
 let currentWeekOffset = 0; // this week 
let selectedSeat = null; 

window.addEventListener('load', () => {
    checkAuth(); // ref auth.js
    loadReservationCalendar(); 
})

/* param offset - shifts which week's dates are returned, relative to the var today
    formula : offset * 7 - moves the start date forward/backward by that many weeks
        offset = 0 - returns dates starting from 'today' 
        offset = 1 - returns dates starting from next week 
        offset = -1 - returns dates starting from last week 
        offset = 2 - two weeks into the future
*/
function getWeekDates(offset){
    const today = new Date(); 
    // getDate is predefined - returns the day of the month for this date according to local time (js doc)
    const startDate = newDate(today); 
    startDate.setDate(today.getDate() + (offset * 7));
    
    // populate dates arr
    const dates = [];  
    for(let i = 0; i < 7; i++){
        const date = new Date(startDate); 
        date.setDate(startDate.getDate() + i); 
        dates.push(date); 
    }
}

// reservation.html usage
function changeWeek(direction){
    currentWeekOffset += direction; 
    loadReservationCalendar(); 
}

async function loadReservationCalendar(){
    const weekDates = getWeekDates(currentWeekOffset); 
    const labDays = await getLabDays(); // wait for lab day data 
    const reservations = await getReservations(); // wait for prev reservation data 

    // update week display
    const weekDisplay = document.getElementById('week-display'); 
    const startDate = weekDates[0].toLocaleDateString(); 
    weekDisplay.textContent = `${startDate} - ${endDate}`;
    
    // build reservation calendar 
    const calendar = document.getElementById('reservation-calendar'); 
    calendar.innerHTML = ''; 

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday']
}

