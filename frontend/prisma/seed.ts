import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Clean up
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const alice = await prisma.user.create({
    data: {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@example.com',
      password: hashedPassword,
      bio: 'Product manager & tech enthusiast',
    },
  });

  const bob = await prisma.user.create({
    data: {
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@example.com',
      password: hashedPassword,
      bio: 'Full-stack developer',
    },
  });

  const carol = await prisma.user.create({
    data: {
      firstName: 'Carol',
      lastName: 'White',
      email: 'carol@example.com',
      password: hashedPassword,
      bio: 'UI/UX designer',
    },
  });

  console.log('Created users');

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      content: 'Excited to announce that I just launched my new project! BuddyScript is a social feed app built with Next.js 16, PostgreSQL, and Prisma. Check it out!',
      visibility: 'PUBLIC',
      authorId: alice.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      content: 'Just finished reading "Clean Code" by Robert C. Martin. Highly recommend it to any developer who wants to write better, more maintainable code.',
      visibility: 'PUBLIC',
      authorId: bob.id,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      content: 'Working on a new design system for our company. Consistency is key! Here are some tips: 1) Define your color palette early, 2) Use spacing tokens, 3) Document everything.',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      visibility: 'PUBLIC',
      authorId: carol.id,
    },
  });

  const post4 = await prisma.post.create({
    data: {
      content: 'TypeScript has made our codebase so much more maintainable. The initial learning curve is worth it!',
      visibility: 'PUBLIC',
      authorId: bob.id,
    },
  });

  const post5 = await prisma.post.create({
    data: {
      content: 'Personal reminder: take breaks, drink water, and stretch. Health comes first!',
      visibility: 'PRIVATE',
      authorId: alice.id,
    },
  });

  const post6 = await prisma.post.create({
    data: {
      content: 'The Next.js App Router is a game changer for building full-stack applications. Server Components + Server Actions = 🔥',
      visibility: 'PUBLIC',
      authorId: alice.id,
    },
  });

  const post7 = await prisma.post.create({
    data: {
      content: 'Just deployed to production with zero downtime. Prisma migrations + PostgreSQL + proper indexes make all the difference.',
      visibility: 'PUBLIC',
      authorId: bob.id,
    },
  });

  const post8 = await prisma.post.create({
    data: {
      content: 'Beautiful sunset today! 🌅 Taking a break from coding to appreciate nature.',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      visibility: 'PUBLIC',
      authorId: carol.id,
    },
  });

  const post9 = await prisma.post.create({
    data: {
      content: 'Tailwind CSS v4 is out and it is faster than ever. The new configuration approach is much cleaner.',
      visibility: 'PUBLIC',
      authorId: alice.id,
    },
  });

  const post10 = await prisma.post.create({
    data: {
      content: 'Meeting notes from today. Need to review architecture decisions.',
      visibility: 'PRIVATE',
      authorId: alice.id,
    },
  });

  const post11 = await prisma.post.create({
    data: {
      content: 'React 19 has some amazing new features. The compiler optimizations are incredible!',
      visibility: 'PUBLIC',
      authorId: carol.id,
    },
  });

  const post12 = await prisma.post.create({
    data: {
      content: 'Happy to share that I passed my AWS certification exam today! Hard work pays off.',
      visibility: 'PUBLIC',
      authorId: bob.id,
    },
  });

  console.log('Created posts');

  // Create comments
  const comment1 = await prisma.comment.create({
    data: {
      content: 'Congratulations! BuddyScript looks amazing!',
      postId: post1.id,
      authorId: bob.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'This is so inspiring! Well done Alice!',
      postId: post1.id,
      authorId: carol.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Thanks for the recommendation! Adding it to my reading list.',
      postId: post2.id,
      authorId: alice.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Great advice on design systems! Which tool are you using?',
      postId: post3.id,
      authorId: bob.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'TypeScript is definitely worth learning. The type safety alone saves so much debugging time.',
      postId: post4.id,
      authorId: carol.id,
    },
  });

  // Reply
  await prisma.comment.create({
    data: {
      content: 'Agreed! Especially when working in larger teams.',
      postId: post4.id,
      authorId: alice.id,
      parentId: comment1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Server Actions are so elegant for form handling!',
      postId: post6.id,
      authorId: bob.id,
    },
  });

  console.log('Created comments');

  // Create likes
  await Promise.all([
    prisma.like.create({ data: { userId: bob.id, postId: post1.id } }),
    prisma.like.create({ data: { userId: carol.id, postId: post1.id } }),
    prisma.like.create({ data: { userId: alice.id, postId: post2.id } }),
    prisma.like.create({ data: { userId: carol.id, postId: post2.id } }),
    prisma.like.create({ data: { userId: alice.id, postId: post3.id } }),
    prisma.like.create({ data: { userId: bob.id, postId: post3.id } }),
    prisma.like.create({ data: { userId: alice.id, postId: post4.id } }),
    prisma.like.create({ data: { userId: carol.id, postId: post6.id } }),
    prisma.like.create({ data: { userId: bob.id, postId: post8.id } }),
    prisma.like.create({ data: { userId: alice.id, postId: post11.id } }),
    prisma.like.create({ data: { userId: carol.id, postId: post12.id } }),
    prisma.like.create({ data: { userId: alice.id, postId: post12.id } }),
  ]);

  console.log('Created likes');
  console.log('✅ Seeding complete!');
  console.log('\nDemo accounts:');
  console.log('  alice@example.com / password123');
  console.log('  bob@example.com / password123');
  console.log('  carol@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
