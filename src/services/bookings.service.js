import * as bookingsRepository from "../repositories/bookings.repository.js"

import * as servicesRepository from "../repositories/services.repository.js";

const createBooking = async (data) => {
    const requiredFields = ['clientName', 'clientEmail', 'date', 'time'];

    const isComplete = requiredFields.every((field) => data[field] !== undefined);

    if (!isComplete) {
      return null;
    }

    const newBookingData = {...data, status: 'pending', services: []}

    return await bookingsRepository.create(newBookingData)
}

const getBookingById = (id) => {
    return bookingsRepository.getById(id)
}

const addServiceToBooking = async (bid, sid) => {
    const service = await servicesRepository.getById(sid)

    if (service === null) {
      return 'SERVICE_NOT_FOUND';
    }

    const booking = await bookingsRepository.getById(bid)

    if (booking === null) {
      return 'BOOKING_NOT_FOUND';
    }

    

    const services = booking.services;

    const result = services.find((entry) => entry.service === sid) || null;

     if (result === null) {
      services.push({ service: sid, quantity: 1 });
    } else {
      result.quantity += 1;
    }

    
    return bookingsRepository.update(bid, {services: booking.services})
}



export {
    createBooking,
    getBookingById,
    addServiceToBooking
}