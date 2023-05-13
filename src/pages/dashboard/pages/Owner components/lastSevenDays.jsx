import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react'
import { fireStore } from '../../../../firebase/sdk';
import { contextData } from '../../dashboard';
import Chart from "react-apexcharts";

const LastSevenDays = ({status}) => {
    const { tokenSaleInfo, rootData } = useContext(contextData);
    const [ daysObj, setDaysObj ] = useState([]);
    const [chartOptions, setChartOptions] = useState({
        options: {
            chart: {
                id: "basic-bar"
            },
            xaxis: {
                categories: [0,0,0,0,0,0]
            }
        },
        series: [
            {
                name: "series-1",
                data: [0, 0, 0, 0, 0, 0]
            }
        ]
    });

    function formatDate(dateString) {
        const dateParts = dateString.split('/');
        const year = dateParts[2];
        const month = dateParts[0].padStart(2, '0');
        const day = dateParts[1].padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function getLast7Days() {
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayStrArr = [];
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().slice(0, 10));
            const dayOfWeek = daysOfWeek[date.getDay()];
            dayStrArr.push(dayOfWeek);
        }

        return {days, dayStrArr};
    }

    const fetchTransactions = async () => {
        const {days, dayStrArr} = getLast7Days()

        onSnapshot(collection(fireStore, "user_transactions"), (collectionSnap) => {
            if (collectionSnap !== null) {

                let tempArray = [];

                collectionSnap.forEach(element => {
                    const data = element.data();

                    if (data.batch_name === tokenSaleInfo.batchName) {
                        tempArray.push(data);
                    }
                });

                let tempHold = [];
                let finalHold = [];

                tempArray.forEach(element => {
                    if (element.type === 1) {
                        const timestamp = new Date(element.timestamp).toLocaleDateString();
                        tempHold.push({ date: formatDate(timestamp), value: (element.amount) });
                    }
                });

                days.forEach((item, idx) => {
                    if (tempHold.find(i => i.date === item)) {
                        let m = 0;
                        tempHold.map(i => {
                            if (i.date === item) {
                                m += Number(i.value);
                            }
                        })
                        finalHold.push({ day: dayStrArr[idx], sold: m });
                    } else {
                        finalHold.push({ day: dayStrArr[idx], sold: 0 });
                    }
                });
                setDaysObj(finalHold);
            }

        });
    }

    useEffect(()=>{
        if (rootData.batchName !== null) {
            fetchTransactions();
        }
    }, [tokenSaleInfo, rootData]);

    useEffect(()=>{
        if (daysObj.length > 0) {
            const xAxis = [];
            const seriesData = [];
            daysObj.forEach(element =>{
                xAxis.push(element.day);
                seriesData.push(element.sold);
            });

            setChartOptions({
                series: [{
                    name: "Token Sold",
                    data: seriesData
                }],
                options: {
                    chart: {
                        height: 350,
                        type: 'bar',
                        toolbar: {
                            show: false,
                        }
                    },
                    responsive: [
                        {
                            breakpoint: 768, // set the breakpoint at which the chart should change its size
                            options: {
                                chart: {
                                    width: (14 * 24) // set the chart height for screens below the breakpoint
                                },
                                legend: {
                                    position: "bottom"
                                }
                            }
                        }
                    ],
                    dataLabels: {
                        enabled: true
                    },
                    stroke: {
                        curve: 'smooth',
                        width: 3,
                    },
                    grid: {
                        row: {
                            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                            opacity: 0.25
                        },
                    },
                    yaxis: {
                        labels: {
                            formatter: function (value) {
                                if (value >= 1000000000) {
                                    return (value / 1000000000).toFixed() + 'B';
                                } else if (value >= 1000000) {
                                    return (value / 1000000).toFixed() + 'M';
                                } else if (value >= 1000) {
                                    return (value / 1000).toFixed() + 'K';
                                } else {
                                    return value;
                                }
                            }
                        }
                    },
                    xaxis: {
                        categories: xAxis,
                    },
                    colors: [`${status ? "#3856ff": "#c47e16"}`],
                    dataLabels: {
                        formatter: function (value) {
                          return Number(value.toFixed()).toLocaleString();
                        }
                    },
                    tooltip: {
                        enabled: false,
                    }
                },
            }
            );
        }
    }, [daysObj]);

    return (
        <div className="kard exempt">
            <div className="title">Last 7 days ({tokenSaleInfo.batchName})</div>
            <div className="barchart">
                <Chart
                    options={chartOptions.options}
                    series={chartOptions.series}
                    type={"area"}
                />
            </div>
        </div>
    )
}

export default LastSevenDays;