declare global {
  interface Window {
    google?: any;
  }
}

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '1057954086797-9nslebcooea2rejjll6mpk0fdiu7eh60.apps.googleusercontent.com';

/**
 * Load Google Identity Services script dynamically
 */
export const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.google?.accounts) {
      resolve();
      return;
    }

    const existingScript = document.getElementById('google-gsi-client');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => resolve(); // Resolve anyway to allow fallback
    document.body.appendChild(script);
  });
};

/**
 * Trigger Google Cloud Console OAuth 2.0 Account Chooser / Consent Popup
 */
export const triggerGoogleOAuthPopup = async (options: {
  onSuccess: (profile: { email: string; name: string; picture?: string; id?: string }) => void;
  onError: (error: any) => void;
}): Promise<void> => {
  await loadGoogleScript();

  if (!window.google?.accounts?.oauth2 || !GOOGLE_CLIENT_ID) {
    options.onError(new Error('Google Identity Services SDK is initializing or Client ID is missing.'));
    return;
  }

  try {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'openid email profile',
      callback: async (tokenResponse: any) => {
        if (tokenResponse.error) {
          let errorMsg = tokenResponse.error_description || tokenResponse.error;
          if (tokenResponse.error === 'access_denied') {
            errorMsg = 'Google Cloud Console Access Denied: If this app is in Testing mode, ensure this Google email is added to Test Users in Google Cloud Console OAuth consent screen.';
          } else if (tokenResponse.error === 'origin_mismatch') {
            errorMsg = `Google Cloud Console Origin Mismatch: Please ensure ${window.location.origin} is listed under Authorized JavaScript origins in Google Cloud Console Credentials.`;
          }
          options.onError(new Error(errorMsg));
          return;
        }

        if (tokenResponse.access_token) {
          try {
            // Fetch real verified Google profile from Google userinfo endpoint
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            });

            if (!res.ok) {
              const errBody = await res.json().catch(() => ({}));
              throw new Error(errBody.error_description || `Google profile verification failed (${res.status}). Invalid Google account.`);
            }

            const profile = await res.json();
            if (!profile.email) {
              throw new Error('Google did not return a valid email address.');
            }

            if (profile.email_verified === false) {
              throw new Error('Google account email is not verified. Please verify your Google account.');
            }

            options.onSuccess({
              email: profile.email,
              name: profile.name || profile.given_name || profile.email.split('@')[0],
              picture: profile.picture,
              id: profile.sub,
            });
          } catch (fetchErr: any) {
            options.onError(fetchErr);
          }
        }
      },
      error_callback: (err: any) => {
        let msg = err?.message || 'Google Sign-In popup was cancelled or blocked by browser.';
        if (err?.type === 'popup_closed') {
          msg = 'Google sign-in popup was closed before completing authentication.';
        } else if (err?.type === 'access_denied') {
          msg = 'Google Cloud Console Access Denied: User not authorized in Test Users list.';
        }
        options.onError(new Error(msg));
      },
    });

    // Launch official Google Cloud Console popup
    client.requestAccessToken({ prompt: 'select_account' });
  } catch (err: any) {
    options.onError(err);
  }
};
