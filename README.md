# SmartPlot Portal

SmartPlot Portal is a full-stack Spring Boot + MySQL web application for managing users and plot inventory.

## Features

- User signup
- User login with JWT authentication
- Protected APIs
- View users
- Create, edit, delete plots
- Search and filter plots
- Built-in frontend served by Spring Boot
- Apple-inspired responsive UI

## Tech Stack

- Java 17
- Spring Boot 3
- Spring Web
- Spring Data JPA
- Spring Security
- MySQL
- HTML, CSS, JavaScript

## Run Locally

### 1. Create the database

Create a MySQL database named:

```sql
CREATE DATABASE smart_plot_portal;
```

Your existing `users` table can be reused. The `plots` table will be created automatically by Hibernate if it does not exist.

### 2. Configure environment variables

Use the values from [.env.example](C:/Users/Pranav/Documents/Playground/.env.example).

Example local values:

```text
DB_URL=jdbc:mysql://localhost:3306/smart_plot_portal
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
JPA_DDL_AUTO=update
JPA_SHOW_SQL=false
PORT=8081
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
JWT_EXPIRATION_MS=86400000
```

### 3. Start the app

In VS Code:

1. Open [SmartplotApplication.java](C:/Users/Pranav/Documents/Playground/src/main/java/com/example/smartplot/SmartplotApplication.java)
2. Right-click
3. Click `Run Java`

If Maven is installed:

```powershell
mvn spring-boot:run
```

### 4. Open the website

[http://localhost:8081/](http://localhost:8081/)

Health check:

[http://localhost:8081/health](http://localhost:8081/health)

## Authentication

Public endpoints:

- `POST /signup`
- `POST /login`
- `GET /health`

Protected endpoints:

- `GET /users`
- `GET /plots`
- `POST /plots`
- `PUT /plots/{plotId}`
- `DELETE /plots/{plotId}`

The frontend stores the JWT token in browser `localStorage` after login/signup and sends it automatically on protected requests.

## Project Structure

- [pom.xml](C:/Users/Pranav/Documents/Playground/pom.xml)
- [application.properties](C:/Users/Pranav/Documents/Playground/src/main/resources/application.properties)
- [SmartplotApplication.java](C:/Users/Pranav/Documents/Playground/src/main/java/com/example/smartplot/SmartplotApplication.java)
- [UserController.java](C:/Users/Pranav/Documents/Playground/src/main/java/com/example/smartplot/controller/UserController.java)
- [PlotController.java](C:/Users/Pranav/Documents/Playground/src/main/java/com/example/smartplot/controller/PlotController.java)
- [HealthController.java](C:/Users/Pranav/Documents/Playground/src/main/java/com/example/smartplot/controller/HealthController.java)
- [UserService.java](C:/Users/Pranav/Documents/Playground/src/main/java/com/example/smartplot/service/UserService.java)
- [PlotService.java](C:/Users/Pranav/Documents/Playground/src/main/java/com/example/smartplot/service/PlotService.java)
- [index.html](C:/Users/Pranav/Documents/Playground/src/main/resources/static/index.html)
- [app.js](C:/Users/Pranav/Documents/Playground/src/main/resources/static/app.js)
- [styles.css](C:/Users/Pranav/Documents/Playground/src/main/resources/static/styles.css)

## Deploying for Others to Use

### Option 1: Deploy with Render and Railway

1. Push this project to GitHub.
2. Create a hosted MySQL database on Railway.
3. Create a new web service on Render from the repo.
4. Set environment variables:
   - `DB_URL`
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `JWT_SECRET`
   - `JWT_EXPIRATION_MS`
    - `PORT`
   - optionally `JPA_DDL_AUTO`
   - optionally `JPA_SHOW_SQL`
5. Set health check path to `/health`
6. Deploy and share the public URL.

### Option 2: Docker

Build:

```powershell
docker build -t smartplot-portal .
```

Run:

```powershell
docker run -p 8081:8081 ^
  -e DB_URL=jdbc:mysql://host:3306/smart_plot_portal ^
  -e DB_USERNAME=root ^
  -e DB_PASSWORD=yourpassword ^
  -e JWT_SECRET=replace-with-a-long-random-secret ^
  smartplot-portal
```

## Demo Flow

1. Sign up a new user
2. Log in
3. Create plots
4. Search and filter plots
5. Edit a plot
6. Delete a plot
7. Refresh the page to show login persistence
8. Log out to show protected access

## Current Limitations

- No user roles yet
- No forgot-password flow
- No pagination
- No edit/delete users
- No deployment config committed for a single platform yet
- No automated tests yet

## Recommended Next Steps

- Add admin/user roles
- Link plots to users with relationships
- Add pagination and dashboard stats
- Add test coverage
- Deploy to Render or Railway
