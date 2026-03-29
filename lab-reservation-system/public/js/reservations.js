let currentWeekOffset = 0;
let selectedSlot = null;

function getCurrentUser() {
    return { id: 1, name: currentUser.name };
}

async function getReserveDays() {
    const today = new Date();
    const fmt = d => d.toISOString().split('T')[0];

    const days = [];
    for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dow = d.getDay();

        if (dow === 0) continue;

        days.push({
            date: fmt(d),
            timeslot: '7:30 - 9:00',
            available_seats: { A: [1,2,3,4,5,6,7,8,9], B: [10,11,12,13,14,15,16,17,18]}
        });
        days.push({
            date: fmt(d),
            timeslot: '11:00 - 12:30',
            available_seats: { A: [1,2,3,4,5,6,7,8,9], B: [10,11,12,13,14,15,16,17,18] }
        });
    }
    return days;
}

async function getReservations() {
    try {
        const res = await fetch("/api/reservations");
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        return [];
    }
}

async function createReservation(data) {
    try {
        const res = await fetch("/reservation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return await res.json();
    } catch (e) {
        return { success: false };
    }
}

function getWeekDates(offset) {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + offset * 7);

    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dates.push(date);
    }
    return dates;
}

function changeWeek(direction) {
    currentWeekOffset += direction;
    loadReservationCalendar();
}

async function loadReservationCalendar() {
    const weekDates    = getWeekDates(currentWeekOffset);
    const reserveDays  = await getReserveDays();           
    const reservations = await getReservations();           

    const weekDisplay = document.getElementById('week-display');
    const startDate = weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const endDate   = weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    weekDisplay.textContent = `${startDate} – ${endDate}`;

    const calendar = document.getElementById('reservation-calendar');
    calendar.innerHTML = '';

    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    weekDates.forEach(date => {
        const dateStr = date.toISOString().split('T')[0];
        const dayName = dayNames[date.getDay()];

        const daySchedules = reserveDays.filter(rd => rd.date === dateStr);
        if (daySchedules.length === 0) return;

        const dayDiv = document.createElement('div');
        dayDiv.className = 'day-schedule';              

        const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        dayDiv.innerHTML = `
            <div class="day-head">
                <span class="day-name">${dayName}</span>
                <span class="day-date">${formattedDate}</span>
            </div>`;

        daySchedules.forEach(schedule => {
            const timeslotDiv = document.createElement('div');
            timeslotDiv.className = 'timeslot';
            timeslotDiv.innerHTML = `
                <div class="timeslot-row">
                    <span class="timeslot-time">Time: ${schedule.timeslot}</span>
                </div>`;
            dayDiv.appendChild(timeslotDiv);

            const seatGridDiv = document.createElement('div');
            seatGridDiv.className = 'seat-grid';

            const sections = schedule.available_seats;    
            Object.entries(sections).forEach(([sectionLabel, seats]) => {
                const sectionDiv = document.createElement('div');
                sectionDiv.className = 'seat-section';
                sectionDiv.innerHTML = `<div class="seat-section-label">Section ${sectionLabel}</div>`;

                const sectionGrid = document.createElement('div');
                sectionGrid.className = 'seat-section-grid';

                seats.forEach(seatNum => {
                    const isOccupied = reservations.some(r =>
                        r.date     === dateStr &&
                        r.timeslot === schedule.timeslot &&
                        r.seat     === seatNum             
                    );

                    const occupant = reservations.find(r =>
                        r.date === dateStr && r.timeslot === schedule.timeslot && r.seat === seatNum
                    );

                    if (isOccupied) {
                        const span = document.createElement('span');
                        span.className = 'seat-slot seat-occupied';
                        span.textContent = occupant?.user || `Seat ${String(seatNum).padStart(2,'0')}`;
                        sectionGrid.appendChild(span);
                    } else {
                        const uid = `cb-${dateStr}-${schedule.timeslot.replace(/[: ]/g,'')}-s${seatNum}`;

                        const cb = document.createElement('input');
                        cb.type      = 'checkbox';
                        cb.id        = uid;
                        cb.className = 'seat-cb';

                        const lbl = document.createElement('label');
                        lbl.htmlFor   = uid;
                        lbl.className = 'seat-slot seat-available';
                        lbl.textContent = `Seat ${String(seatNum).padStart(2,'0')}`;

                        const modalDiv = document.createElement('div');
                        modalDiv.className = 'booking-modal';
                        modalDiv.innerHTML = `
                            <div class="modal-card">
                                <div class="modal-title">Confirm Reservation</div>
                                <dl>
                                    <div class="modal-row"><dt>Date</dt><dd>${formattedDate}</dd></div>
                                    <div class="modal-row"><dt>Time</dt><dd>${schedule.timeslot}</dd></div>
                                    <div class="modal-row"><dt>Seat</dt><dd>${seatNum}</dd></div>
                                    <div class="modal-row"><dt>Member</dt><dd>${getCurrentUser().name}</dd></div>
                                </dl>
                                <div class="modal-actions">
                                    <label for="${uid}" class="btn-close-modal">Cancel</label>
                                    <label for="${uid}" class="btn-confirm"
                                        onclick="handleConfirm('${dateStr}','${schedule.timeslot}',${seatNum},'${uid}')">
                                        Confirm
                                    </label>
                                </div>
                            </div>`;

                        const seatWrapper = document.createElement('div');
                        seatWrapper.className = 'seat-wrapper';
                        seatWrapper.appendChild(cb);
                        seatWrapper.appendChild(lbl);
                        seatWrapper.appendChild(modalDiv);
                        sectionGrid.appendChild(seatWrapper);
                    }
                });

                sectionDiv.appendChild(sectionGrid);
                seatGridDiv.appendChild(sectionDiv);
            });

            dayDiv.appendChild(seatGridDiv);
        });

        calendar.appendChild(dayDiv);
    });
}

async function handleConfirm(date, timeslot, seat, checkboxId) {
    const cb = document.getElementById(checkboxId);
    if (cb) cb.checked = false;

    const user = getCurrentUser();
    const result = await createReservation({
        user_id:  user.id,
        date,
        timeslot,
        seat                                              
    });

    if (result.success) {
        alert(`Reservation confirmed!\n${date}  |  ${timeslot}  |  Seat ${seat}`);
        loadReservationCalendar();
    } else {
        alert('Failed to create reservation. Please try again.');
    }
}

function filterReservations() {
    const filter     = document.getElementById('day-filter').value;
    const daySchedules = document.querySelectorAll('.day-schedule');

    daySchedules.forEach(schedule => {
        if (filter === 'all') {
            schedule.style.display = 'block';
        } else {
            const heading = schedule.querySelector('.day-name')?.textContent || '';
            schedule.style.display = heading.toLowerCase().startsWith(filter.toLowerCase()) ? 'block' : 'none';
        }
    });
}

function searchSlots() {
    const query = document.getElementById('slot-search').value.toLowerCase();
    const daySchedules = document.querySelectorAll('.day-schedule');

    daySchedules.forEach(schedule => {
        const text = schedule.textContent.toLowerCase();
        schedule.style.display = (!query || text.includes(query)) ? 'block' : 'none';
    });
}


window.addEventListener('load', () => {
    loadReservationCalendar();
});
