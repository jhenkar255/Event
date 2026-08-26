import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { IInvitation } from '@shared/types';
import { DigitalInvitationTemplate } from '../components/invitations/DigitalInvitationTemplate';
import { DiyaIcon } from '../components/layout/IndianMotifs';

export const PublicInvitationPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [invitation, setInvitation] = useState<IInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      api
        .get<{ success: boolean; invitation: IInvitation }>(`/invitations/public/${token}`)
        .then((res) => {
          if (res.success && res.invitation) {
            setInvitation(res.invitation);
          } else {
            setError('Invitation not found or link has expired.');
          }
        })
        .catch((err) => {
          setError(err.message || 'Could not load digital invitation.');
        })
        .finally(() => setLoading(false));
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-utsav-maroon-950 flex flex-col items-center justify-center p-4 text-utsav-gold space-y-3">
        <DiyaIcon className="w-12 h-12 animate-pulse" />
        <p className="font-heading text-sm font-bold">Unfolding Royal Indian Digital Invitation...</p>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-utsav-maroon-950 flex flex-col items-center justify-center p-4 text-white text-center space-y-4">
        <DiyaIcon className="w-10 h-10 text-utsav-gold mx-auto" />
        <h2 className="font-heading text-xl font-bold text-utsav-gold">Auspicious E-Card Notice</h2>
        <p className="text-xs text-gray-300 max-w-sm">{error || 'This celebration pass has concluded or is unavailable.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-utsav-maroon-950 py-10 px-4 flex items-center justify-center">
      <DigitalInvitationTemplate invitation={invitation} isPublic={true} />
    </div>
  );
};
