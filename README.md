# TipTop Restaurant - React Native App

A comprehensive restaurant management and food delivery application built with React Native and Expo, featuring role-based access for Admin, Customer, and Delivery personnel.

## 🚀 Features

### 🔐 Authentication & Role Management
- **Multi-role login system** (Admin, Customer, Delivery)
- **Sign up/Login** with role selection
- **Profile management** for all user types

### 👨‍💼 Admin Panel
- **Dashboard** with analytics and stats
- **Order Management** with status updates
- **Menu Management** (Add, Edit, Delete items)
- **Real-time order tracking**

### 🛒 Customer App
- **Browse menu** with search and filters
- **Shopping cart** with quantity management
- **Order placement** and tracking
- **Order history** and reordering
- **Coupon/discount system**

### 🚚 Delivery App
- **Assigned deliveries** management
- **Map view** for navigation (placeholder)
- **Order status updates** (Pick up, Delivered)
- **Delivery history** and earnings
- **Customer communication**

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **Language**: TypeScript
- **State Management**: React Context API
- **UI Components**: React Native + Expo Vector Icons
- **Development**: Expo Development Build

## 📱 Project Structure

```
src/
├── components/          # Shared components
├── contexts/           # React Context providers
├── navigation/         # Navigation configuration
├── screens/           # Screen components
│   ├── auth/          # Authentication screens
│   ├── admin/         # Admin panel screens
│   ├── customer/      # Customer app screens
│   └── delivery/      # Delivery app screens
├── types/             # TypeScript type definitions
└── utils/             # Utility functions and config
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your phone (for testing)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd tiptop/tiptopFrontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

4. **Run on device/emulator**
```bash
# For Android
npm run android

# For iOS (macOS only)
npm run ios

# For web
npm run web
```

## 📋 Development Build

This project is configured for Expo Development Builds, allowing custom native dependencies:

1. **Create development build**
```bash
expo install expo-dev-client
eas build --profile development --platform android
```

2. **Install the development build** on your device

3. **Start the dev server**
```bash
expo start --dev-client
```

## 🔐 Default Login Credentials

For testing purposes, you can login with any email/password combination and select your desired role:

- **Admin**: Full access to restaurant management
- **Customer**: Browse menu, place orders, track deliveries
- **Delivery**: View assigned orders, update delivery status

## 🎨 UI/UX Features

- **Modern, clean design** with consistent theming
- **Role-based navigation** with bottom tabs
- **Responsive layouts** for different screen sizes
- **Loading states** and error handling
- **Interactive elements** with proper feedback

## 🔄 App Flow

```
App Launch → Login/SignUp → Role Selection → Role-based Dashboard
```

### Admin Flow
```
Dashboard → Orders/Menu Management → Profile
```

### Customer Flow
```
Home (Browse Menu) → Cart → Checkout → Order Tracking → Profile
```

### Delivery Flow
```
Assigned Deliveries → Map Navigation → Update Status → History
```

## 🚧 Future Enhancements

- **Backend Integration** (API endpoints)
- **Real-time notifications** (Push notifications)
- **Payment gateway** integration
- **Live location tracking** for deliveries
- **Chat support** between customers and delivery
- **Reviews and ratings** system
- **Analytics dashboard** improvements
- **Multi-language support**

## 🧪 Testing

The app includes mock data for all features to demonstrate functionality:

- **Sample menu items** with categories
- **Mock orders** with different statuses
- **Simulated delivery assignments**
- **Dummy user profiles**

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Built with ❤️ using React Native and Expo**
