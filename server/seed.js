const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Expense = require('./models/Expense');
const { categories } = require('./config/categories');

dotenv.config();

const seedData = async () => {
    try {
        // 1. Production Safety Guard
        if (process.env.NODE_ENV === 'production') {
            console.error('❌ ERROR: Seeding is not allowed in production environment!');
            process.exit(1);
        }

        if (!process.env.MONGO_URI) {
            console.error('❌ ERROR: MONGO_URI is not defined');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // 2. Deterministic: Clear existing data
        await User.deleteMany();
        await Expense.deleteMany();
        console.log('Existing data cleared.');

        // 3. Create Demo User (Uses .create() to trigger password hashing)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const demoUser = await User.create({
            name: 'Demo User',
            email: 'demo@example.com',
            password: hashedPassword,
            settings: {
                budgetLimits: {
                    "Food": 500,
                    "Travel": 300,
                    "Bills": 1000
                }
            }
        });
        console.log('Demo user created: demo@example.com / password123');

        // 4. Create Sample Expenses
        const sampleExpenses = [
            {
                user: demoUser._id,
                title: 'Grocery Shopping',
                amount: 85.50,
                category: 'Food',
                date: new Date(Date.now() - 86400000 * 2), // 2 days ago
                type: 'expense'
            },
            {
                user: demoUser._id,
                title: 'Monthly Salary',
                amount: 3000.00,
                category: 'Other',
                date: new Date(Date.now() - 86400000 * 5), // 5 days ago
                type: 'income'
            },
            {
                user: demoUser._id,
                title: 'Gas Station',
                amount: 45.20,
                category: 'Travel',
                date: new Date(Date.now() - 86400000 * 1), // 1 day ago
                type: 'expense'
            },
            {
                user: demoUser._id,
                title: 'Electricity Bill',
                amount: 120.00,
                category: 'Bills',
                date: new Date(Date.now() - 86400000 * 10), // 10 days ago
                type: 'expense'
            }
        ];

        // Using .create() loop to ensure schema hooks (rounding) run
        for (const exp of sampleExpenses) {
            await Expense.create(exp);
        }

        console.log(`Successfully seeded ${sampleExpenses.length} expenses.`);
        console.log('Seeding complete! 🌱');
        process.exit(0);
    } catch (error) {
        console.error('Error during seeding:', error.message);
        process.exit(1);
    }
};

seedData();
