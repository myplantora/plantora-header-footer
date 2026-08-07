import { MetaEventData, MetaEventName, MetaUserData } from './meta.types';
import { isMetaEnabled, validateMetaPayload, generateEventId } from './meta.helpers';
import config from '../../../config/globalconf.json';

const metaConfig = config.analytics?.meta;
const isDev = import.meta.env.DEV;

/**
 * Core tracking function for Meta Pixel
 */
export const trackMetaEvent = (
  eventName: MetaEventName | string,
  data?: MetaEventData,
  userData?: MetaUserData
) => {
  if (!isMetaEnabled()) {
    if (isDev && !metaConfig?.pixelId && metaConfig?.enabled) {
      console.warn('Meta Pixel: enabled but pixelId is missing in globalconfig.json');
    }
    return;
  }

  // Ensure fbq exists (it should be queued if the script is still loading)
  if (typeof window.fbq !== 'function') {
    if (isDev) console.warn('Meta Pixel: fbq is not a function. Event queued if SDK snippet is present.');
    return;
  }

  const eventId = generateEventId();
  const payload = {
    ...data,
    eventID: eventId,
  };

  validateMetaPayload(eventName as MetaEventName, data);

  if (isDev) {
    console.group(`%c META EVENT: ${eventName}`, 'color: #1877F2; font-weight: bold;');
    console.log('Payload:', payload);
    if (userData) console.log('User Data (Advanced Matching):', userData);
    console.groupEnd();
  }

  try {
    if (userData) {
      window.fbq('trackCustom', eventName, payload, { eventID: eventId });
    } else {
      window.fbq('track', eventName, payload, { eventID: eventId });
    }
  } catch (error) {
    console.error('Meta Pixel tracking error:', error);
  }
};

/**
 * Specifically for PageView tracking
 */
export const trackMetaPageView = () => {
  if (!isMetaEnabled()) return;
  
  try {
    window.fbq('track', 'PageView');
    if (isDev) console.log('%c META EVENT: PageView', 'color: #1877F2; font-weight: bold;');
  } catch (error) {
    console.error('Meta Pixel PageView error:', error);
  }
};

/**
 * Initialize the Meta Pixel
 */
export const initMetaPixel = (userData?: MetaUserData) => {
  const pixelId = metaConfig?.pixelId;
  
  if (!isMetaEnabled() || !pixelId) return;

  if (window._fbq) return; // Prevent double init

  /* eslint-disable */
  (function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js'));
  /* eslint-enable */

  if (userData) {
    window.fbq('init', pixelId, userData);
  } else {
    window.fbq('init', pixelId);
  }
};
