import books from './books.json';
import shelfEntries from './shelf-entries.json';
import users from './users.json';

const [reader, admin] = users;

if (!reader || !admin) {
	throw new Error('Expected tests/data/users.json to include the reader and admin users');
}

export {
  users,
  books,
  shelfEntries,
  reader,
  admin
};