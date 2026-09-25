import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const FILE_PATH = path.join(__dirname, '../data/bookings.json')



const readBookings = async () => {
    try {
      const data = await fs.readFile(FILE_PATH, 'utf-8');

      return JSON.parse(data).bookings;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
};

const writeBookings = async (bookings) => {
    await fs.writeFile(FILE_PATH, JSON.stringify({ bookings }, null, 2));
};

const create = async (data) => {
    const newBooking = {...data, id: crypto.randomUUID()};

    const bookings = await readBookings();

    bookings.push(newBooking);

    await writeBookings(bookings)

    return newBooking

}

const getById = async (id) => {
    const result = (await readBookings()).find((booking) => booking.id === id) || null;
    return result;
}

const update = async (id, updatedData) => {
    const bookings = await readBookings();

    const bookingToUpdate = bookings.find((booking) => booking.id === id) || null;

    if (!bookingToUpdate) {
      return null;
    }

    Object.assign(bookingToUpdate, updatedData);

    await writeBookings(bookings);

    return bookingToUpdate;
}


export {
    create,
    getById,
    update
}