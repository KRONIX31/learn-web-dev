// JavaScript для страницы выбора даты и времени.
//
// ЗАДАНИЕ
// ========
// Оживить свою свёрстанную страницу. Скорее всего на ней будет работать:
//   1. При открытии страницы выбрать день по умолчанию.
//   2. По клику на день — день становится выбранным,
//      слоты обновляются.
//   3. По клику на слот — время становится выбранным,
//      попадает в нижнюю панель.
//   4. Стрелки «‹» и «›» листают месяцы.
//   5. Дни раньше «сегодня» нельзя выбрать.
//   6. Нижняя панель обновляется при выборе дня и времени.

// 1. ДАННЫЕ
const DEFAULT_SLOTS = [
    { time: "10:00", available: true },
    { time: "11:30", available: true },
    { time: "13:00", available: false },
    { time: "14:00", available: true },
    { time: "15:30", available: true },
    { time: "17:00", available: true },
    { time: "18:30", available: true }
];

// Расписание для отдельных дней
const SLOTS_BY_DATE = {
    "2026-10-24": [
        { time: "10:00", available: false },
        { time: "11:30", available: false },
        { time: "13:00", available: false },
        { time: "14:30", available: true },
        { time: "16:00", available: false },
        { time: "17:30", available: true },
        { time: "18:30", available: true },
        { time: "19:30", available: true }
    ],
    "2026-10-25": [
        { time: "10:00", available: false },
        { time: "11:00", available: true },
        { time: "12:00", available: true },
        { time: "14:00", available: true },
        { time: "16:00", available: true },
        { time: "17:00", available: false }
    ],
    "2026-10-26": []
};

const today = new Date();
today.setHours(0, 0, 0, 0);


// 2. СОСТОЯНИЕ
const state = {
    year: today.getFullYear(),
    month: today.getMonth(),
    selectedDate: new Date(today),
    selectedTime: null
};

const monthTitle = document.querySelector(".calendar__month");
const calendarDays = document.querySelector(".calendar__days");
const arrows = document.querySelectorAll(".calendar__arrow");
const slotsSubtitle = document.querySelector(".time-slots__subtitle");
const slotsGrid = document.querySelector(".time-slots__grid");
const summaryDateTime = document.querySelector(".summary__datetime");


// 3. ФУНКЦИИ ДЛЯ РАБОТЫ С ДАТАМИ
function dateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function buildCalendarGrid(year, month) {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Неделя начинается с понедельника
    const offset = (firstDay.getDay() + 6) % 7;
    const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;
    const firstCell = new Date(year, month, 1 - offset);
    const cells = [];

    for (let i = 0; i < totalCells; i++) {
        const date = new Date(
            firstCell.getFullYear(),
            firstCell.getMonth(),
            firstCell.getDate() + i
        );

        cells.push({
            date,
            day: date.getDate(),
            otherMonth: date.getMonth() !== month
        });
    }

    const weeks = [];

    for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
    }

    return weeks;
}


// 4. ОТРИСОВКА И ОБРАБОТЧИКИ
function renderCalendar() {
    const monthDate = new Date(state.year, state.month, 1);

    monthTitle.textContent = new Intl.DateTimeFormat("ru-RU", {
        month: "long",
        year: "numeric"
    }).format(monthDate);

    monthTitle.textContent =
        monthTitle.textContent[0].toLocaleUpperCase("ru-RU") +
        monthTitle.textContent.slice(1);

    const cells = buildCalendarGrid(state.year, state.month).flat();

    calendarDays.innerHTML = cells.map((cell) => {
        const isPast = cell.date < today;
        const isToday = dateKey(cell.date) === dateKey(today);
        const isSelected =
            dateKey(cell.date) === dateKey(state.selectedDate);

        const disabled = isPast || cell.otherMonth;
        const classes = ["calendar__day"];

        if (isPast || cell.otherMonth) {
            classes.push("past-day");
        }

        if (isToday) {
            classes.push("today");
        }

        if (isSelected) {
            classes.push("selected");
        }

        return `
            <button
                type="button"
                class="${classes.join(" ")}"
                data-date="${dateKey(cell.date)}"
                ${disabled ? "disabled" : ""}
                aria-pressed="${isSelected}"
            >${cell.day}</button>
        `;
    }).join("");

    calendarDays
        .querySelectorAll(".calendar__day:not(:disabled)")
        .forEach((button) => {
            button.addEventListener("click", () => {
                state.selectedDate =
                    new Date(button.dataset.date + "T00:00:00");

                state.selectedTime = null;
                renderAll();
            });
        });
}

function renderSlots() {
    slotsSubtitle.textContent =
        new Intl.DateTimeFormat("ru-RU", {
            day: "numeric",
            month: "long"
        }).format(state.selectedDate) + " · Дмитрий Волков";

    const slots =
        SLOTS_BY_DATE[dateKey(state.selectedDate)] ?? DEFAULT_SLOTS;

    if (slots.length === 0) {
        slotsGrid.innerHTML =
            '<p class="time-slots__empty">На эту дату нет доступного времени.</p>';
        return;
    }

    slotsGrid.innerHTML = slots.map((slot) => {
        const selected = slot.time === state.selectedTime;
        const classes = ["time-btn"];

        if (!slot.available) {
            classes.push("busy");
        }

        if (selected) {
            classes.push("selected");
        }

        return `
            <button
                type="button"
                class="${classes.join(" ")}"
                data-time="${slot.time}"
                ${slot.available ? "" : "disabled"}
                aria-pressed="${selected}"
            >
                ${slot.time}
                ${slot.available
                    ? ""
                    : '<br><span class="busy-text">Занято</span>'}
            </button>
        `;
    }).join("");

    slotsGrid
        .querySelectorAll(".time-btn:not(:disabled)")
        .forEach((button) => {
            button.addEventListener("click", () => {
                state.selectedTime = button.dataset.time;

                renderSlots();
                updateSummary();
            });
        });
}

function updateSummary() {
    const dateText = new Intl.DateTimeFormat("ru-RU", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(state.selectedDate);

    const formattedDate =
        dateText[0].toLocaleUpperCase("ru-RU") +
        dateText.slice(1);

    if (!state.selectedTime) {
        summaryDateTime.textContent =
            `${formattedDate} · выберите время`;
        return;
    }

    const [hours, minutes] = state.selectedTime.split(":").map(Number);

    // Длительность записи 60 минут
    const end = new Date(2000, 0, 1, hours, minutes + 60);

    const endTime =
        `${String(end.getHours()).padStart(2, "0")}:` +
        `${String(end.getMinutes()).padStart(2, "0")}`;

    summaryDateTime.textContent =
        `${formattedDate} · ${state.selectedTime}–${endTime}`;
}

function renderAll() {
    renderCalendar();
    renderSlots();
    updateSummary();
}

function changeMonth(step) {
    const newMonth = new Date(state.year, state.month + step, 1);

    state.year = newMonth.getFullYear();
    state.month = newMonth.getMonth();

    renderCalendar();
}

// Первая стрелка - предыдущий месяц, вторая - следующий
arrows[0].addEventListener("click", () => changeMonth(-1));
arrows[1].addEventListener("click", () => changeMonth(1));


// 5. ИНИЦИАЛИЗАЦИЯ
renderAll();