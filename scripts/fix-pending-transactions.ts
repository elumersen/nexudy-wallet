import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPendingTransactions() {
  console.log('🔍 Finding pending transactions...');
  
  const pendingTransactions = await prisma.transaction.findMany({
    where: { status: 'PENDING' },
    include: { user: true }
  });

  if (pendingTransactions.length === 0) {
    console.log('✅ No pending transactions found!');
    return;
  }

  console.log(`📋 Found ${pendingTransactions.length} pending transaction(s)`);

  for (const transaction of pendingTransactions) {
    console.log(`\n💳 Processing transaction ${transaction.id}`);
    console.log(`   Amount: $${(transaction.amount / 100).toFixed(2)}`);
    console.log(`   User: ${transaction.user.email}`);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: transaction.userId },
        data: {
          balance: {
            increment: transaction.amount,
          },
        },
      });

      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: 'COMPLETED' },
      });
    });

    console.log(`   ✅ Marked as COMPLETED and balance updated`);
  }

  console.log('\n🎉 All pending transactions have been fixed!');
}

fixPendingTransactions()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

