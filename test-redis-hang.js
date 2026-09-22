const { Queue } = require('bullmq');

async function main() {
  console.log('Starting...');
  const queue = new Queue('test', { connection: { host: '127.0.0.1', port: 63790 } });
  try {
    console.log('Adding...');
    const timeout = setTimeout(() => console.log('Still hanging after 3s!'), 3000);
    await queue.add('job', { foo: 'bar' });
    clearTimeout(timeout);
    console.log('Added successfully!');
  } catch (e) {
    console.log('Error:', e.message);
  }
  await queue.close();
  console.log('Done');
  process.exit(0);
}
main();
