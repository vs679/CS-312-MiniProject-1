import { useState } from 'react';
import { api } from '../api';

export default function SignIn({ onSuccess, onSwitch }) {
    const [user_id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function submit(e) {
        e.preventDefault();
        setBusy(true);
        setError('');

        try {
            const data = await api('/auth/signin', {
                method: 'POST',
                body: JSON.stringify({ user_id, password })
            });

            onSuccess(data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="auth card">
            <h2>Sign in</h2>

            <form onSubmit={submit}>
                <label>
                    User ID
                    <input
                        required
                        value={user_id}
                        onChange={e => setId(e.target.value)}
                        autoComplete="username"
                    />
                </label>

                <label>
                    Password
                    <input
                        required
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete="current-password"
                    />
                </label>

                <button disabled={busy}>
                    Sign in
                </button>
            </form>

            {error && (
                <p role="alert" className="error">
                    {error}
                </p>
            )}

            <p>
                Don't have an account?{' '}
                <button
                    className="link"
                    onClick={onSwitch}
                >
                    Sign up
                </button>
            </p>
        </section>
    );
}
