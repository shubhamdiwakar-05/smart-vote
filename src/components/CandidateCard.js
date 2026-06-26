import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export default function CandidateCard({ candidate, onSelect }) {
  return (
    <Card className="group overflow-hidden border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-0">
        <div className="relative">
          <div className="h-36 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden">
            {candidate.photo ? (
              <img
                src={candidate.photo}
                alt={candidate.name}
                className="h-full w-full object-contain p-2 transition-transform duration-300"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary">
                {candidate.name?.[0]}
              </div>
            )}
          </div>
          {candidate.symbol && (
            <div className="absolute top-2 right-2 h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center text-lg shadow-sm">
              {candidate.symbol}
            </div>
          )}
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h4 className="font-semibold text-foreground leading-tight">{candidate.name}</h4>
            <Badge variant="secondary" className="mt-1 text-xs">
              {candidate.party}
            </Badge>
          </div>
          <Button
            className="w-full"
            size="sm"
            onClick={() => onSelect(candidate.id)}
          >
            Select Candidate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
