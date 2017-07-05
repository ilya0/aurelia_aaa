import { autoinject, bindable } from 'aurelia-framework';
import { NetsuiteService } from './services/netsuite-service';
import { ApplicationState } from './application-state';
import { EventAggregator } from 'aurelia-event-aggregator';
import { DialogService } from 'aurelia-dialog';
import { Day, dayNames, getNumberOfDaysInMonth, monthNames, fullMonthNames } from './resources/dates';
import { ModalIframe } from './modal-iframe'

@autoinject
export class DeliverySchedule {
    loading: Boolean;
    deliveries: any[];

    deliveryList: any[];

    @bindable selectedDay = null;
    date: Date;
    calendarDaysDt: any[];
    dayNames: any[];

    constructor(public appState: ApplicationState, public netsuite: NetsuiteService, public eventAggregator: EventAggregator, private dialogService: DialogService) {
        this.appState.pageHeader = 'Delivery Schedule';

        this.date = new Date();
        this.dayNames = dayNames;
        this.calendarDaysDt = [];
        this.deliveryList = [];
    }

    attached(params, routeConfig) {
        this.loading = true;
        this.netsuite.getDeliveries().then((response) => {
            this.loading = false;
            console.log('response', response);
            if (response.success) {
                this.deliveries = response.records;
                this.deliveries.forEach((delivery => {
                    if (delivery.dateNeeded) delivery.dtNeeded = new Date(delivery.dateNeeded);
                }));
                this.refresh();
            }
        });
    }

    toggleDeliveryDetail(delivery) {
        if (delivery.showDetails) {
            delivery.showDetails = false;
        }
        else {
            this.netsuite.getDelivery(delivery.id).then((result) => {
                console.log(result);
                delivery.detail = result.delivery;
                delivery.showDetails = true;
            });
        }
    }

    printPdf(recId) {
        var token = localStorage.getItem("aaa_token");
        this.dialogService.open({
            viewModel: ModalIframe,
            model: {
                iframeUrl: this.netsuite.endpoints.productionApi + '&aaa_token=' + token + '&aaa_action=print-delivery' + '&aaa_id=' + recId
            }
        })
    }

    updateDeliveryList() {
        this.deliveryList = [];
        console.log('updateDeliveryList', this.selectedDay);
        if (this.selectedDay && this.selectedDay.date) {
            this.deliveries.forEach((delivery => {
                if (delivery.dtNeeded && delivery.dtNeeded.getFullYear() == this.selectedDay.date.getFullYear() && delivery.dtNeeded.getMonth() == this.selectedDay.date.getMonth() && delivery.dtNeeded.getDate() == this.selectedDay.date.getDate()) this.deliveryList.push(delivery);
            }));
        }
    }

    refresh() {
        // /* set the days of the current month */
        // let numberOfDaysInCurrentMonth = getNumberOfDaysInMonth(this.date);
        // let currentMonthDays = this.getMonthDays(this.date, numberOfDaysInCurrentMonth);

        // /* set the days of the previous month */
        // let numberOfDaysInPrevMonth = getNumberOfDaysInMonth(this.prevMonthDate);
        // let prevMonthDays = this.getMonthDays(this.prevMonthDate, numberOfDaysInPrevMonth);

        // /* set the days of the next month */
        // let numberOfDaysInNextMonth = getNumberOfDaysInMonth(this.nextMonthDate);
        // let nextMonthDays = this.getMonthDays(this.nextMonthDate, numberOfDaysInNextMonth);

        // /* number of previous month additionnal days */
        // let numberOfprevMonthAdditionalDays = currentMonthDays[0].day === 0 ? 7 : currentMonthDays[0].day;
        // let numberOfnextMonthAdditionalDays = 42 - (numberOfprevMonthAdditionalDays + currentMonthDays.length);

        // let calendarDays = this.getCalendarDays(currentMonthDays, numberOfprevMonthAdditionalDays, prevMonthDays, numberOfnextMonthAdditionalDays, nextMonthDays);

        let firstDay = this.getFirstDayOfWeek(this.date, 1);
        let calendarDays = this.getDaysInWeek(firstDay, 3);

        this.deliveries.forEach((delivery => {
            if (delivery.dtNeeded) {
                let day = this.getDay(calendarDays, delivery.dtNeeded);
                if (day) {
                    if (!day.events) day.events = [];
                    day.events.push(delivery);
                }
            }
        }));

        /* set the selected day */
        // var initialDate;
        // if (this.selectedDay) initialDate = this.selectedDay.date;
        // var selectedDay = this.getDay(calendarDays, initialDate);
        // if (!selectedDay) selectedDay = this.getDay(calendarDays);
        var selectedDay = this.getDay(calendarDays);
        console.log('selectedDay', selectedDay);
        this.selectDay(selectedDay);

        this.calendarDaysDt = this.getCalendarDaysDt(calendarDays, 3);
        // this.updateDeliveryList();
    }

