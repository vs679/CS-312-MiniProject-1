export default function PostList({ posts, user, onEdit, onDelete }) {
    if (!posts.length) {
        return (
            <div className="card">
                <p>No posts yet.</p>
            </div>
        );
    }

    return (
        <div className="posts">
            {posts.map(post => (
                <article className="card" key={post.blog_id}>
                    <div className="meta">
                        {post.category} · {post.creator_name} · {new Date(post.date_created).toLocaleDateString()}
                    </div>

                    <h3>{post.title}</h3>

                    <p className="body">{post.body}</p>

                    {user?.user_id === post.creator_user_id && (
                        <div className="actions">
                            <button
                                className="secondary"
                                onClick={() => onEdit(post)}
                            >
                                Edit
                            </button>

                            <button
                                className="danger"
                                onClick={() => onDelete(post)}
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </article>
            ))}
        </div>
    );
}
