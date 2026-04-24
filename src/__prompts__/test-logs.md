> Homework 11 Comment likes POST -> "/posts/:postId/comments": should create new comment; status 201; content: created comment; used additional methods: POST -> /blogs, POST -> /posts, GET -> /comments/:commentId;

    Expected: success response

    Received: Request failed with status code 401

    Config:
     url: comments/69eb69e073b9f79d2d018559
     method: get
     response status: 401
     request body: undefined
     response data: "Unauthorized"

      22 |     };
      23 |
    > 24 |     expect(mappedError).printError(description);
         |                         ^
      25 |   }
      26 |
      27 |   throw new Error(error.message);

      at handleTestError (src/tests/jest/back/testHelpers/handleTestError.ts:24:25)
      at src/tests/jest/back/testHelpers/performTestsFlow/performTestsFlow.ts:70:38
      at performPOSTTestFlow (src/tests/jest/back/testHelpers/performTestsFlow/performTestsFlow.ts:68:41)
      at Object.<anonymous> (src/tests/jest/back/describes/comments/comments-V2-describe.ts:97:7)

> Homework 11 Comment likes GET -> "comments/:commentsId": should return status 200; content: comment by id; used additional methods: POST -> /blogs, POST -> /posts, POST -> /posts/:postId/comments;

    Expected: success response

    Received: Request failed with status code 401

    Config:
     url: comments/69eb69e273b9f79d2d01855c
     method: get
     response status: 401
     request body: undefined
     response data: "Unauthorized"

      22 |     };
      23 |
    > 24 |     expect(mappedError).printError(description);
         |                         ^
      25 |   }
      26 |
      27 |   throw new Error(error.message);

      at handleTestError (src/tests/jest/back/testHelpers/handleTestError.ts:24:25)
      at src/tests/jest/back/testHelpers/performTestsFlow/performTestsFlow.ts:83:38
      at performGETByIdTestFlow (src/tests/jest/back/testHelpers/performTestsFlow/performTestsFlow.ts:81:72)
      at Object.<anonymous> (src/tests/jest/back/describes/comments/comments-V2-describe.ts:202:7)

> Homework 11 Comment likes GET -> "/comments/:commentId": get comment by unauthorized user. Should return liked comment with 'myStatus: None'; status 204; used additional methods: POST => /blogs, POST => /posts, POST => /posts/:postId/comments, PUT => /comments/:commentId/like-status;

    Expected: success response

    Received: Request failed with status code 401

    Config:
     url: comments/69eb69e773b9f79d2d018562
     method: get
     response status: 401
     request body: undefined
     response data: "Unauthorized"

      22 |     };
      23 |
    > 24 |     expect(mappedError).printError(description);
         |                         ^
      25 |   }
      26 |
      27 |   throw new Error(error.message);

      at handleTestError (src/tests/jest/back/testHelpers/handleTestError.ts:24:25)
      at src/tests/jest/back/testHelpers/performTestsFlow/performTestLikesFlow.ts:175:38
      at performGetLikeByUnauthorizedUser (src/tests/jest/back/testHelpers/performTestsFlow/performTestLikesFlow.ts:173:34)
      at Object.<anonymous> (src/tests/jest/back/describes/likes/commentsLikes-describe-v2.ts:354:7)

