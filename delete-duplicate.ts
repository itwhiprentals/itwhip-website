// delete-duplicate.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteDuplicate() {
  // Delete the OLDER claim (first one filed)
  const deleted = await prisma.claim.delete({
    where: {
      id: 'cmh6oe5040001doilvafsvxev', // Older claim from 19:31
    },
  });

  console.log('✅ Deleted duplicate claim:', deleted.id);
  console.log('✅ Kept newer claim: cmh6ohqop0005doilht4bag3z');
}

deleteDuplicate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());