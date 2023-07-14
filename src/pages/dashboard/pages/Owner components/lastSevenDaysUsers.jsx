import React, { useContext, useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { fireStore } from '../../../../firebase/sdk';
import { contextData } from '../../dashboard';
import Chart from "react-apexcharts";

const LastSevenDaysUsers = () => {
    const {  } = useContext(contextData);
    const [daysObj, setDaysObj ] = useState([]);
    const [chartOptions, setChartOptions] = useState({
        options: {
            chart: {
                id: "basic-bar"
            },
            xaxis: {
                categories: [0,0,0,0,0,0],
            }
        },
        series: [
            {
                name: "series-1",
                data: [0, 0, 0, 0, 0, 0],
            }
        ]
    });

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

    function formatDate(dateString) {
        const dateParts = dateString.split('/');
        const year = dateParts[2];
        const month = dateParts[0].padStart(2, '0');
        const day = dateParts[1].padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const fetchUsers = async () => {
        const {days, dayStrArr} = getLast7Days();
        const collectionSnap = collection(fireStore, "kycApplications");    
        
        onSnapshot(collectionSnap, (snap) => {
            const collection = snap.docs;
            let tempArray = [];
            if (collection !== null) {
                collection.forEach(element => {
                    if ((element.data()).status === 1) {
                        tempArray.push(element.data());
                    }
                });

                let tempHold = [];
                let finalHold = [];

                tempArray.forEach(element => {
                    const dateString = formatDate(String(element.verifiedOn).slice(0, 9))
                    tempHold.push({ date: dateString, value: 1 });
                });

                let countFound = 0;
                let countNull = 0;
                days.forEach((item, idx) => {
                    if (tempHold.find(i => i.date === item)) {
                        let m = 0;
                        tempHold.map(i => {
                            if (i.date === item) {
                                m += Number(i.value);
                            }
                        });

                        
                        finalHold.push({ day: dayStrArr[idx], registered: m });
                        countFound++;
                    } else {
                        finalHold.push({ day: dayStrArr[idx], registered: 0 });
                        countNull++;
                    }
                });

                if (countNull === 7) {
                    setDaysObj([]);
                }else{
                    setDaysObj(finalHold);
                }

            }
        });
    }

    useEffect(()=>{
        fetchUsers();
    }, []);

    useEffect(()=>{
        if (daysObj.length > 0) {
            const xAxis = [];
            const seriesData = [];
            daysObj.forEach(element =>{
                xAxis.push(element.day);
                seriesData.push(element.registered);
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
                            breakpoint: 0, // Set the breakpoint to 0, which means it will always apply the options below this breakpoint
                            options: {
                                chart: {
                                    width: "99%", // Set the width to 100% to fill the available width
                                },
                                legend: {
                                    position: "bottom",
                                },
                            },
                        },
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
                    colors: ["#3856ff"],
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
            <div className="title">KYCed Users (Last 7 days)</div>
            <div className="barchart">
                <Chart
                    options={chartOptions.options}
                    series={chartOptions.series}
                    type={"bar"}
                />
            </div>
        </div>
    )
}

export default LastSevenDaysUsers;