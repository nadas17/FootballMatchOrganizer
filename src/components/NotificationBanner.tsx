
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Users } from "lucide-react";

interface NotificationBannerProps {
  requestCount: number;
  onClick: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ requestCount, onClick }) => {
  if (requestCount === 0) return null;

  return (
    <Card 
      className="glass-card border-orange-500/50 shadow-lg cursor-pointer hover:shadow-orange-500/25 transition-all duration-300 animate-pulse mb-4 sm:mb-6"
      onClick={onClick}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 animate-bounce" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-semibold text-sm sm:text-base truncate">New Join Requests!</h3>
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                You have {requestCount} pending request{requestCount > 1 ? 's' : ''} waiting for your approval
              </p>
            </div>
          </div>
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 flex items-center gap-1 text-xs flex-shrink-0">
            <Users className="w-3 h-3" />
            {requestCount}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationBanner;
