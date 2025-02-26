# CarBookingBackend

The CarBookingApp backend provides a robust API for managing users, bookings, and vehicle details. It includes endpoints for user registration and authentication, managing vehicle availability, and processing booking requests. The backend is designed to ensure a seamless and secure car booking experience, with plans for real-time ride tracking and payment integration in the future.

## Features

- APIs for user registration, login, and JWT authentication
- Vehicle management API for adding, updating, and deleting vehicle details
- Booking processing API for creating, updating, and tracking ride bookings
- Admin panel for managing users, vehicles, and bookings

## Tech Stack

- Node.js
- Express
- MongoDB
- JWT Authentication

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file:

- `PORT`
- `JWT_SECRET`
- `MONGODB_URI`
- `API_KEY`


## API Reference

#### Register a User

```http
POST /api/auth/register
```


Headers:

| Parameter | Type     | Description                |
| --------- | -------- | -------------------------- |
| api_key   | string   | **Required**. Your API key |

Body:

| Parameter  | Type     | Description                        |
| ---------- | -------- | ---------------------------------- |
| name       | string   | **Required**. User's name          |
| email      | string   | **Required**. User's email address |
| password   | string   | **Required**. User's password     |
| phone      | string   | **Required**. User's phone number |

---


## Run Locally

Clone the repository:

```bash
git clone https://github.com/yash-mishra150/CarBookingBackend.git
cd CarBookingBackend

Install dependencies:

```bash
   npm install
```

Configure environment variables:

```
    Create a `.env` file in the root directory and add the following:
     PORT=5000
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
```

 Run the server locally:
```
   npm start

   The server will run at `http://localhost:5000` (or the port you specified in your `.env` file).

```
 Verify the server is running by visiting `http://localhost:5000` or using tools like Postman to test the API endpoints.


#### *Ensure MongoDB is set up either locally or using MongoDB Atlas, and update the `MONGO_URI` in your `.env` file with your connection string.*


Your backend is now running locally.


## Authors

- [@yashmishra](https://github.com/yash-mishra150)


## 🔗 Links
[![portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://katherineoelsner.com/)

[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/yash-mishra-87b29725b/)