# FCP Entra example

![Build](https://github.com/defra/fcp-entra-example/actions/workflows/build.yaml/badge.svg)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-entra-example&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-entra-example)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-entra-example&metric=bugs)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-entra-example)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-entra-example&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-entra-example)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-entra-example&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-entra-example)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=DEFRA_fcp-entra-example&metric=coverage)](https://sonarcloud.io/summary/new_code?id=DEFRA_fcp-entra-example)
[![Known Vulnerabilities](https://snyk.io/test/github/defra/fcp-entra-example/badge.svg)](https://snyk.io/test/github/defra/fcp-entra-example)

This is an example service that demonstrates how to use the authenticate internal users within the Farming and Countryside programme (FCP) with Entra.

The patterns used within this example are documented below.  Code comments are also provided to provide extra context.

## Entra

Entra is a service that provides external user authentication and authorisation for Defra services. It is based on the OAuth 2.0 and OpenID Connect standards.

Whilst this service is developed within FCP, the patterns within can be applied to other services that use Entra.

## Sign in flow

1. User accesses a service
1. User is redirected to the Entra login page
1. User logs in
1. User is redirected back to the consuming service with an authorisation code
1. Consuming service exchanges the authorisation code for an access token
1. Consuming service stores JWT token in session

## FCP Development Guide

The [FCP Development Guide](https://defra.github.io/ffc-development-guide/development-patterns/authentication/entra/) provides more context on how to use Entra.

## Prerequisites

- Docker
- Docker Compose

### Environment variables

Once you have your Entra service credentials, you will need to add them to a `.env` file in the root of the project.

```bash
ENTRA_WELL_KNOWN_URL
ENTRA_CLIENT_ID
ENTRA_CLIENT_SECRET
```

## Running the application

The application is designed to run in containerised environments.  Before running the application, you will need to build the Docker image.

```bash
docker compose build
```

### Start

Use Docker Compose to run service locally.

```bash
docker compose up
```

### Running tests

Convenience scripts have been provided to run automated tests in a containerised
environment. 

```bash
# Run all tests
npm run docker:test

# Run tests with file watch
npm run docker:test:watch

# Debug tests
npm run docker:test:debug
```

## Patterns

### Authentication strategies

The application contains two authentication strategies:

1. OAuth2.0 orchestrated by [`@hapi/bell`](https://github.com/hapijs/bell)
1. Cookie-based session management orchestrated by [`@hapi/cookie`](https://github.com/hapijs/cookie)

The OAuth2.0 strategy is used to authenticate users with Entra. Once authenticated, the user is redirected to the application with an access token. 

`@hapi/bell` simplifies the OAuth2.0 process by handling the OAuth2.0 flow and token exchange with Entra including validation of state and nonce to prevent CSRF  and token replay attacks.

The token is validated against the Entra public key to ensure it is valid.

Once the user is authenticated, the application creates a session cookie. This cookie is used to manage the user's session and is used to authenticate the user on subsequent requests.

The OAuth2.0 token and other session data is stored in Redis and can be used to retrieve user information and permissions from downstream services.

The session will end when the user signs out or the browser is closed.  This is to align with the behaviour of other farming services.

### Redirections

When an unauthenticated user accesses a route that requires authentication, the application will redirect the user to the Entra sign in endpoint. 

The original path is stored in Redis session storage and is retrieved once the user has signed in.  The user is then redirected back to the original path.

[`@hapi/yar`](https://github.com/hapijs/yar) is used to store the original path in the session.  Like `@hapi/cookie`, `@hapi/yar` is a cookie-based session management plugin, but is used for unauthenticated users.

### Sign out

When a user signs out, the application will redirect the user to the Entra sign out endpoint.  Once the user has signed out, they will be redirected back to the application.

The application will then clear the session and the user will be signed out.

As sign out is not a feature supported by `@hapi/bell`, a module has been created to ensure the redirect Url is correctly set and appropriate state validation is performed to prevent CSRF attacks.

### Refreshing tokens

As part of the cookie authentication strategy, the application will check if the token has expired.  
If the token has expired, it will be refreshed automatically if the `ENTRA_REFRESH_TOKENS` environment variable is set to `true`.

As refreshing tokens is not a feature supported by `@hapi/bell`, a module has been created to handle the token refresh process.

### Protecting routes

This example sets cookie authentication as the default authentication strategy for all routes.  
This means that all routes are protected by default unless explicitly set to be unprotected or use the Entra OAuth2.0 strategy.

Hapi.js authorisation is simpler when using scopes.  Scopes are used to define the permissions a user has within the application.

Permissions retrieved from Siti Agri are mapped to the `scope` property of the user session.  This session data is added to the `request.auth.credentials` object on each request.

Routes can be protected by scopes by using the `scope` property in the route configuration.  The `/home` route is an example of this where `user` scope is required.

If any route does not have a scope defined, it will be accessible to all authenticated users.

The `/` route is set to be unprotected and only tries to authenticate the to allow users to access the start page without being authenticated.

If a user tries to access a route without the required scope, the `error` plugin will return the `403` page.

### View templates

User session data is passed to the view templates to enable the conditional rendering of content based on the user's permissions.

This is handled by the `view` plugin which adds the `auth` object to the view context.  This object contains the user's permissions and other session data.

The `home` view is an example of this where all session data is displayed.

> In a real-world scenario, the user token data should not be displayed in the view.

### Security

The application has been designed with security in mind.  The following security patterns have been implemented:
- Content Security Policy (CSP) to prevent cross-site scripting attacks
- HTTP Strict Transport Security (HSTS) to ensure all communication is over HTTPS
- Referrer Policy to prevent leaking sensitive information
- X-Content-Type-Options to prevent MIME type sniffing
- X-Frame-Options to prevent clickjacking
- X-XSS-Protection to prevent cross-site scripting attacks
- Authorisation code exchange to prevent token leakage
- Public key verification to ensure token is signed by Entra
- State and nonce validation to prevent CSRF and token replay attacks
- Token expiration validation
- Session management to prevent session fixation attacks
- Scope-based authorisation to prevent unauthorised access
- Redirect validation to prevent open redirects
- No store policy to prevent caching of sensitive information and back button and browser history attacks

> **Important** Security is subjective and should be reviewed to ensure it meets the requirements of the service and the technologies used.

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government license v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable information providers in the public sector to license the use and re-use of their information under a common open licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
