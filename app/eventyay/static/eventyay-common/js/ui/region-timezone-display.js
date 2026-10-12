function getScheduledDate(dateInput) {
    const tokens = document.body.dataset.dateformat?.match(/YYYY|YY|MM|M|DD|D/g);
    const values = dateInput.value.match(/\d+/g);
    if (!tokens || !values || tokens.length !== values.length) {
        return null;
    }

    const dateParts = {};
    tokens.forEach((token, index) => {
        if (token === 'YYYY' || token === 'YY') {
            const year = Number(values[index]);
            dateParts.year = token === 'YY' ? (year <= 68 ? 2000 + year : 1900 + year) : year;
        } else if (token === 'MM' || token === 'M') {
            dateParts.month = Number(values[index]);
        } else if (token === 'DD' || token === 'D') {
            dateParts.day = Number(values[index]);
        }
    });

    if (!dateParts.year || !dateParts.month || !dateParts.day) {
        return null;
    }

    const date = new Date(0);
    date.setUTCFullYear(dateParts.year, dateParts.month - 1, dateParts.day);
    date.setUTCHours(12, 0, 0, 0);
    if (
        date.getUTCFullYear() !== dateParts.year
        || date.getUTCMonth() !== dateParts.month - 1
        || date.getUTCDate() !== dateParts.day
    ) {
        return null;
    }
    return date;
}

function getTimezoneOffset(region, date) {
    try {
        const parts = new Intl.DateTimeFormat(undefined, {
            timeZone: region,
            timeZoneName: 'longOffset',
        }).formatToParts(date);
        const offset = parts.find((part) => part.type === 'timeZoneName')?.value;
        return offset?.replace('GMT', 'UTC') || region.replace(/_/g, ' ');
    } catch (error) {
        console.error('Could not determine the timezone for the selected region.', error);
        return region.replace(/_/g, ' ');
    }
}

function initializeRegionTimezoneDisplay(output) {
    const select = document.getElementById(output.dataset.regionTimezoneSource);
    const dateInput = document.getElementById(output.dataset.regionTimezoneDateSource);
    if (!select || !dateInput) {
        return;
    }

    const updateTimezone = () => {
        const scheduledDate = getScheduledDate(dateInput);
        output.value = scheduledDate
            ? getTimezoneOffset(select.value, scheduledDate)
            : select.value.replace(/_/g, ' ');
        output.textContent = output.value;
    };

    select.addEventListener('change', updateTimezone);
    dateInput.addEventListener('change', updateTimezone);
    updateTimezone();
}

document.querySelectorAll('[data-region-timezone-display]').forEach(initializeRegionTimezoneDisplay);