> Homework 11 Comment likes GET -> "/posts/:postId/comments": create 6 comments then:
> like comment 1 by user 1, user 2;
> like comment 2 by user 2, user 3;
> dislike comment 3 by user 1;
> like comment 4 by user 1, user 4, user 2, user 3;
> like comment 5 by user 2, dislike by user 3;
> like comment 6 by user 1, dislike by user 2.
> Get the comments by user 1 after all likes
> ; status 200; content: comments array for post with pagination; used additional methods: POST => /blogs, POST => /posts, POST => /posts/:postId/comments, PUT -> /posts/:postId/like-status;

    Passed queryParams: ""

    Expected: {"pagesCount":1,"page":1,"pageSize":10,"totalCount":6,"items":[{"id":"69eb6a0d73b9f79d2d018589","content":"length_21-weqweqweqwq","commentatorInfo":{"userId":"69eb69e873b9f79d2d018563","userLogin":"2538lg"},"createdAt":"2026-04-24T13:03:09.668Z","likesInfo":{"likesCount":1,"dislikesCount":1,"myStatus":"Like"}},{"id":"69eb6a0d73b9f79d2d018588","content":"length_21-weqweqweqwq","commentatorInfo":{"userId":"69eb69e873b9f79d2d018563","userLogin":"2538lg"},"createdAt":"2026-04-24T13:03:09.047Z","likesInfo":{"likesCount":1,"dislikesCount":1,"myStatus":"None"}},{"id":"69eb6a0c73b9f79d2d018587","content":"length_21-weqweqweqwq","commentatorInfo":{"userId":"69eb69e873b9f79d2d018563","userLogin":"2538lg"},"createdAt":"2026-04-24T13:03:08.427Z","likesInfo":{"likesCount":4,"dislikesCount":0,"myStatus":"Like"}},{"id":"69eb6a0b73b9f79d2d018586","content":"length_21-weqweqweqwq","commentatorInfo":{"userId":"69eb69e873b9f79d2d018563","userLogin":"2538lg"},"createdAt":"2026-04-24T13:03:07.806Z","likesInfo":{"likesCount":0,"dislikesCount":1,"myStatus":"Dislike"}},{"id":"69eb6a0b73b9f79d2d018585","content":"length_21-weqweqweqwq","commentatorInfo":{"userId":"69eb69e873b9f79d2d018563","userLogin":"2538lg"},"createdAt":"2026-04-24T13:03:07.184Z","likesInfo":{"likesCount":2,"dislikesCount":0,"myStatus":"None"}},{"id":"69eb6a0a73b9f79d2d018584","content":"length_21-weqweqweqwq","commentatorInfo":{"userId":"69eb69e873b9f79d2d018563","userLogin":"2538lg"},"createdAt":"2026-04-24T13:03:06.562Z","likesInfo":{"likesCount":2,"dislikesCount":0,"myStatus":"Like"}}]}

    Received: {"items":[{"id":"69eb6a0d73b9f79d2d018589","content":"length_21-weqweqweqwq","commentatorInfo":{"userId":"69eb69e873b9f79d2d018563","userLogin":"2538lg"},"createdAt":"2026-04-24T13:03:09.668Z","likesInfo":{"likesCount":1,"dislikesCount":1,"myStatus":"None"}},{"id":"69eb6a0d73b9f79d2d018588","content":"length_21-weqweqweqwq","commentatorInfo":{"userId":"69eb69e873b9f79d2d018563","userLogin":"2538lg"},"createdAt":"2026-04-24T13:03:09.047Z","likesInfo":{"likesCount":1,"dislikesCount":1,"myStatus":"None"}},{"id":"69eb6a0c73b9f79d2d018587","content":"length_21-weqweqweqwq","commentatorInfo":{"userId":"69eb69e873b9f79d2d018563","userLogin":"2538lg"},"createdAt":"2026-04-24T13:03:08.427Z","likesInfo":{"likesCount":4,"dislikesCount":0,"myStatus":"None"}},{"id":"69eb6a0b73b9f79d2d018586","content":"length_21-weqweqweqwq","commentatorInfo":{"userId":"69eb69e873b9f79d2d018563","userLogin":"2538lg"},"createdAt":"2026-04-24T13:03:07.806Z","likesInfo":{"likesCount":0,"dislikesCount":1,"myStatus":"None"}},{"id":"69eb6a0b73b9f79d2d018585","content":"length_21-weqweqweqwq","commentatorInfo":{"userId":"69eb69e873b9f79d2d018563","userLogin":"2538lg"},"createdAt":"2026-04-24T13:03:07.184Z","likesInfo":{"likesCount":2,"dislikesCount":0,"myStatus":"None"}},{"id":"69eb6a0a73b9f79d2d018584","content":"length_21-weqweqweqwq","commentatorInfo":{"userId":"69eb69e873b9f79d2d018563","userLogin":"2538lg"},"createdAt":"2026-04-24T13:03:06.562Z","likesInfo":{"likesCount":2,"dislikesCount":0,"myStatus":"None"}}],"page":1,"pageSize":10,"pagesCount":1,"totalCount":6}

    Attention: "addedAt": Any<String> is equal to any date string, don't worry about highlighting this field

    - Expected
    + Received

    @@ -9,11 +9,11 @@
            "createdAt": "2026-04-24T13:03:09.668Z",
            "id": "69eb6a0d73b9f79d2d018589",
            "likesInfo": Object {
              "dislikesCount": 1,
              "likesCount": 1,
    -         "myStatus": "Like",
    +         "myStatus": "None",
            },
          },
          Object {
            "commentatorInfo": Object {
              "userId": "69eb69e873b9f79d2d018563",
    @@ -37,11 +37,11 @@
            "createdAt": "2026-04-24T13:03:08.427Z",
            "id": "69eb6a0c73b9f79d2d018587",
            "likesInfo": Object {
              "dislikesCount": 0,
              "likesCount": 4,
    -         "myStatus": "Like",
    +         "myStatus": "None",
            },
          },
          Object {
            "commentatorInfo": Object {
              "userId": "69eb69e873b9f79d2d018563",
    @@ -51,11 +51,11 @@
            "createdAt": "2026-04-24T13:03:07.806Z",
            "id": "69eb6a0b73b9f79d2d018586",
            "likesInfo": Object {
              "dislikesCount": 1,
              "likesCount": 0,
    -         "myStatus": "Dislike",
    +         "myStatus": "None",
            },
          },
          Object {
            "commentatorInfo": Object {
              "userId": "69eb69e873b9f79d2d018563",
    @@ -79,11 +79,11 @@
            "createdAt": "2026-04-24T13:03:06.562Z",
            "id": "69eb6a0a73b9f79d2d018584",
            "likesInfo": Object {
              "dislikesCount": 0,
              "likesCount": 2,
    -         "myStatus": "Like",
    +         "myStatus": "None",
            },
          },
        ],
        "page": 1,
        "pageSize": 10,

      105 |
      106 |     if (expectedData) {
    > 107 |       expect(data).toBeEqualWithQueryParams(expectedData, queryParams, withDiffPrint);
          |                    ^
      108 |     }
      109 |   }
      110 | };

      at performQueryParamsChecker (src/tests/jest/back/testHelpers/performCheckers.ts:107:20)
      at Object.<anonymous> (src/tests/jest/back/describes/likes/commentsLikes-describe-v2.ts:259:7)
