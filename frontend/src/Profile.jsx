import { useEffect, useState } from 'react';
import { api } from '../api';
import PostList from './PostList';

export default function Profile({ user, onEdit, onDelete, refreshKey }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let active = true;

        api('/profile')
            .then(d => {
                if (active) {
                    setData(d);
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
    }, [refreshKey]);

    return (
        <main>
            <section className="card">
                <h2>My Profile</h2>

                <p>
                    <strong>User ID:</strong> {data?.user.user_id || user.user_id}
                </p>

                <p>
                    <strong>Name:</strong> {data?.user.name || user.name}
                </p>
            </section>

            <h2>My Posts</h2>

            {error && (
                <p className="error">{error}</p>
            )}

            {data ? (
                <PostList
                    posts={data.posts}
                    user={user}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ) : (
                <p>Loading profile...</p>
            )}
        </main>
    );
}
