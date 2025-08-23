'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Users, Calendar, Clock } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface Request {
  id: string;
  user_id: string;
  description: string;
  people_count: number;
  pickup_date: string;
  pickup_start_time: string;
  pickup_end_time: string;
  is_recurring: boolean;
  status: 'active' | 'fulfilled' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface RequestCardProps {
  request: Request;
  className?: string;
}

const RequestCard: React.FC<RequestCardProps> = React.memo(({ request, className }) => {
  const { t } = useLanguage();
  
  if (!request) {
    return null;
  }

  const { id, description, people_count, pickup_date, pickup_start_time, pickup_end_time, status, is_recurring } = request;

  // Format date and time
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      
      if (date.toDateString() === now.toDateString()) {
        return 'Default';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Default';
      } else {
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
      }
    } catch (e) {
      return dateString;
    }
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    try {
      return `${startTime} - ${endTime}`;
    } catch (e) {
      return `${startTime} - ${endTime}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'fulfilled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link href={`/request/${id}`} className="block group">
      <div
        className={cn(
          'overflow-hidden rounded-2xl bg-white transition-all duration-200 ease-in-out group-hover:-translate-y-1 p-4 border border-gray-100 shadow-sm',
          className
        )}
      >
        <div className="space-y-3">
          {/* Status and recurring badges */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                getStatusColor(status)
              )}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
              {is_recurring && (
                <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-800 px-2.5 py-0.5 text-xs font-medium">
                  Recurring
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-2 leading-tight line-clamp-2">
              {description  || 'Food_request'}
            </h3>
          </div>

          {/* Request details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-base text-gray-700">
              <Users className="w-4 h-4" />
              <span>{people_count} people</span>
            </div>
            
            <div className="flex items-center gap-2 text-base text-gray-700">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(pickup_date)}</span>
            </div>
            
            <div className="flex items-center gap-2 text-base text-gray-700">
              <Clock className="w-4 h-4" />
              <span>{formatTimeRange(pickup_start_time, pickup_end_time)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

RequestCard.displayName = 'RequestCard';

export default RequestCard;