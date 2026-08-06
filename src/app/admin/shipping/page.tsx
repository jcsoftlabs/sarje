export const dynamic = 'force-dynamic';

import { getAdminShipping } from '@/lib/admin/queries';
import { saveShippingMethod, deleteShippingMethod } from '@/lib/admin/actions';
import { formatPrice } from '@/lib/format';

const fieldStyle = { color: '#3A3A3A' } as const;
const cell = { border: '1px solid rgba(58,58,58,0.2)', padding: '8px 10px', fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: '#3A3A3A' } as const;

function MethodForm({ method }: { method?: Awaited<ReturnType<typeof getAdminShipping>>[number] }) {
  return (
    <form action={saveShippingMethod} style={{ background: '#fff', padding: '1.5rem' }} className="flex flex-col gap-4">
      {method && <input type="hidden" name="id" value={method.id} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="overline-text" style={{ color: '#999', fontSize: '0.55rem' }}>Nom</span>
          <input name="name" defaultValue={method?.name} placeholder="Livraison Standard" style={cell} required />
        </label>
        <label className="flex flex-col gap-1">
          <span className="overline-text" style={{ color: '#999', fontSize: '0.55rem' }}>Prix (USD)</span>
          <input name="price" type="number" step="0.01" min="0" defaultValue={method ? (method.priceCents / 100).toFixed(2) : '0'} style={cell} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="overline-text" style={{ color: '#999', fontSize: '0.55rem' }}>Gratuit dès (USD, option.)</span>
          <input name="freeOver" type="number" step="0.01" min="0" defaultValue={method?.freeOverCents ? (method.freeOverCents / 100).toFixed(2) : ''} placeholder="ex. 500" style={cell} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="overline-text" style={{ color: '#999', fontSize: '0.55rem' }}>Délai min (j)</span>
            <input name="minDays" type="number" min="0" defaultValue={method?.minDays ?? ''} style={cell} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="overline-text" style={{ color: '#999', fontSize: '0.55rem' }}>Délai max (j)</span>
            <input name="maxDays" type="number" min="0" defaultValue={method?.maxDays ?? ''} style={cell} />
          </label>
        </div>
      </div>
      <label className="flex flex-col gap-1">
        <span className="overline-text" style={{ color: '#999', fontSize: '0.55rem' }}>Description</span>
        <input name="description" defaultValue={method?.description ?? ''} style={cell} />
      </label>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
          <input type="checkbox" name="active" defaultChecked={method ? method.active : true} />
          <span className="body-refined" style={{ fontSize: '0.8rem', ...fieldStyle }}>Actif</span>
        </label>
        <button type="submit" className="btn-dark" style={{ padding: '0.6rem 1.6rem' }}>
          <span>{method ? 'Enregistrer' : 'Ajouter'}</span>
        </button>
      </div>
    </form>
  );
}

export default async function AdminShippingPage() {
  const methods = await getAdminShipping();

  return (
    <div>
      <div className="mb-10">
        <p className="overline-text mb-2" style={{ color: '#C9A84C' }}>Logistique</p>
        <h1 className="heading-lg">Livraisons</h1>
        <p className="body-refined mt-2" style={{ color: '#888', fontSize: '0.85rem' }}>
          Modes de livraison proposés au paiement. « Gratuit dès » applique la livraison offerte au-delà d&apos;un montant.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {methods.map((m) => (
          <div key={m.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="font-display" style={{ fontSize: '1.2rem', color: '#080808' }}>
                {m.name} <span style={{ color: '#C9A84C', fontSize: '1rem' }}>· {m.priceCents === 0 ? 'Offerte' : formatPrice(m.priceCents, 'USD')}</span>
                {!m.active && <span className="overline-text" style={{ color: '#c88', marginLeft: 10, fontSize: '0.55rem' }}>Inactif</span>}
              </p>
              <form action={deleteShippingMethod}>
                <input type="hidden" name="id" value={m.id} />
                <button type="submit" className="nav-link" style={{ color: '#c88', fontSize: '0.65rem' }}>Supprimer</button>
              </form>
            </div>
            <MethodForm method={m} />
          </div>
        ))}

        <div>
          <p className="overline-text mb-3" style={{ color: '#999' }}>Nouveau mode de livraison</p>
          <MethodForm />
        </div>
      </div>
    </div>
  );
}
