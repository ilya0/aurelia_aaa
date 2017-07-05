export class Day {
    date: Date;

    constructor(date) {
        this.date = date;
    }
    get day() {
        return this.date.getDay();
    }
    get dayName() {
        return dayNames[this.date.getDay()];
    }
    get year() {
        return this.date.getFullYear();
    }
    get month() {
        return this.date.getMonth();
    }
    get monthName() {
        return monthNames[this.date.getMonth()];
    }
    get fullMonthName() {
        return fullMonthNames[this.date.getMonth()];
    }
    get dayOfMonth() {
        return this.date.getDate();
    }
}

export function getNumberOfDaysInMonth(date) {
    let year = date.getFullYear();
    let month = date.getMonth();
    let isLeap = ((year % 4) === 0 && ((year % 100) !== 0 || (year % 400) === 0));
    return [31, (isLeap ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
}

export var monthNames = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec");
export var fullMonthNames = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
export var dayNames = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");