import React, { useEffect, useRef, useState } from 'react';

const Clock = ({endDate}) => {
    const secRef = useRef();
    const minRef = useRef();
    const hrRef = useRef();
    const dayRef = useRef();
    const [futureDate, setFutureDate] = useState(new Date());

    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    const secondsFlip = () => {
        const mainDiv = secRef.current;
        const childDiv = document.createElement("div");
        const divId = Math.random().toString(25);
        childDiv.classList.add("nm");
        childDiv.classList.add("flip");
        childDiv.id = divId;
        childDiv.innerHTML = `${timeLeft.seconds + 1 > 9 ? timeLeft.seconds + 1 : `0${timeLeft.seconds + 1}`}`;

        mainDiv.appendChild(childDiv);

        childDiv.addEventListener('animationend', () => {
            childDiv.remove()
        });

    }

    const minutesFlip = () => {
        const mainDiv = minRef.current;
        const childDiv = document.createElement("div");
        const divId = Math.random().toString(25);
        childDiv.classList.add("nm");
        childDiv.classList.add("flip");
        childDiv.id = divId;
        childDiv.innerHTML = `${timeLeft.minutes + 1 > 9 ? timeLeft.minutes + 1 : `0${timeLeft.minutes + 1}`}`;

        mainDiv.appendChild(childDiv);

        childDiv.addEventListener('animationend', () => {
            childDiv.remove()
        });

    }

    const hoursFlip = () => {
        const mainDiv = hrRef.current;
        const childDiv = document.createElement("div");
        const divId = Math.random().toString(25);
        childDiv.classList.add("nm");
        childDiv.classList.add("flip");
        childDiv.id = divId;
        childDiv.innerHTML = `${timeLeft.hours + 1 > 9 ? timeLeft.hours + 1 : `0${timeLeft.hours + 1}`}`;

        mainDiv.appendChild(childDiv);

        childDiv.addEventListener('animationend', () => {
            childDiv.remove()
        });

    }

    const daysFlip = () => {
        const mainDiv = dayRef.current;
        const childDiv = document.createElement("div");
        const divId = Math.random().toString(25);
        childDiv.classList.add("nm");
        childDiv.classList.add("flip");
        childDiv.id = divId;
        childDiv.innerHTML = `${timeLeft.days + 1 > 9 ? timeLeft.days + 1 : `0${timeLeft.days + 1}`}`;

        mainDiv.appendChild(childDiv);

        childDiv.addEventListener('animationend', () => {
            childDiv.remove()
        });

    }

    useEffect(() => {
        if (timeLeft.seconds > -1) {
            secondsFlip();
        }
    }, [timeLeft.seconds]);

    useEffect(() => {
        if (timeLeft.minutes > -1) {
            minutesFlip();
        }
    }, [timeLeft.minutes]);

    useEffect(() => {
        if (timeLeft.hours > -1) {
            hoursFlip();
        }
    }, [timeLeft.hours]);

    useEffect(() => {
        if (timeLeft.days > -1) {
            daysFlip();
        }
    }, [timeLeft.days]);

    useEffect(() => {
        if (futureDate !== null) {
            const intervalId = setInterval(() => {
                const currentDate = new Date();
                const difference = futureDate - currentDate;

                if (difference <= 0) {
                    clearInterval(intervalId);
                    return;
                }
    
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            }, 1000);
    
            return () => clearInterval(intervalId);
        }
    }, [futureDate]);

    useEffect(()=>{
        setFutureDate(new Date(`${endDate}`));
    }, [endDate]);

    return (
        <div className="sec">
            <div className="clock">
                <div className="cd">
                    <div className="nm" ref={dayRef}>{endDate !== null ? `${timeLeft.days > 9 ? timeLeft.days : `${timeLeft.days > -1 ? `0${timeLeft.days}` : '00' }`}`: "--"}</div>
                    <div className="d">days</div>
                </div>
                <div className="cd">
                    <div className="nm" ref={hrRef}>{endDate !== null ? `${timeLeft.hours > 9 ? timeLeft.hours : `${timeLeft.hours > -1 ? `0${timeLeft.hours}` : '00' }`}`: "--"}</div>
                    <div className="d">hours</div>
                </div>
                <div className="cd">
                    <div className="nm" ref={minRef}>{endDate !== null ? `${timeLeft.minutes > 9 ? timeLeft.minutes : `${timeLeft.minutes > -1 ? `0${timeLeft.minutes}` : '00' }`}`: "--"}</div>
                    <div className="d">mins</div>
                </div>
                <div className="cd" ref={secRef}>
                    <div className="nm">{endDate !== null ? `${timeLeft.seconds > 9 ? timeLeft.seconds : `${timeLeft.seconds > -1 ? `0${timeLeft.seconds}` : '00' }`}`: "--"}</div>
                    <div className="d">secs</div>
                </div>
            </div>
        </div>
    )
}

export default Clock;