const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test database...');

  // Sample embedding (384 dimensions, all zeros for testing)
  // In production, these would be actual SBERT embeddings
  const sampleEmbedding = Array(384).fill(0);
  
  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.underReviewTopics.deleteMany();
  await prisma.currentSessionTopics.deleteMany();
  await prisma.historicalTopics.deleteMany();

  // Seed Historical Topics
  console.log('Seeding historical topics...');
  await prisma.historicalTopics.createMany({
    data: [
      {
        title: 'Machine Learning in Healthcare',
        keywords: 'neural networks, diagnosis, medical imaging, AI',
        sessionYear: '2022/2023',
        supervisorName: 'Dr. Smith',
        category: 'Artificial Intelligence',
        embedding: sampleEmbedding
      },
      {
        title: 'Blockchain for Supply Chain Management',
        keywords: 'distributed ledger, transparency, logistics, smart contracts',
        sessionYear: '2021/2022',
        supervisorName: 'Dr. Johnson',
        category: 'Blockchain',
        embedding: sampleEmbedding
      },
      {
        title: 'Natural Language Processing Applications',
        keywords: 'BERT, transformers, sentiment analysis, NLP',
        sessionYear: '2022/2023',
        supervisorName: 'Dr. Williams',
        category: 'Natural Language Processing',
        embedding: sampleEmbedding
      },
      {
        title: 'Computer Vision for Autonomous Vehicles',
        keywords: 'object detection, CNN, self-driving cars, perception',
        sessionYear: '2021/2022',
        supervisorName: 'Dr. Brown',
        category: 'Computer Vision',
        embedding: sampleEmbedding
      },
      {
        title: 'Cybersecurity in IoT Devices',
        keywords: 'security, encryption, IoT, vulnerabilities',
        sessionYear: '2020/2021',
        supervisorName: 'Dr. Davis',
        category: 'Cybersecurity',
        embedding: sampleEmbedding
      },
      {
        title: 'Cloud Computing Architecture Patterns',
        keywords: 'microservices, scalability, AWS, distributed systems',
        sessionYear: '2022/2023',
        supervisorName: 'Dr. Wilson',
        category: 'Cloud Computing',
        embedding: sampleEmbedding
      },
      {
        title: 'Quantum Computing Algorithms',
        keywords: 'quantum gates, qubits, quantum supremacy, algorithms',
        sessionYear: '2021/2022',
        supervisorName: 'Dr. Martinez',
        category: 'Quantum Computing',
        embedding: sampleEmbedding
      },
      {
        title: 'Recommender Systems Using Collaborative Filtering',
        keywords: 'recommendation, collaborative filtering, matrix factorization',
        sessionYear: '2020/2021',
        supervisorName: 'Dr. Anderson',
        category: 'Machine Learning',
        embedding: sampleEmbedding
      }
    ]
  });

  // Seed Current Session Topics
  console.log('Seeding current session topics...');
  await prisma.currentSessionTopics.createMany({
    data: [
      {
        title: 'Deep Learning for Image Recognition',
        keywords: 'CNN, computer vision, classification, ResNet',
        sessionYear: '2023/2024',
        supervisorName: 'Dr. Brown',
        category: 'Artificial Intelligence',
        embedding: sampleEmbedding
      },
      {
        title: 'Federated Learning in Healthcare',
        keywords: 'privacy, distributed learning, medical data, federated',
        sessionYear: '2023/2024',
        supervisorName: 'Dr. Smith',
        category: 'Machine Learning',
        embedding: sampleEmbedding
      },
      {
        title: 'Smart Contract Security Analysis',
        keywords: 'blockchain, Ethereum, security, vulnerabilities',
        sessionYear: '2023/2024',
        supervisorName: 'Dr. Johnson',
        category: 'Blockchain',
        embedding: sampleEmbedding
      }
    ]
  });

  // Seed Under Review Topics (within last 48 hours)
  console.log('Seeding under review topics...');
  await prisma.underReviewTopics.createMany({
    data: [
      {
        title: 'AI in Medical Diagnosis Systems',
        keywords: 'machine learning, healthcare, diagnosis, deep learning',
        sessionYear: '2023/2024',
        supervisorName: 'Dr. Davis',
        category: 'Artificial Intelligence',
        reviewStartedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        embedding: sampleEmbedding
      },
      {
        title: 'Blockchain-based Voting Systems',
        keywords: 'blockchain, voting, security, transparency',
        sessionYear: '2023/2024',
        supervisorName: 'Dr. Johnson',
        category: 'Blockchain',
        reviewStartedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        embedding: sampleEmbedding
      },
      {
        title: 'Transfer Learning for NLP Tasks',
        keywords: 'transformers, BERT, transfer learning, NLP',
        sessionYear: '2023/2024',
        supervisorName: 'Dr. Williams',
        category: 'Natural Language Processing',
        reviewStartedAt: new Date(Date.now() - 36 * 60 * 60 * 1000), // 36 hours ago
        embedding: sampleEmbedding
      }
    ]
  });

  // Verify counts
  const historicalCount = await prisma.historicalTopics.count();
  const currentCount = await prisma.currentSessionTopics.count();
  const underReviewCount = await prisma.underReviewTopics.count();

  console.log('\n✅ Test data seeded successfully!');
  console.log(`   Historical Topics: ${historicalCount}`);
  console.log(`   Current Session Topics: ${currentCount}`);
  console.log(`   Under Review Topics: ${underReviewCount}`);
  console.log(`   Total: ${historicalCount + currentCount + underReviewCount}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
