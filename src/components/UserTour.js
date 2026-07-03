import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useTranslation } from 'react-i18next';

export default function UserTour({ run, onComplete }) {
  const { t, i18n } = useTranslation();
  
  // Define steps
  const steps = [
    {
      target: 'body',
      placement: 'center',
      content: (
        <div className="text-left">
          <h3 className="text-xl font-bold mb-2">Welcome to SmartVote!</h3>
          <p className="text-muted-foreground">Let's take a quick tour to help you get started with the dashboard.</p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '.tour-active-elections',
      content: 'Here you can see all ongoing elections. Click "Vote Now" to cast your vote securely.',
    },
    {
      target: '.tour-voter-info',
      content: 'This is your digital Voter ID card. Make sure your details match your official documents.',
    },
    {
      target: '.tour-sidebar-nav',
      content: 'Use the sidebar to navigate to your Profile, see past Results, and access Support.',
    },
    {
      target: '.tour-language-selector',
      content: 'You can change the portal language at any time from this dropdown menu.',
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];
    
    if (finishedStatuses.includes(status)) {
      onComplete();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showSkipButton={true}
      showProgress={true}
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#2563eb', // text-primary
          zIndex: 10000,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          backgroundColor: '#2563eb',
          borderRadius: '9999px',
        },
        buttonBack: {
          color: '#64748b',
        },
        buttonSkip: {
          color: '#64748b',
        }
      }}
    />
  );
}
