const { PrismaClient } = require('@prisma/client');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedFromCSV(filename) {
  const filePath = path.join(__dirname, 'data', filename);
  const rows = [];

  // Read CSV and collect rows
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => rows.push(data))
    .on('end', async () => {
      console.log(`Read ${rows.length} rows from ${filename}`);
      let inserted = 0;
      let skipped = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const title = row.title?.trim();
        if (!title) {
          console.log(`Skipping row ${i + 1}: missing title`);
          continue;
        }

        // Check if title already exists
        const existing = await prisma.historicalTopic.findFirst({
          where: { title: title }
        });

        if (existing) {
          console.log(`Skipping duplicate title: ${title}`);
          skipped++;
          continue;
        }

        // Insert
        try {
          await prisma.historicalTopic.create({
            data: {
              title: title,
              keywords: row.keywords?.trim() || '',
              sessionYear: row.session_year?.trim() || '',
              supervisorName: row.supervisor_name?.trim() || '',
              category: row.category?.trim() || '',
              embedding: null // No embeddings for seeded data
            }
          });
          inserted++;
        } catch (error) {
          console.error(`Error inserting row ${i + 1}: ${error.message}`);
        }

        // Log progress every 10 inserts
        if ((inserted + skipped) % 10 === 0) {
          console.log(`Processed ${inserted + skipped}/${rows.length} rows (Inserted: ${inserted}, Skipped: ${skipped})`);
        }
      }

      console.log(`Seeding complete. Inserted: ${inserted}, Skipped: ${skipped}, Total: ${rows.length}`);
      await prisma.$disconnect();
    })
    .on('error', (error) => {
      console.error(`Error reading CSV: ${error.message}`);
      prisma.$disconnect();
    });
}

// Get filename from command line args
const filename = process.argv[2];
if (!filename) {
  console.error('Usage: node seed.js <filename>');
  process.exit(1);
}

seedFromCSV(filename);