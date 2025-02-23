# IIT Mandi Marketplace Backend

Backend server for the IIT Mandi Marketplace application.

## Quick Start

1. **Install Dependencies**:
```bash
npm install
```

2. **Create Required Directories**:
```bash
mkdir -p uploads
```

3. **Initialize Database**:
```bash
npx ts-node src/init.ts
```

4. **Start Development Server**:
```bash
npm run dev
```

## Test Credentials

```
Admin User:
Email: admin@iitmandi.ac.in
Password: admin123

Test User:
Email: test@iitmandi.ac.in
Password: test123
```

## API Testing

Test the API endpoints:

1. **Health Check**:
```bash
curl http://localhost:5000/health
```

2. **Login**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@iitmandi.ac.in","password":"test123"}'
```

3. **Get Products**:
```bash
# Save token from login response
TOKEN="your-token-here"

curl http://localhost:5000/api/products \
  -H "Authorization: Bearer $TOKEN"
```

4. **Create Product**:
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Product",
    "description": "Test Description",
    "price": 999,
    "category": "Books",
    "condition": "LIKE_NEW"
  }'
```

## Troubleshooting

1. **MongoDB Connection Issues**:
   - Check if MongoDB URL in `.env` is correct
   - Current configuration uses MongoDB Atlas
   - Connection timeout is set to 10 seconds

2. **File Upload Issues**:
   - Check if `uploads` directory exists
   - Ensure proper permissions
   - Maximum file size: 5MB
   - Supported formats: JPEG, PNG, WebP

3. **Authentication Issues**:
   - Verify JWT_SECRET in `.env`
   - Token format: "Bearer your-token-here"
   - Tokens expire after 7 days

## Environment Variables

Required variables in `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret
NODE_ENV=development
```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Run production server
- `npm test`: Run tests
- `npm run lint`: Check code style
- `npm run format`: Format code

## Project Structure

```
backend-node/
├── src/
│   ├── config/      # Configuration
│   ├── controllers/ # Route controllers
│   ├── middleware/  # Express middleware
│   ├── models/      # Mongoose models
│   ├── routes/      # API routes
│   ├── utils/       # Utilities
│   └── server.ts    # Entry point
├── uploads/         # File uploads
└── tests/          # Test files
```

## API Endpoints

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Products
- `GET /api/products`
- `POST /api/products`
- `GET /api/products/:id`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`
- `POST /api/products/upload-images`
- `GET /api/products/search`
