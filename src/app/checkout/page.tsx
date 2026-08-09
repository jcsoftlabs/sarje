export const dynamic = 'force-dynamic';

import CheckoutForm from '@/components/checkout/CheckoutForm';
import { getActiveShippingMethods, getAddressesForUser } from '@/lib/queries';
import { getCurrentUser } from '@/lib/auth/session';

export const metadata = { title: 'Paiement' };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const [methods, savedAddresses] = await Promise.all([
    getActiveShippingMethods(),
    user ? getAddressesForUser(user.id) : Promise.resolve([]),
  ]);
  return <CheckoutForm methods={methods} savedAddresses={savedAddresses} />;
}
