# Property Management App

![![Banner]](https://banners.beyondco.de/Property%20Management.png?theme=light&packageManager=&packageName=https%3A%2F%2Fgithub.com%2FAbdellahHatouchi%2Fproperty-management.git&pattern=architect&style=style_1&description=&md=1&showWatermark=0&fontSize=100px&images=puzzle&widths=400&heights=400)

## Description

The Property Management App is a comprehensive solution designed to manage properties, tenants, and rentals efficiently. This app allows users to manage their property portfolios, tenant information, and rental agreements seamlessly. Additionally, users can generate rental contracts as PDFs. The entire system is secured with robust authentication mechanisms, including email and Google authentication.

## Features

- **Property Management**: Manage multiple properties effortlessly.
- **Tenant Management**: Keep track of tenant information and rental history.
- **Rental Management**: Track rental payments and generate rental contracts.
- **PDF Generation**: Generate rental contracts in PDF format.
- **Authentication**: Secure access using email and Google authentication.

## Technologies Used

- **Framework**: Next.js 14 (React.js)
- **Styling**: Tailwind CSS
- **Authentication**: Auth.js
- **Validation**: Zod
- **UI Components**: Radix UI
- **State Management**: Zustand
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Email Service**: Nodemailer
- **HTTP Client**: Axios
- **Deployment**: Vercel

## Installation and Setup

To run this project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AbdellahHatouchi/property-management.git
   cd property-management-app

2. **Install dependencies:**:
   ```bash
   npm install

3. **Environment setup**:
   - Rename `.env.example` to `.env`
   - Fill all required environment variables in the `.env` file

4. **Prisma setup**:
   - Generate Prisma client:
     ```bash
     npx prisma generate
     ```
   - Push the database schema to your PostgreSQL database:
     ```bash
     npx prisma db push
     ```

5. **Run the development server**:
   ```bash
   npm run dev

6. **Access the app**: Open your browser and go to `http://localhost:3000`

## Deployment

The app is deployed on Vercel. You can access the live application at [https://property-management-roan-theta.vercel.app](https://property-management-roan-theta.vercel.app/).

## Contributing

If you'd like to contribute, please fork the repository and use a feature branch. Pull requests are welcome.

## Author

- **Abdellah Hatouchi**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


