
# 🍽️ Culinary Coordinator

**Culinary Coordinator** is a microservices-based web application designed to help users explore food items, manage their favorites, and maintain personal profiles. Built with a modern React frontend and Spring Boot-based backend, it provides secure and scalable access to a curated culinary dataset.

---

## 📁 Folder Structure

```
CULINARY-APP/
├── public/
├── src/
│   ├── components/
│   │   ├── favorites/          # Favorites UI logic
│   │   ├── items/              # Item listing and display
│   │   ├── login/              # Login form
│   │   ├── navbar/             # Top navigation bar
│   │   ├── notfound/           # 404 Not Found page
│   │   ├── protectedroute/     # Route guard for authenticated views
│   │   ├── register/           # Registration form
│   │   └── userprofile/        # View and update profile
│   ├── services/
│   │   ├── api.js              # Axios setup
│   │   └── authService.js      # Login/Register APIs
│   ├── test/                   # Unit/integration test files
│   ├── App.js                  # Main component
│   ├── App.test.js             # Root test file
│   ├── App.css                 # Styles
│   └── index.css               # Global styles
```

---

## 🌐 Live Features

- 🔐 User Authentication using JWT
- 👤 User Profile Management
- 📦 Microservices Architecture
- 🍲 Food Item Listing and Search
- ❤️ Favorite Food Item Management
- 🎨 Responsive UI with React + Material UI

---

## 🧩 Frontend (React)

### Key Components
- `LoginForm.js` – Handles login with JWT
- `RegisterForm.js` – User registration form
- `Navbar.js` – Navigational header with route links
- `ItemList.js` – Displays food items with search
- `ItemCard.js` – Individual item details
- `Favorites.js` – Displays saved favorites
- `UserProfile.js` – View and edit profile info
- `ProtectedRoute.js` – Restricts access to auth routes

### Dependencies
- `react`, `react-router-dom`, `axios`
- `@mui/material`, `@emotion/react`, `@emotion/styled`
- `formik`, `yup` for form handling
- `jwt-decode` for client-side token validation

---

## 🛠 Backend (Spring Boot Microservices)

### Microservices
- **Authentication Service** – Issues and validates JWT tokens
- **User Profile Service** – Stores and updates user info (MySQL)
- **Item Service** – Reads item data from items.json
- **Favorite Service** – Stores user favorites (MongoDB)

### Common Features
- RESTful APIs
- Spring Security + JWT
- Swagger API documentation
- Unit tests using Mockito

---

## 🧪 Testing
- ✅ Frontend unit tests with React Testing Library
- ✅ Backend tests with JUnit + Mockito

---

## 🗃️ Tech Stack

| Layer     | Technologies                                                                     |
|-----------|----------------------------------------------------------------------------------|
| Frontend  | React, Material UI(MUI V5), Axios, React Router v6, Formik + Yup                 |
| Backend   | Spring Boot, Spring Security, JWT                                                |
| Database  | MySQL (Users), MongoDB (Favorites)                                               |
| Tools     | Postman, Swagger, Docker (optional)                                              |

---

## 🚀 Getting Started

### Prerequisites
- Node.js
- Maven
- Java 17+
- MySQL + MongoDB

### To Run Frontend
```bash
cd frontend
npm install
npm start
```

### To Run Backend Services
Each microservice is a Spring Boot app:
```bash
cd auth-service  # or any service
mvn spring-boot:run
```

---

## ✍️ Author
Likhitha — [@plikhithareddy](https://gitlab.stackroute.in/java_assignments1/culinary_coordinator_project)

---

## 📄 License
This project is open source and available under the MIT License.
