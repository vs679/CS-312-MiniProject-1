import { useState } from 'react';
import { api } from '../api';

export default function SignUp({ onSwitch }) {
    const [form, setForm] = useState({
        user_id: '',
        name: '',
        password: ''
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const change = e => {
        setForm(f => ({
            ...f,
            [e.target.name]: e.target.value
        }));
    };

    async function submit(e) {
        e.preventDefault();
        setBusy(true);
        setError('');
        setMessage('');

        try {
            const data = await api('/auth/signup', {
                method: 'POST',
                body: JSON.stringify(form)
            });

            setMessage(data.message);

            setForm({
                user_id: '',
                name: '',
                password: ''
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="auth card">
            <h2>Create an account</h2>

            <form onSubmit={submit}>
                <label>
                    User ID
                    <input
                        name="user_id"
                        required
                        value={form.user_id}
                        onChange={change}
                        autoComplete="username"
                    />
                </label>

                <label>
                    Name
                    <input
                        name="name"
                        required
                        value={form.name}
                        onChange={change}
                        autoComplete="name"
                    />
                </label>

                <label>
                    Password
                    <input
                        name="password"
                        required
                        minLength={8}
                        type="password"
                        value={form.password}
                        onChange={change}
                        autoComplete="new-password"
                    />
                </label>

                <button disabled={busy}>
                    Create account
                </button>
            </form>

            {error && (
                <p role="alert" className="error">
                    {error}
                </p>
            )}

            {message && (
                <p role="status" className="success">
                    {message}
                </p>
            )}

            <p>
                Already have an account?{' '}
                <button
                    className="link"
                    onClick={onSwitch}
                >
                    Sign in
                </button>
            </p>
        </section>
    );
}
