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
          options.onError(new Error(tokenResponse.error_description || tokenResponse.error));
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
              throw new Error(`Google profile request failed with status ${res.status}`);
            }

            const profile = await res.json();
            if (!profile.email) {
              throw new Error('Google did not return a valid email address.');
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
        options.onError(err);
      },
    });

    // Launch official Google Cloud Console popup
    client.requestAccessToken({ prompt: 'select_account' });
  } catch (err: any) {
    options.onError(err);
  }
};
