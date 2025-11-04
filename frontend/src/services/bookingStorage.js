// LocalStorage utility for managing booking data

const STORAGE_KEY = 'pams_booking_data';

// Get all booking data from localStorage
export const getBookingData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {
      showcaseBookings: [],
      speedDatingBookings: [],
      proposals: []
    };
  } catch (error) {
    console.error('Error reading booking data:', error);
    return {
      showcaseBookings: [],
      speedDatingBookings: [],
      proposals: []
    };
  }
};

// Save all booking data to localStorage
const saveBookingData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving booking data:', error);
  }
};

// Add a showcase booking
export const addShowcaseBooking = (showcase, session) => {
  const data = getBookingData();
  const booking = {
    id: Date.now(),
    showcase: {
      id: showcase.id,
      title: showcase.title,
      artist: showcase.artist,
      genre: showcase.genre,
      duration: showcase.duration
    },
    session: {
      id: session.id,
      date: session.date,
      time: session.time,
      venue: session.venue
    },
    bookedAt: new Date().toISOString(),
    type: 'showcase'
  };

  data.showcaseBookings.push(booking);
  saveBookingData(data);
  return booking;
};

// Add a speed dating booking
export const addSpeedDatingBooking = (session) => {
  const data = getBookingData();
  const booking = {
    id: Date.now(),
    session: {
      id: session.id,
      date: session.date,
      time: session.time,
      venue: session.venue,
      session: session.session
    },
    bookedAt: new Date().toISOString(),
    type: 'speed-dating'
  };

  data.speedDatingBookings.push(booking);
  saveBookingData(data);
  return booking;
};

// Add a proposal
export const addProposal = (showcase, formData) => {
  const data = getBookingData();
  const proposal = {
    id: Date.now(),
    showcase: {
      id: showcase.id,
      title: showcase.title,
      artist: showcase.artist,
      genre: showcase.genre,
      duration: showcase.duration
    },
    bookerInfo: {
      company: formData.bookerCompany,
      name: formData.bookerName,
      email: formData.bookerEmail,
      phone: formData.bookerPhone
    },
    venueInfo: {
      name: formData.venueName,
      address: formData.venueAddress,
      capacity: formData.venueCapacity,
      type: formData.venueType
    },
    performanceDetails: {
      date: formData.performanceDate,
      time: formData.performanceTime,
      ticketPrice: formData.ticketPrice,
      performanceCount: formData.performanceCount
    },
    generatedAt: new Date().toISOString(),
    status: 'generated'
  };

  data.proposals.push(proposal);
  saveBookingData(data);
  return proposal;
};

// Get showcase bookings
export const getShowcaseBookings = () => {
  const data = getBookingData();
  return data.showcaseBookings;
};

// Get speed dating bookings
export const getSpeedDatingBookings = () => {
  const data = getBookingData();
  return data.speedDatingBookings;
};

// Get proposals
export const getProposals = () => {
  const data = getBookingData();
  return data.proposals;
};

// Clear all booking data (for testing)
export const clearBookingData = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Format date for display
export const formatBookingDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  } catch (error) {
    return dateString;
  }
};

// Format datetime for display
export const formatBookingDateTime = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
};