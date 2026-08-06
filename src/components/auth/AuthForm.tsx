'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction, registerAction, type AuthState } from '@/lib/auth/actions';

const initial: AuthState = {};

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const action = mode === 'login' ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState(action, initial);
  const isLogin = mode === 'login';

  return (
    <div className="w-full" style={{ maxWidth: 420 }}>
      <div className="text-center mb-10">
        <p className="overline-text mb-3" style={{ color: '#C9A84C' }}>
          {isLogin ? 'Espace Client' : 'Rejoindre la Maison'}
        </p>
        <h1 className="heading-lg">{isLogin ? 'Connexion' : 'Créer un compte'}</h1>
      </div>

      <form action={formAction} className="flex flex-col gap-6">
        {!isLogin && (
          <div className="grid grid-cols-2 gap-4">
            <input name="firstName" placeholder="Prénom" className="input-luxury" autoComplete="given-name" required />
            <input name="lastName" placeholder="Nom" className="input-luxury" autoComplete="family-name" required />
          </div>
        )}
        <input name="email" type="email" placeholder="Email" className="input-luxury" autoComplete="email" required />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          className="input-luxury"
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          required
        />

        {state.error && (
          <p className="body-refined" style={{ color: '#eb1e7a', fontSize: '0.8rem' }}>{state.error}</p>
        )}

        <button type="submit" disabled={pending} className="btn-primary justify-center mt-2" style={pending ? { opacity: 0.6 } : undefined}>
          <span>{pending ? 'Un instant…' : isLogin ? 'Se connecter' : 'Créer mon compte'}</span>
        </button>
      </form>

      <div className="text-center mt-8">
        {isLogin ? (
          <p className="body-refined" style={{ fontSize: '0.82rem', color: '#666' }}>
            Pas encore de compte ?{' '}
            <Link href="/register" style={{ color: '#eb1e7a' }}>Créer un compte</Link>
          </p>
        ) : (
          <p className="body-refined" style={{ fontSize: '0.82rem', color: '#666' }}>
            Déjà cliente ?{' '}
            <Link href="/login" style={{ color: '#eb1e7a' }}>Se connecter</Link>
          </p>
        )}
      </div>
    </div>
  );
}
