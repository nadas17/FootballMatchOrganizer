
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Match {
  id: number;
  title: string;
  match_date: string;
  match_time: string;
}

interface CountdownTimerProps {
  match: Match;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ match }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const matchDate = new Date(`${match.match_date}T${match.match_time}`);
      const now = new Date();
      const difference = matchDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [match.match_date, match.match_time]);

  return (
    <Card className="glass-card border-none shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-orbitron text-white flex items-center justify-center gap-2">
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          Next Match
        </CardTitle>
        <p className="text-white/70 text-sm">{match.title}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="countdown-unit">
            <div className="countdown-number">{String(timeLeft.days).padStart(2, '0')}</div>
            <div className="countdown-label">Days</div>
          </div>
          <div className="countdown-unit">
            <div className="countdown-number">{String(timeLeft.hours).padStart(2, '0')}</div>
            <div className="countdown-label">Hours</div>
          </div>
          <div className="countdown-unit">
            <div className="countdown-number">{String(timeLeft.minutes).padStart(2, '0')}</div>
            <div className="countdown-label">Minutes</div>
          </div>
          <div className="countdown-unit">
            <div className="countdown-number animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</div>
            <div className="countdown-label">Seconds</div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-white/60 text-sm">
            {new Date(`${match.match_date}T${match.match_time}`).toLocaleDateString('en-GB')} at {match.match_time}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CountdownTimer;
