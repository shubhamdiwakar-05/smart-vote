import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Calendar, MapPin } from 'lucide-react';

const statusStyles = {
  Ongoing: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Completed: 'bg-muted text-muted-foreground',
};

export default function ElectionCard({ election, onView }) {
  const statusClass = statusStyles[election.status] || statusStyles.Completed;

  return (
    <Card className="hover:shadow-md hover:border-primary/40 transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-foreground leading-snug">{election.name}</h4>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusClass}`}>
            {election.status}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{election.description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{election.start}</span>
          </div>
          <span>→</span>
          <span>{election.end}</span>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => onView(election.id)}
        >
          View Election
        </Button>
      </CardContent>
    </Card>
  );
}
