import { Component, OnInit } from '@angular/core';
import moment from 'moment/moment';
import Highcharts from 'highcharts/highcharts';
// import { Chart } from 'angular-highcharts';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    constructor() {
        this.keepCalendarOpeningWithRange = true;
        this.selectedDate = Date.now();
        this.selectedRange = { startDate: moment().startOf('month'), endDate: moment().endOf('month') };
    }

    ngOnInit() {
        // this.init();
    }

    /**
     * Daterange picker
     */
    selectedRange: any;
    selectedDate: any;
    keepCalendarOpeningWithRange: true;
    maxDate: moment.Moment = moment();
    ranges: any = {
        Today: [moment(), moment()],
        Yesterday: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [
            moment()
                .subtract(1, 'month')
                .startOf('month'),
            moment()
                .subtract(1, 'month')
                .endOf('month')
        ]
    };

    //add active to button-group
    onButtonGroupClick($event) {
        let clickedElement = $event.target || $event.srcElement;

        if (clickedElement.nodeName === "BUTTON") {

            let isCertainButtonAlreadyActive = clickedElement.parentElement.querySelector(".active");
            // if a Button already has Class: .active
            if (isCertainButtonAlreadyActive) {
                isCertainButtonAlreadyActive.classList.remove("active");
            }

            clickedElement.className += " active";
        }

    }
    //angular-highchart
    //https://www.npmjs.com/package/angular-highcharts
    // chart: Chart;

    // //draw chart by month
    // init() {
    //     let chart = new Chart({
    //         chart: {
    //             marginLeft: 40, // Keep all charts left aligned
    //             spacingTop: 20,
    //             spacingBottom: 20,
    //             className: 'chart-sync-revenue'
    //         },
    //         title: {
    //             text: 'Revenue',
    //             align: 'left',
    //             margin: 0,
    //             x: 30
    //         },
    //         credits: {
    //             enabled: false
    //         },
    //         legend: {
    //             enabled: true,
    //             verticalAlign: 'top',
    //             y: 0
    //         },
    //         xAxis: {
    //             type: 'datetime'
    //         },
    //         yAxis: {
    //             title: {
    //                 text: null
    //             }
    //         },
    //         series: [
    //             {
    //                 type: 'line',
    //                 color: '#ffb822',
    //                 data: [
    //                     [Date.UTC(2010, 0, 1), 29.9],
    //                     [Date.UTC(2010, 2, 1), 71.5],
    //                     [Date.UTC(2010, 3, 1), 106.4]
    //                 ],
    //                 name: "USD"
    //             },
    //             {
    //                 type: 'line',
    //                 color: "#c9cdd4",
    //                 data: [
    //                     [Date.UTC(2010, 0, 1), 29.9],
    //                     [Date.UTC(2010, 2, 1), 71.5],
    //                     [Date.UTC(2010, 3, 1), 106.4]
    //                 ],
    //                 name: "VND"
    //             }
    //         ]
    //     });
    //     this.chart = chart;
    // }
    // //draw chart by day
    // chartPerDay() {
    //     this.chart.removeSeries(this.chart.ref.series.length - 1);
    // }


    // highchart
    // https://www.npmjs.com/package/highcharts-angular
    Highcharts = Highcharts;
    chartOptions1 = {
        chart: {
            marginLeft: 40, // Keep all charts left aligned
            spacingTop: 20,
            spacingBottom: 20,
            className: 'chart-sync-revenue'
        },
        title: {
            text: 'Revenue',
            align: 'left',
            margin: 0,
            x: 30
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: true,
            verticalAlign: 'top',
            y: 0
        },
        xAxis: {
            // crosshair: true,
            // events: {
            //     setExtremes: function (e) {
            //         var thisChart = this.chart;

            //         if (e.trigger !== 'syncExtremes') {
            //             // Prevent feedback loop
            //             Highcharts.each(Highcharts.charts, void function (chart) {
            //                 if (
            //                     chart !== thisChart &&
            //                     chart.options.chart.className ===
            //                     thisChart.options.chart.className
            //                 ) {
            //                     if (chart.xAxis[0].setExtremes) {
            //                         // It is null while updating
            //                         chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, {
            //                             trigger: 'syncExtremes'
            //                         });
            //                     }
            //                 }
            //             });
            //         }
            //     }
            // },
            // labels: {
            //     format: '{value}'
            // }
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', "Nov", "Dec"]
        },
        yAxis: {
            title: {
                text: null
            }
        },
        // tooltip: {
        //     positioner: function () {
        //         return {
        //             // right aligned
        //             x: this.chart.chartWidth - this.label.width,
        //             y: 10 // align to title
        //         };
        //     },
        //     borderWidth: 0,
        //     backgroundColor: "none",
        //     pointFormat: "{point.y}",
        //     headerFormat: "",
        //     shadow: false,
        //     style: {
        //         fontSize: "18px"
        //     }
        // },
        series: [
            {
                color: '#ffb822',
                data: [1, 2, 3, 4, 5, 6, 7, 8, 9],
                name: "USD"
            },
            {
                color: "#c9cdd4",
                data: [1, 3, 5, 7, 8, 9, 12, 14, 17],
                name: "VND"
            }
        ]
    };

    chartOptions2 = {
        chart: {
            marginLeft: 40, // Keep all charts left aligned
            spacingTop: 20,
            spacingBottom: 20,
            className: "chart-sync-volume"
        },
        title: {
            text: "Volume",
            align: "left",
            margin: 0,
            x: 30
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: true,
            verticalAlign: 'top',
            y: 0
        },
        xAxis: {
            // crosshair: true,
            // events: {
            //     setExtremes: function (e) {
            //         var thisChart = this.chart;

            //         if (e.trigger !== "syncExtremes") {
            //             // Prevent feedback loop
            //             Highcharts.each(Highcharts.charts, void function (chart) {
            //                 if (
            //                     chart !== thisChart &&
            //                     chart.options.chart.className ===
            //                     thisChart.options.chart.className
            //                 ) {
            //                     if (chart.xAxis[0].setExtremes) {
            //                         // It is null while updating
            //                         chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, {
            //                             trigger: "syncExtremes"
            //                         });
            //                     }
            //                 }
            //             });
            //         }
            //     }
            // },
            // labels: {
            //     format: "{value}"
            // }
            categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        },
        yAxis: {
            title: {
                text: null
            }
        },
        // tooltip: {
        //     positioner: function () {
        //         return {
        //             // right aligned
        //             x: this.chart.chartWidth - this.label.width,
        //             y: 10 // align to title
        //         };
        //     },
        //     borderWidth: 0,
        //     backgroundColor: "none",
        //     pointFormat: "{point.y}",
        //     headerFormat: "",
        //     shadow: false,
        //     style: {
        //         fontSize: "18px"
        //     }
        // },
        series: [
            {
                color: "#3966b6",
                data: [1, 2, 3, 4, 5, 6, 7, 8, 9],
                name: "Shipment"
            },
            {
                color: "#c9cdd4",
                data: [1, 3, 5, 7, 8, 9, 12, 14, 17],
                name: "HBL"
            }
        ]
    };

    chartOptions3 = {
        chart: {
            marginLeft: 40, // Keep all charts left aligned
            spacingTop: 20,
            spacingBottom: 20,
            className: "chart-sync-weight"
        },
        title: {
            text: "Weight",
            align: "left",
            margin: 0,
            x: 30
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: true,
            verticalAlign: 'top',
            y: 0
        },
        xAxis: {
            // crosshair: true,
            // events: {
            //     setExtremes: function (e) {
            //         var thisChart = this.chart;

            //         if (e.trigger !== "syncExtremes") {
            //             // Prevent feedback loop
            //             Highcharts.each(Highcharts.charts, void function (chart) {
            //                 if (
            //                     chart !== thisChart &&
            //                     chart.options.chart.className ===
            //                     thisChart.options.chart.className
            //                 ) {
            //                     if (chart.xAxis[0].setExtremes) {
            //                         // It is null while updating
            //                         chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, {
            //                             trigger: "syncExtremes"
            //                         });
            //                     }
            //                 }
            //             });
            //         }
            //     }
            // },
            // labels: {
            //     format: "{value}"
            // }
            categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        },
        yAxis: {
            title: {
                text: null
            }
        },
        // tooltip: {
        //     positioner: function () {
        //         return {
        //             // right aligned
        //             x: this.chart.chartWidth - this.label.width,
        //             y: 10 // align to title
        //         };
        //     },
        //     borderWidth: 0,
        //     backgroundColor: "none",
        //     pointFormat: "{point.y}",
        //     headerFormat: "",
        //     shadow: false,
        //     style: {
        //         fontSize: "18px"
        //     }
        // },
        series: [
            {
                color: "#41bfa3",
                data: [1, 2, 3, 4, 5, 6, 7, 8, 9],
                name: "KG"
            },
            {
                color: "#c9cdd4",
                data: [1, 3, 5, 7, 8, 9, 12, 14, 17],
                name: "CBM"
            }
        ]
    };

}
