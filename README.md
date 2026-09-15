> SporManage Aidat Takip: [Tanıtım PDF](output/pdf/spormanage-aidat-takip-tanitim.pdf) · [Broşür rehberi](docs/40-operations/BROCHURE_GUIDE.md) · [Gösterim rehberi](docs/40-operations/DEMO_GUIDE.md) · [Doğrulama kaydı](docs/30-quality/DEMO_VALIDATION.md). Kurulum: `npm run demo:seed -- --dry-run`, ardından `npm run demo:seed`. Mevcut ortamı yenilemek için önce `npm run demo:refresh-presentation -- --dry-run` kullanın.

> **CDSK çalışma bağlamı:** Bu proje **Aidat Takip** adıyla, spor kulüplerinde **çocuk ve yetişkin sporcuların ve aidatların takibi** hedefiyle ilerler. Başlangıç: [PROJECT_BOOT](PROJECT_BOOT.md); görev kuralları: [AGENTS](AGENTS.md).
>
> Aşağıdaki mevcut README içeriği tarihsel kaynak olarak korunmuştur. Kurulumda SQLite/3000 portu ve eksik ortam şablonu, rol matrisi, bildirim/rapor hazırlığı ve LICENSE referansı güncel kaynaklarla uyuşmuyor veya doğrulanmamış. Ayrıntılı etkiler ve çözüm önerileri [CHANGE_REQUESTS](docs/20-execution/CHANGE_REQUESTS.md) içinde kayıtlıdır. Kaynakta tanımlı güncel komutlar için [RUNBOOK](docs/40-operations/RUNBOOK.md), mimari için [OVERVIEW](docs/10-architecture/OVERVIEW.md) okunmalıdır. Bu metin yeni teknoloji, kapsam veya lisans kararı değildir.

# SporManage Yönetim Sistemi

A comprehensive web-based management system for football schools, built with Next.js, TypeScript, and Prisma.

## 🏆 Features

### Core Management Features
- **Student Management**: Complete student registration with parent information
- **Payment System**: Fee tracking, payment processing, and financial management
- **Training & Attendance**: Session scheduling and real-time attendance tracking
- **Group Management**: Dynamic group organization and student transfers
- **Notes System**: Comprehensive student notes and communication tracking
- **Notification System**: Multi-channel notifications (Email, SMS, In-app)
- **Reports & Analytics**: Detailed performance reports and insights

### Technical Features
- **Role-based Access Control**: Admin, Accounting, Trainer, Secretary roles
- **Multi-language Support**: Turkish language interface
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Live data synchronization
- **Export Capabilities**: PDF and Excel report generation
- **Bulk Operations**: Efficient handling of multiple records

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aidat-takip
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-jwt-secret"
   NEXTAUTH_SECRET="your-nextauth-secret"
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Login Credentials
- **Email**: admin@spormanage.example
- **Password**: admin123

## 📱 System Overview

### User Roles & Permissions

| Feature | Admin | Accounting | Trainer | Secretary |
|---------|-------|------------|---------|-----------|
| Student Management | ✅ | ❌ | ❌ | ✅ |
| Payment Management | ✅ | ✅ | ❌ | ❌ |
| Training Management | ✅ | ❌ | ✅ | ✅ |
| Reports Access | ✅ | ✅ | ✅ | ✅ |
| User Management | ✅ | ❌ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ |

### Key Pages

- **Dashboard** (`/dashboard`) - System overview and quick actions
- **Students** (`/students`) - Student management and registration
- **Payments** (`/payments`) - Fee tracking and payment processing
- **Groups** (`/groups`) - Group management and student transfers
- **Trainings** (`/trainings`) - Training scheduling and attendance
- **Notes** (`/notes`) - Student notes and communication
- **Notifications** (`/notifications`) - Communication management
- **Reports** (`/reports`) - Analytics and reporting

## 🛠️ Technology Stack

### Frontend
- **Next.js 13+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation

### Backend
- **Next.js API Routes** - Server-side API
- **Prisma ORM** - Database toolkit
- **SQLite** (development) / **PostgreSQL** (production)
- **JWT** - Authentication and authorization

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 📊 Database Schema

### Core Models
- **User** - System users with role-based access
- **Student** - Student information and profiles
- **Parent** - Parent/guardian information
- **Group** - Training groups and classifications
- **Payment** - Fee tracking and payment records
- **Training** - Training session management
- **Attendance** - Attendance tracking
- **Note** - Student notes and communications
- **Notification** - System notifications

