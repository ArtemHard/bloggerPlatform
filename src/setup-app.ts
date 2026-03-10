import express, { Express } from "express";
import { BLOGS_PATH, POSTS_PATH, TESTING_PATH, USERS_PATH } from "./core/paths/paths";
import { blogRouter } from "./domain/blog/routers/blog.router";
import { postsRouter } from "./domain/posts/routers/posts.router";
import { testingRouter } from "./testing/routers/testing.routers";
import { userRouter } from "./domain/users/routers/users.router";
 
export const setupApp = (app: Express) => {
  app.use(express.json()); // middleware для парсинга JSON в теле запроса
 
  // основной роут
  app.get("/", (req, res) => {
    res.status(200).send("Hello world!");
  });

  app.use(BLOGS_PATH, blogRouter);
  app.use(POSTS_PATH, postsRouter);
  app.use(USERS_PATH, userRouter);
  app.use(TESTING_PATH, testingRouter);
  return app;
};