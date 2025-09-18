// scripts/seed-jobs.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedJobs() {
  try {
    console.log('🚀 Starting job seeding...')

    // Clear existing jobs (optional - comment out to keep existing)
    await prisma.jobPosting.deleteMany()
    console.log('✅ Cleared existing jobs')

    // Engineering positions
    const engineeringJobs = await prisma.jobPosting.createMany({
      data: [
        {
          title: 'Senior Full Stack Engineer',
          department: 'Engineering',
          location: 'Phoenix, AZ / Remote',
          type: 'FULL_TIME',
          description: 'Lead the development of our core platform, working with Next.js, React, and Node.js to build scalable solutions for the luxury transportation market.',
          requirements: '• 5+ years of full-stack development experience\n• Expert in React, Next.js, TypeScript\n• Experience with PostgreSQL and Prisma\n• Strong understanding of cloud services (AWS/GCP)\n• Experience with payment systems (Stripe) preferred\n• Excellent problem-solving and communication skills',
          responsibilities: '• Architect and implement new features for our booking platform\n• Lead code reviews and mentor junior developers\n• Optimize application performance and scalability\n• Collaborate with product team on technical requirements\n• Maintain high code quality and testing standards',
          salaryMin: 140000,
          salaryMax: 180000,
          salaryPeriod: 'yearly',
          showSalary: true,
          equity: '0.1% - 0.25%',
          isActive: true,
          isFeatured: true,
          openPositions: 2
        },
        {
          title: 'Mobile App Developer (React Native)',
          department: 'Engineering',
          location: 'Phoenix, AZ / Hybrid',
          type: 'FULL_TIME',
          description: 'Build and maintain our iOS and Android apps using React Native, creating seamless experiences for riders and drivers.',
          requirements: '• 3+ years React Native experience\n• Published apps on App Store and Google Play\n• Strong JavaScript/TypeScript skills\n• Experience with native iOS/Android development a plus\n• Understanding of mobile app performance optimization',
          responsibilities: '• Develop and maintain React Native applications\n• Implement real-time tracking and navigation features\n• Ensure app performance and reliability\n• Work with backend team on API integration\n• Handle app store submissions and updates',
          salaryMin: 120000,
          salaryMax: 150000,
          salaryPeriod: 'yearly',
          showSalary: true,
          equity: '0.05% - 0.15%',
          isActive: true,
          isFeatured: false,
          openPositions: 1
        },
        {
          title: 'DevOps Engineer',
          department: 'Engineering',
          location: 'Remote',
          type: 'FULL_TIME',
          description: 'Manage our cloud infrastructure and deployment pipelines, ensuring 99.9% uptime for our critical transportation services.',
          requirements: '• 4+ years DevOps/SRE experience\n• Expert with AWS services (EC2, RDS, Lambda, etc.)\n• Strong knowledge of CI/CD pipelines\n• Experience with Docker and Kubernetes\n• Infrastructure as Code (Terraform/CloudFormation)',
          responsibilities: '• Design and maintain AWS infrastructure\n• Implement monitoring and alerting systems\n• Optimize deployment processes\n• Ensure security best practices\n• Manage database operations and backups',
          salaryMin: 130000,
          salaryMax: 160000,
          salaryPeriod: 'yearly',
          showSalary: true,
          equity: '0.05% - 0.15%',
          isActive: true,
          isFeatured: false,
          openPositions: 1
        }
      ]
    })

    // Operations positions
    const operationsJobs = await prisma.jobPosting.createMany({
      data: [
        {
          title: 'Driver Operations Manager',
          department: 'Operations',
          location: 'Phoenix, AZ',
          type: 'FULL_TIME',
          description: 'Lead our driver operations team, managing recruitment, training, and performance of our luxury vehicle fleet drivers.',
          requirements: '• 3+ years operations management experience\n• Experience in transportation or hospitality industry\n• Strong leadership and communication skills\n• Data-driven decision making ability\n• Valid driver\'s license and clean record',
          responsibilities: '• Recruit and onboard new driver partners\n• Develop and implement driver training programs\n• Monitor driver performance metrics\n• Handle escalated driver issues\n• Optimize driver supply for demand',
          salaryMin: 75000,
          salaryMax: 95000,
          salaryPeriod: 'yearly',
          showSalary: true,
          equity: '0.02% - 0.05%',
          isActive: true,
          isFeatured: false,
          openPositions: 1
        },
        {
          title: 'Fleet Coordinator',
          department: 'Operations',
          location: 'Scottsdale, AZ',
          type: 'FULL_TIME',
          description: 'Manage our growing fleet of luxury vehicles, ensuring quality, availability, and maintenance standards.',
          requirements: '• 2+ years fleet or vehicle management experience\n• Knowledge of luxury vehicle brands\n• Strong organizational skills\n• Customer service oriented\n• Ability to work flexible hours',
          responsibilities: '• Coordinate vehicle inspections and maintenance\n• Manage vehicle documentation and compliance\n• Track fleet utilization metrics\n• Work with hosts on vehicle listings\n• Ensure vehicle quality standards',
          salaryMin: 55000,
          salaryMax: 70000,
          salaryPeriod: 'yearly',
          showSalary: true,
          equity: null,
          isActive: true,
          isFeatured: false,
          openPositions: 2
        },
        {
          title: 'Quality Assurance Specialist',
          department: 'Operations',
          location: 'Phoenix, AZ',
          type: 'FULL_TIME',
          description: 'Ensure service quality across all customer touchpoints, from booking to ride completion.',
          requirements: '• 2+ years QA or customer service experience\n• Detail-oriented with analytical skills\n• Experience with service quality metrics\n• Strong written communication\n• Problem-solving mindset',
          responsibilities: '• Review and audit ride quality\n• Investigate service complaints\n• Develop quality standards and procedures\n• Train team on quality protocols\n• Generate quality reports',
          salaryMin: 50000,
          salaryMax: 65000,
          salaryPeriod: 'yearly',
          showSalary: true,
          equity: null,
          isActive: true,
          isFeatured: false,
          openPositions: 1
        }
      ]
    })

    // Sales & Partnerships positions
    const salesJobs = await prisma.jobPosting.createMany({
      data: [
        {
          title: 'Hotel Partnership Manager',
          department: 'Sales',
          location: 'Phoenix, AZ',
          type: 'FULL_TIME',
          description: 'Build and manage relationships with luxury hotels, expanding our network of hospitality partners.',
          requirements: '• 5+ years B2B sales in hospitality industry\n• Existing relationships with hotel management\n• Proven track record of closing enterprise deals\n• Strong presentation and negotiation skills\n• Willingness to travel 30%',
          responsibilities: '• Identify and close new hotel partnerships\n• Manage existing hotel relationships\n• Develop partnership proposals and contracts\n• Coordinate implementation with operations\n• Meet quarterly partnership targets',
          salaryMin: 90000,
          salaryMax: 120000,
          salaryPeriod: 'yearly',
          showSalary: true,
          equity: '0.05% - 0.1%',
          isActive: true,
          isFeatured: true,
          openPositions: 1
        },
        {
          title: 'Business Development Representative',
          department: 'Sales',
          location: 'Phoenix, AZ',
          type: 'FULL_TIME',
          description: 'Generate new business opportunities through outbound prospecting to hotels and corporate clients.',
          requirements: '• 2+ years B2B sales or BDR experience\n• Experience with CRM systems (HubSpot/Salesforce)\n• Excellent phone and email communication\n• Self-motivated and goal-oriented\n• Interest in travel/hospitality industry',
          responsibilities: '• Conduct outbound prospecting to hotels\n• Qualify leads and set meetings\n• Maintain accurate CRM records\n• Research target accounts\n• Collaborate with partnership managers',
          salaryMin: 55000,
          salaryMax: 70000,
          salaryPeriod: 'yearly',
          showSalary: true,
          equity: '0.01% - 0.03%',
          isActive: true,
          isFeatured: false,
          openPositions: 2
        }
      ]
    })

    // Customer Success positions
    const customerJobs = await prisma.jobPosting.createMany({
      data: [
        {
          title: 'Customer Success Manager',
          department: 'Customer Success',
          location: 'Phoenix, AZ / Remote',
          type: 'FULL_TIME',
          description: 'Ensure hotel partners and high-value clients achieve success with our platform.',
          requirements: '• 3+ years customer success or account management\n• Experience with B2B SaaS preferred\n• Strong communication and relationship skills\n• Data analysis and reporting abilities\n• Hospitality experience a plus',
          responsibilities: '• Onboard new hotel partners\n• Drive platform adoption and usage\n• Handle escalated support issues\n• Identify upsell opportunities\n• Conduct quarterly business reviews',
          salaryMin: 65000,
          salaryMax: 85000,
          salaryPeriod: 'yearly',
          showSalary: true,
          equity: '0.02% - 0.05%',
          isActive: true,
          isFeatured: false,
          openPositions: 1
        },
        {
          title: 'Support Team Lead (Night Shift)',
          department: 'Support',
          location: 'Phoenix, AZ',
          type: 'FULL_TIME',
          description: 'Lead our night shift support team, ensuring 24/7 coverage for riders and drivers.',
          requirements: '• 2+ years customer support leadership\n• Experience with support ticketing systems\n• Ability to work night shifts (10 PM - 6 AM)\n• Crisis management skills\n• Bilingual (English/Spanish) preferred',
          responsibilities: '• Manage night shift support team\n• Handle urgent rider and driver issues\n• Coordinate with on-call engineers\n• Maintain SLA compliance\n• Train and mentor support agents',
          salaryMin: 45000,
          salaryMax: 60000,
          salaryPeriod: 'yearly',
          showSalary: true,
          equity: null,
          isActive: true,
          isFeatured: false,
          openPositions: 1
        }
      ]
    })

    // Internship position
    const internships = await prisma.jobPosting.createMany({
      data: [
        {
          title: 'Software Engineering Intern',
          department: 'Engineering',
          location: 'Phoenix, AZ',
          type: 'INTERNSHIP',
          description: 'Join our engineering team for a paid summer internship working on real projects that impact thousands of users.',
          requirements: '• Currently pursuing CS degree\n• Knowledge of React and JavaScript\n• Passion for startups and technology\n• Available for 3 months full-time\n• Strong problem-solving skills',
          responsibilities: '• Work on production features\n• Participate in code reviews\n• Learn from senior engineers\n• Complete a capstone project\n• Present findings to leadership',
          salaryMin: 25,
          salaryMax: 35,
          salaryPeriod: 'hourly',
          showSalary: true,
          equity: null,
          isActive: true,
          isFeatured: false,
          openPositions: 2
        }
      ]
    })

    console.log('✅ Seeded Engineering jobs:', engineeringJobs.count)
    console.log('✅ Seeded Operations jobs:', operationsJobs.count)
    console.log('✅ Seeded Sales jobs:', salesJobs.count)
    console.log('✅ Seeded Customer Success jobs:', customerJobs.count)
    console.log('✅ Seeded Internships:', internships.count)
    
    const totalJobs = await prisma.jobPosting.count()
    console.log(`\n🎉 Successfully seeded ${totalJobs} job postings!`)
    
  } catch (error) {
    console.error('❌ Error seeding jobs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seed function
seedJobs()