### Key Relationships
- Students belong to Groups
- Students have multiple Parents
- Payments link to Students and FeeTypes
- Attendances link to Students and Trainings
- Notes and Notifications link to Students

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Student Management
- `GET /api/students` - List students
- `POST /api/students` - Create student
- `GET /api/students/[id]` - Get student details
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student

### Payment Management
- `GET /api/payments` - List payments
- `POST /api/payments` - Create payment
- `POST /api/payments/bulk` - Bulk payment operations

### Training & Attendance
- `GET /api/trainings` - List trainings
- `POST /api/trainings` - Create training
- `GET /api/attendances` - List attendances
- `POST /api/attendances` - Record attendance

### Notifications
- `GET /api/notifications` - List notifications
- `POST /api/notifications` - Create notification
- `POST /api/notifications/send` - Send notifications

### Reports
- `GET /api/reports/overview` - System overview report
- `GET /api/reports/export` - Export reports

### System
- `GET /api/health` - Health check
- `GET /api/test` - System testing

## 🧪 Testing

### API Testing
```bash
# Health check
curl http://localhost:3000/api/health

# Basic API test
curl http://localhost:3000/api/test

# Authentication test
curl http://localhost:3000/api/test?type=auth

# Database test
curl http://localhost:3000/api/test?type=database
```

### Manual Testing
1. Login with default credentials
2. Create a new student with parent information
3. Add payment records and track status
4. Schedule training sessions
5. Take attendance for training sessions
6. Generate and view reports

## 📁 Project Structure

```
aidat-takip/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   ├── dashboard/      # Dashboard page
│   │   ├── students/       # Student management
│   │   ├── payments/       # Payment management
│   │   ├── trainings/      # Training management
│   │   └── ...            # Other pages
│   ├── components/         # React components
│   │   ├── ui/            # UI components
│   │   ├── students/      # Student components
│   │   ├── payments/      # Payment components
│   │   └── ...            # Other components
│   ├── lib/               # Utility libraries
│   ├── types/             # TypeScript type definitions
│   └── contexts/          # React contexts
├── prisma/                # Database schema and migrations
├── public/                # Static assets
└── ...                   # Configuration files
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - Granular permission system
- **Input Validation** - Comprehensive data validation
- **SQL Injection Protection** - Prisma ORM protection
- **XSS Protection** - Input sanitization
- **CSRF Protection** - Built-in Next.js protection

## 🌍 Internationalization

- **Turkish Language** - Complete Turkish interface
- **Date/Time Formatting** - Turkish locale formatting
- **Currency Formatting** - Turkish Lira (TRY) support
- **Number Formatting** - Turkish number formatting

## 📈 Performance Features

- **Server-side Rendering** - Fast initial page loads
- **Static Generation** - Optimized static pages
- **Image Optimization** - Next.js image optimization
- **Code Splitting** - Automatic code splitting
- **Caching** - Efficient data caching strategies

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```env
   DATABASE_URL="postgresql://user:password@host:port/database"
   JWT_SECRET="your-production-jwt-secret"
   NEXTAUTH_SECRET="your-production-nextauth-secret"
   ```

2. **Database Migration**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

3. **Build and Deploy**
   ```bash
   npm run build
   npm start
   ```

### Docker Deployment
```bash
# Build Docker image
docker build -t football-school-management .

# Run container
docker run -p 3000:3000 football-school-management
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📋 TODO / Roadmap

### Upcoming Features
- [ ] Mobile app development (React Native)
- [ ] Advanced reporting with charts and graphs
- [ ] Integration with accounting systems
- [ ] Automated backup and restore
- [ ] Multi-language support (English, German)
- [ ] Advanced notification templates
- [ ] Integration with external SMS/Email providers
- [ ] Photo management for students
- [ ] Document management system
- [ ] Calendar integration

### Technical Improvements
- [ ] Unit and integration tests
- [ ] End-to-end testing with Cypress
- [ ] Performance monitoring
- [ ] Error tracking and monitoring
- [ ] Automated CI/CD pipeline
- [ ] Database optimization
- [ ] Caching improvements
- [ ] Security audit

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the amazing framework
- **Prisma** team for the excellent ORM
- **shadcn** for the beautiful UI components
- **Vercel** for hosting and deployment platform
- **Turkish football community** for inspiration and requirements

---

**Built with ❤️ for football schools in Turkey**
