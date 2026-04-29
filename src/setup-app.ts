import "reflect-metadata";
import express, { Express } from "express";
import { BLOGS_PATH, POSTS_PATH, TESTING_PATH, USERS_PATH, AUTH_PATH, COMMENTS_PATH, SECURITY_PATH } from "./core/paths/paths";
import { blogRouter } from "./domain/blog/routers/blog.router";
import { postsRouter } from "./domain/posts/routers/posts.router";
import { testingRouter } from "./testing/routers/testing.routers";
import { userRouter } from "./domain/users/routers/users.router";
import { authRouter } from "./auth/api/auth.router";
import { securityRouter } from "./auth/api/security.router";
import { commentsRouter } from "./domain/comments/routers/comments.router";

const startedAt = new Date();

export const setupApp = (app: Express) => {
  app.use(express.json()); // middleware для парсинга JSON в теле запроса

  // основной роут
  app.get("/", (req, res) => {
    res.send(`Server started at: ${startedAt.toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow"
  })}`);
  });

  app.use(BLOGS_PATH, blogRouter);
  app.use(POSTS_PATH, postsRouter);
  app.use(USERS_PATH, userRouter);
  app.use(AUTH_PATH, authRouter);
  app.use(SECURITY_PATH, securityRouter);
  app.use(TESTING_PATH, testingRouter);
  app.use(COMMENTS_PATH, commentsRouter);
  return app;
};