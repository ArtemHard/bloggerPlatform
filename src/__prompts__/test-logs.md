> Homework 12 Posts likes GET -> "/posts": create 6 posts then:
> like post 1 by user 1, user 2;
> like post 2 by user 2, user 3;
> dislike post 3 by user 1;
> like post 4 by user 1, user 4, user 2, user 3;
> like post 5 by user 2, dislike by user 3;
> like post 6 by user 1, dislike by user 2.
> Get the posts by user 1 after all likes
> NewestLikes should be sorted in descending; status 200; content: posts array with pagination; used additional methods: POST -> /blogs, POST -> /posts, PUT -> posts/:postId/like-status;

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: 500

      102 |     }
      103 |
    > 104 |     expect(status).toBe(expectedStatusCode);
          |                    ^

> Homework 12 Posts likes GET -> "/blogs/:blogId/posts": create 6 posts then:
> like post 1 by user 1, user 2;
> like post 2 by user 2, user 3;
> dislike post 3 by user 1;
> like post 4 by user 1, user 4, user 2, user 3;
> like post 5 by user 2, dislike by user 3;
> like post 6 by user 1, dislike by user 2.
> Get the posts by user 1 after all likes
> NewestLikes should be sorted in descending; status 200; content: posts array with pagination; used additional methods: POST -> /blogs, POST -> /blogs/:blogId/posts, PUT -> posts/:postId/like-status;

    expect(received).toBe(expected) // Object.is equality

    Expected: 200
    Received: undefined

      102 |     }
      103 |
    > 104 |     expect(status).toBe(expectedStatusCode);
          |                    ^