    selectDay(day) {
        // if (!day) {
        //     if (this.selectedDay) this.selectedDay.isSelected = false;
        //     this.updateDeliveryList();
        // }
        if (day != this.selectedDay) {
            if (this.selectedDay) this.selectedDay.isSelected = false;
            if (day) {
                this.selectedDay = day;
                this.selectedDay.isSelected = true;
            }
            // else {
            //     this.selectedDay = this.date;
            // }
            this.updateDeliveryList();
        }
    }

    selectMonth(delta) {
        this.date.setMonth(this.date.getMonth() + delta);
        this.refresh();
    }

    selectWeek(delta) {
        delta = delta * 7;
        this.date = new Date(this.date.valueOf() + (delta * 86400000));
        console.log('new date', this.date);
        this.refresh();
    }

    // getMonthDays(date, numberOfDaysInMonth) {
    //     let bufferDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    //     var days = [];

    //     for (let i = 1; i <= numberOfDaysInMonth; i++) {
    //         bufferDate.setDate(i);
    //         var day = new Day(new Date(bufferDate.valueOf()));
    //         days.push(day);
    //     }
    //     return days;
    // }

    getFirstDayOfWeek(date, numPrevWeeks?) {
        let day = date.getDay();
        if (numPrevWeeks) day += numPrevWeeks * 7;
        return new Date(date.valueOf() - (day * 86400000));
        // this.date = new Date(date.valueOf() - (day * 86400000));
        // return this.date;
    }

    getDaysInWeek(date, numWeeks = 1) {
        var days = [];

        for (let i = 0; i < (7 * numWeeks); i++) {
            var day = new Day(new Date(date.valueOf() + (i * 86400000)));
            days.push(day);
        }

        return days;
    }

    get prevMonthDate() {
        let d = new Date(this.date.valueOf());
        d.setMonth(this.date.getMonth() - 1);
        return d;
    }

    get nextMonthDate() {
        let d = new Date(this.date.valueOf());
        d.setMonth(this.date.getMonth() + 1);
        return d;
    }

    get monthName() {
        return fullMonthNames[this.date.getMonth()];
    }

    get year() {
        return this.date.getFullYear();
    }

    getDay(days, selectedDay?) {
        // let currentDate = new Date();
        if (!selectedDay) selectedDay = this.date;
        // if (!selectedDay) selectedDay = new Date();
        // var activeDays = days
        //     .filter(day => {
        //         return day.isActive;
        //     });
        var day = days.find(day => {
            return (selectedDay.getFullYear() == day.year && selectedDay.getMonth() == day.month && selectedDay.getDate() == day.dayOfMonth);
        });
        return day;
        // return (typeof day == 'undefined' && !selectedDay) ? days[0] : day;
    }

    getCalendarDays(currentMonthDays, numberOfprevMonthAdditionalDays, prevMonthDays, numberOfnextMonthAdditionalDays, nextMonthDays) {
        var calendarDays = [];

        if (numberOfprevMonthAdditionalDays > 0) {
            for (let i = (prevMonthDays.length - numberOfprevMonthAdditionalDays); i < prevMonthDays.length; i++) {
                prevMonthDays[i].isActive = false;
                calendarDays.push(prevMonthDays[i]);
            }
        }

        for (let i = 0; i < currentMonthDays.length; i++) {
            currentMonthDays[i].isActive = true;
            calendarDays.push(currentMonthDays[i]);
        }

        if (numberOfnextMonthAdditionalDays > 0) {
            for (let i = 0; i < numberOfnextMonthAdditionalDays; i++) {
                nextMonthDays[i].isActive = false;
                calendarDays.push(nextMonthDays[i]);
            }
        }

        return calendarDays;
    }

    getCalendarDaysDt(calendarDays, numWeeks = 1) {
        var calendarDaysDt = [];
        for (let i = 0; i < numWeeks; i++) {
            calendarDaysDt.push(calendarDays.slice(7 * i, 7 * (i + 1)));
        }
        return calendarDaysDt;
    }
}
