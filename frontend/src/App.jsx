import { useEffect, useState } from 'react';
import { api } from './api';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import BlogPostForm from './components/BlogPostForm';
import PostList from './components/PostList';
import Profile from './components/Profile';

export default function App() {
    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(true);

    const [page, setPage] = useState('home');
    const [posts, setPosts] = useState([]);
    const [category, setCategory] = useState('All');

    const [editing, setEditing] = useState(null);
    const [error, setError] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        api('/auth/me')
            .then(d => setUser(d.user))
            .catch(e => setError(e.message))
            .finally(() => setChecking(false));
    }, []);

    useEffect(() => {
        let active = true;

        api(`/blogs?category=${encodeURIComponent(category)}`)
            .then(d => {
                if (active) {
                    setPosts(d.posts);
                }
            })
            .catch(e => {
                if (active) {
                    setError(e.message);
                }
            });

        return () => {
            active = false;
        };
    }, [category, refreshKey]);

    function onSaved(post) {
        setEditing(null);
        setRefreshKey(k => k + 1);
        setPage('home');
    }

    function edit(post) {
        setEditing(post);
        setPage('home');
        window.scrollTo(0, 0);
    }

    async function remove(post) {
        if (!window.confirm(`Delete "${post.title}"?`)) {
            return;
        }

        try {
            await api(`/blogs/${post.blog_id}`, {
                method: 'DELETE'
            });

            setRefreshKey(k => k + 1);
        } catch (e) {
            setError(e.message);
        }
    }

    async function signout() {
        try {
            await api('/auth/signout', {
                method: 'POST'
            });

            setUser(null);
            setPage('signin');
            setEditing(null);
        } catch (e) {
            setError(e.message);
        }
    }

    if (checking) {
        return <p className="loading">Loading...</p>;
    }

    return (
        <>
            <header>
                <div className="container nav">
                    <h1>Blog Hub</h1>

                    <nav>
                        <button
                            className="navbutton"
                            onClick={() => {
                                setPage('home');
                                setEditing(null);
                            }}
                        >
                            Home
                        </button>

                        {user ? (
                            <>
                                <button
                                    className="navbutton"
                                    onClick={() => setPage('profile')}
                                >
                                    My Profile
                                </button>

                                <span className="welcome">
                                    {user.name}
                                </span>

                                <button onClick={signout}>
                                    Sign out
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="navbutton"
                                    onClick={() => setPage('signin')}
                                >
                                    Sign in
                                </button>

                                <button
                                    onClick={() => setPage('signup')}
                                >
                                    Sign up
                                </button>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            <div className="container layout">
                {error && (
                    <div role="alert" className="alert">
                        {error}

                        <button
                            className="link"
                            onClick={() => setError('')}
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {page === 'signup' ? (
                    <SignUp
                        onSwitch={() => setPage('signin')}
                    />
                ) : page === 'signin' ? (
                    <SignIn
                        onSuccess={u => {
                            setUser(u);
                            setPage('home');
                        }}
                        onSwitch={() => setPage('signup')}
                    />
                ) : page === 'profile' && user ? (
                    <Profile
                        user={user}
                        refreshKey={refreshKey}
                        onEdit={edit}
                        onDelete={remove}
                    />
                ) : (
                    <main>
                        {user ? (
                            <BlogPostForm
                                initialPost={editing}
                                onSaved={onSaved}
                                onCancel={() => setEditing(null)}
                            />
                        ) : (
                            <section className="card">
                                <h2>Welcome to Blog Hub</h2>

                                <p>
                                    Read blog posts below. Sign in to publish your own.
                                </p>

                                <button
                                    onClick={() => setPage('signin')}
                                >
                                    Sign in to post
                                </button>
                            </section>
                        )}

                        <div className="post-header">
                            <h2>Latest Posts</h2>

                            <label className="filter">
                                Category

                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                >
                                    {[
                                        'All',
                                        'Tech',
                                        'Lifestyle',
                                        'Education',
                                        'Other'
                                    ].map(c => (
                                        <option key={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <PostList
                            posts={posts}
                            user={user}
                            onEdit={edit}
                            onDelete={remove}
                        />
                    </main>
                )}
            </div>
        </>
    );
}