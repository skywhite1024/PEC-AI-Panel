import { PaymentIntentHandler } from './types';

export const OPEN_AUTH_MODAL_EVENT = 'pec-ai:open-auth-modal';

const showMembershipToast = (message: string) => {
  const toast = document.createElement('div');
  toast.className = 'fixed top-10 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg z-[100] animate-bounce';
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, 3000);
};

export const handlePaymentIntent: PaymentIntentHandler = (planType, amount, details) => {
  console.log('User Payment Intent:', {
    planType,
    amount,
    details,
    timestamp: new Date().toISOString()
  });

  const authToken = localStorage.getItem('auth_token');
  if (!authToken) {
    window.dispatchEvent(new CustomEvent(OPEN_AUTH_MODAL_EVENT));
    return;
  }

  showMembershipToast('已收到开通意向，我们将尽快与您联系');
};
