Welcome to the Users microservice. This is one of the core microservices of the app.

# API Users Endpoints

The following API endpoints for managing the users are available:

* `GET /api/users/:user_id`
  * Description: Get the user with the given ID.
  * HTTP Response: 200 OK
  * Caller header:
    * `x-auth-token`: The JWT token for the logged in user.
  * Caller body: Empty
  * Response body:
    * The JSON representation of the user, including the user ID and role.

* `POST /api/users`
  * Description: Create a new user and get the JWT token for logging in.
  * HTTP Response: 201 CREATED
  * Caller body:
    * `name`: The user's name.
    * `email`: The user's email address.
    * `password`: The user's password.
    * `birthday`: The user's birthday (in the format `YYYY-MM-DD`).
  * Response header:
    * `x-auth-token`: The JWT token for the newly created user.
  * Response body: Empty

* `PATCH /api/users/:user_id`
  * Description: Partially modify a specific user.
  * HTTP Response: 200 OK
  * Caller header:
    * `x-auth-token`: The JWT token for the logged in user.
  * Caller body:
    * The JSON representation of the user's attributes to be modified.
  * Response header: Empty
  * Response body:
    * The JSON representation of the updated user.
* `DELETE /api/users/:user_id`
  * Description: Delete a specific user.
  * HTTP Response: 200 OK
  * Caller header:
    * `x-auth-token`: The JWT token for the logged in user.
  * Caller body: Empty
  * Response Body: Empty

## Additional Authentication Routes

* `POST auth/login`
  * Description: Validate login and generate JWT token.
  * HTTP Response: 200 OK
  * Caller body:
    * `email`: The user's email address.
    * `password`: The user's password.
  * Response body: The JWT token.

* `GET auth/token`
  * Description: Validate JWT token.
  * HTTP Response: 200 OK
  * Caller header:
    * `x-auth-token`: The JWT token.
  * Response body: `true` if the token is valid, `false` otherwise.

* `DELETE auth/logout`
  * Description: Logout the user and invalidate the JWT token.
  * HTTP Response: 200 OK
  * Caller header:
    * `x-auth-token`: The JWT token.
  * Response body: `User logged out`.
