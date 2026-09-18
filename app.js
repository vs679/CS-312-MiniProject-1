const express = require("express");
const path = require("path");

const app = express();
const port = 3000;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

let posts = [];
let nextId = 1;

app.get("/", (req, res) => {
  const category = req.query.category || "All";

  let shownPosts = posts;

  if (category !== "All") {
    shownPosts = posts.filter(post => post.category === category);
  }

  res.render("index", {
    posts: shownPosts,
    category: category
  });
});

app.post("/posts", (req, res) => {
  const post = {
    id: nextId,
    name: req.body.name,
    title: req.body.title,
    category: req.body.category,
    content: req.body.content,
    createdAt: new Date()
  };

  nextId++;
  posts.push(post);

  res.redirect("/");
});

app.get("/posts/:id/edit", (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find(post => post.id === id);

  if (!post) {
    return res.status(404).send("Post not found");
  }

  res.render("edit", { post });
});

app.post("/posts/:id/edit", (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find(post => post.id === id);

  if (!post) {
    return res.status(404).send("Post not found");
  }

  post.name = req.body.name;
  post.title = req.body.title;
  post.category = req.body.category;
  post.content = req.body.content;

  res.redirect("/");
});

app.post("/posts/:id/delete", (req, res) => {
  const id = Number(req.params.id);

  posts = posts.filter(post => post.id !== id);

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
