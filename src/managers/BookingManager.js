import fs from 'node:fs/promises';

export default class BookingManager {
  readBookings = async (path) => {
    try {
      const data = await fs.readFile(path, 'utf-8');

      return JSON.parse(data).bookings;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  };

  writeBookings = async (path, bookings) => {
    await fs.writeFile(path, JSON.stringify({ bookings }, null, 2));
  };

  getBookingById = async (id, path) => {
    const bookings = await this.readBookings(path);

    const result = bookings.find((booking) => booking.id === id) || null;
    return result;
  };

  createBooking = async (bookingData, path) => {
    const requiredFields = ['clientName', 'clientEmail', 'date', 'time'];

    const isComplete = requiredFields.every((field) => bookingData[field] !== undefined);

    if (!isComplete) {
      return null;
    }

    bookingData.id = crypto.randomUUID();
    bookingData.status = 'pending';
    bookingData.services = [];

    const bookings = await this.readBookings(path);

    bookings.push(bookingData);

    await this.writeBookings(path, bookings);

    return bookingData;
  };

  addServiceToBooking = async (bid, sid, bookingsPath) => {
    const bookings = await this.readBookings(bookingsPath);

    const booking = bookings.find((booking) => booking.id === bid) || null;

    if (!booking) {
      return null;
    }

    const services = booking.services;

    const result = services.find((entry) => entry.service === sid) || null;

    if (result === null) {
      services.push({ service: sid, quantity: 1 });
    } else {
      result.quantity += 1;
    }

    await this.writeBookings(bookingsPath, bookings);

    return booking;
  };
}
