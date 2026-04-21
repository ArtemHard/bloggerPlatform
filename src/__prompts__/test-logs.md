> Homework 10 Password recovery POST -> "auth/password-recovery": should send email with recovery code; status 204;

    expect(received).toEqual(expected) // deep equality

    Expected: Any<String>
    Received: null

> Homework 10 Password recovery POST -> "auth/new-password": should return error if password is incorrect; status 400;

    expect(received).not.toBeUndefined()

    Received: undefined

> Homework 10 Password recovery POST -> "auth/new-password": should confirm password recovery; status 204;

    expect(received).not.toBeUndefined()

> Homework 10 Password recovery POST -> "auth/password-recovery": should return status 401 if try to login with old password; status 401;

    Expected: 401
    Received: 200

> Homework 10 Password recovery POST -> "/auth/login": should sign in user with new password; status 200; content: JWT token;

    expect(received).not.toBeUndefined()
