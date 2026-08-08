export const dynamic = 'force-dynamic';

import CheckoutForm from '@/components/checkout/CheckoutForm';
import { getActiveShippingMethods } from '@/lib/queries';

export const metadata = { title: 'Paiement' };

export default async function CheckoutPage() {
  const methods = await getActiveShippingMethods();
  return <CheckoutForm methods={methods} />;
}
