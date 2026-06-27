export type GoogleCredentialResponse = {
  credential?: string;
};

export type GoogleJwtPayload = {
  email?: string;
  email_verified?: boolean | string;
  given_name?: string;
  family_name?: string;
  name?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string | boolean | number>,
          ) => void;
        };
      };
    };
  }
}

const googleScriptSrc = "https://accounts.google.com/gsi/client";
let googleScriptPromise: Promise<void> | null = null;

export const loadGoogleIdentityScript = () => {
  if (!import.meta.client) {
    return Promise.resolve();
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${googleScriptSrc}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = googleScriptSrc;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.head.appendChild(script);
  });

  return googleScriptPromise;
};

export const decodeGoogleJwtPayload = (token: string): GoogleJwtPayload => {
  const payload = token.split(".")[1];

  if (!payload) {
    return {};
  }

  const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
  const paddedPayload = normalizedPayload.padEnd(
    normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
    "=",
  );
  const decodedPayload = atob(paddedPayload);

  return JSON.parse(decodedPayload) as GoogleJwtPayload;
};
