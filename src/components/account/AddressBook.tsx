'use client';

import { useActionState, useState } from 'react';
import { Plus, Star, Trash2 } from 'lucide-react';
import { addAddress, deleteAddress, setDefaultAddress, type AddressState } from '@/lib/account/actions';
import type { SavedAddress } from '@/lib/queries';

const cell = { border: '1px solid rgba(58,58,58,0.2)', padding: '9px 11px', fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#3A3A3A' } as const;

export default function AddressBook({ addresses }: { addresses: SavedAddress[] }) {
  const [state, action, pending] = useActionState(addAddress, {} as AddressState);
  const [showForm, setShowForm] = useState(addresses.length === 0);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {addresses.map((a) => (
          <div key={a.id} className="p-5" style={{ background: '#fff', border: a.isDefault ? '1px solid #C9A84C' : '1px solid #eee' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="body-refined" style={{ fontSize: '0.9rem', color: '#080808' }}>{a.firstName} {a.lastName}</p>
              {a.isDefault && <span className="overline-text" style={{ color: '#C9A84C', fontSize: '0.55rem' }}>★ Par défaut</span>}
            </div>
            <div className="body-refined" style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.7 }}>
              <p>{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
              <p>{a.city} {a.region} {a.postalCode}</p>
              <p>{a.country}</p>
            </div>
            <div className="flex items-center gap-4 mt-4">
              {!a.isDefault && (
                <form action={setDefaultAddress}>
                  <input type="hidden" name="id" value={a.id} />
                  <button type="submit" className="nav-link flex items-center gap-1" style={{ color: '#9a7a38', fontSize: '0.62rem' }}><Star size={12} /> Par défaut</button>
                </form>
              )}
              <form action={deleteAddress}>
                <input type="hidden" name="id" value={a.id} />
                <button type="submit" className="nav-link flex items-center gap-1" style={{ color: '#c88', fontSize: '0.62rem' }}><Trash2 size={12} /> Supprimer</button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-3" style={{ border: '1px dashed rgba(58,58,58,0.3)', background: '#fff', color: '#3A3A3A', fontFamily: 'var(--font-body)', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>
          <Plus size={14} /> Ajouter une adresse
        </button>
      ) : (
        <form action={action} style={{ background: '#fff', padding: '1.5rem', maxWidth: 560 }} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input name="firstName" placeholder="Prénom" style={cell} required />
            <input name="lastName" placeholder="Nom" style={cell} required />
            <input name="line1" placeholder="Adresse" style={{ ...cell, gridColumn: '1 / -1' }} required />
            <input name="line2" placeholder="Complément (optionnel)" style={{ ...cell, gridColumn: '1 / -1' }} />
            <input name="city" placeholder="Ville" style={cell} required />
            <input name="region" placeholder="État / Région" style={cell} />
            <input name="postalCode" placeholder="Code postal" style={cell} required />
            <input name="country" placeholder="Pays" defaultValue="US" style={cell} required />
            <input name="phone" placeholder="Téléphone (optionnel)" style={{ ...cell, gridColumn: '1 / -1' }} />
          </div>
          {state.error && <p className="body-refined" style={{ color: '#eb1e7a', fontSize: '0.78rem' }}>{state.error}</p>}
          <div className="flex items-center gap-4">
            <button type="submit" disabled={pending} className="btn-primary" style={{ padding: '0.7rem 1.8rem' }}><span>{pending ? 'Ajout…' : 'Enregistrer'}</span></button>
            {addresses.length > 0 && <button type="button" onClick={() => setShowForm(false)} className="nav-link" style={{ color: '#666' }}>Annuler</button>}
          </div>
        </form>
      )}
    </div>
  );
}
