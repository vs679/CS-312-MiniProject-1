import { useEffect, useState } from 'react';
import { api } from '../api';

const empty = {
    title: '',
    content: '',
    category: 'Other'
};

export default function BlogPostForm({ initialPost, onSaved, onCancel }) {
    const [form, setForm] = useState(empty);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        setForm(
            initialPost
                ? {
                    title: initialPost.title,
                    content: initialPost.body,
                    category: initialPost.category
                }
                : empty
        );

        setError('');
    }, [initialPost]);

    function change(e) {
        setForm(f => ({
            ...f,
            [e.target.name]: e.target.value
        }));
    }

    async function submit(e) {
        e.preventDefault();
        setBusy(true);
        setError('');

        try {
            const result = await api(
                initialPost ? `/blogs/${initialPost.blog_id}` : '/blogs',
                {
                    method: initialPost ? 'PUT' : 'POST',
                    body: JSON.stringify(form)
                }
            );

            onSaved(result.post);

            if (!initialPost) {
                setForm(empty);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="card">
            <h2>{initialPost ? 'Edit post' : 'Create a post'}</h2>

            <form onSubmit={submit}>
                <label>
                    Title
                    <input
                        name="title"
                        maxLength="255"
                        required
                        value={form.title}
                        onChange={change}
                    />
                </label>

                <label>
                    Category
                    <select
                        name="category"
                        value={form.category}
                        onChange={change}
                    >
                        {['Tech', 'Lifestyle', 'Education', 'Other'].map(c => (
                            <option key={c}>{c}</option>
                        ))}
                    </select>
                </label>

                <label>
                    Content
                    <textarea
                        name="content"
                        rows="6"
                        maxLength="20000"
                        required
                        value={form.content}
                        onChange={change}
                    />
                </label>

                <div className="actions">
                    <button disabled={busy}>
                        {initialPost ? 'Save changes' : 'Publish post'}
                    </button>

                    {initialPost && (
                        <button
                            type="button"
                            className="secondary"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {error && (
                <p className="error" role="alert">
                    {error}
                </p>
            )}
        </section>
    );
}
