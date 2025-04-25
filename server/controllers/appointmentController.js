const { Op } = require('sequelize');
const Appointment = require('../models/Appointment');
const Store = require('../models/Store');
const User = require('../models/User');
const StoreAvailability = require('../models/StoreAvailability');
const { sendEmail, emailTemplates } = require('../utils/emailService');

const isTimeWithinAvailability = async (storeId, appointmentTime) => {
  const now = new Date();
  const appointmentDate = new Date(appointmentTime);
  
  if (appointmentDate < now) {
    return false;
  }

  const weekday = appointmentDate.toLocaleString('en-US', { weekday: 'long' });
  const time = appointmentTime.split('T')[1].substring(0, 8);

  const availability = await StoreAvailability.findOne({
    where: {
      store_id: storeId,
      weekday,
      start_time: { [Op.lte]: time },
      end_time: { [Op.gte]: time }
    }
  });

  return !!availability;
};

const isTimeSlotAvailable = async (storeId, appointmentTime, durationMinutes) => {
  const startTime = new Date(appointmentTime);
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

  const existingAppointment = await Appointment.findOne({
    where: {
      store_id: storeId,
      status: 'approved',
      appointment_time: {
        [Op.between]: [startTime, endTime]
      }
    }
  });

  return !existingAppointment;
};

exports.createAppointment = async (req, res) => {
  try {
    const { store_id, appointment_time, duration_minutes } = req.body;

    // Existing date validation
    const now = new Date();
    const appointmentDate = new Date(appointment_time);
    
    if (appointmentDate < now) {
      return res.status(400).json({ 
        message: 'Cannot create appointments in the past' 
      });
    }

    // Check store availability
    const isAvailable = await isTimeWithinAvailability(store_id, appointment_time);
    if (!isAvailable) {
      return res.status(400).json({ 
        message: 'Store is not available at this time or the appointment time is in the past' 
      });
    }

    // Check for overlapping appointments
    const isSlotAvailable = await isTimeSlotAvailable(store_id, appointment_time, duration_minutes);
    if (!isSlotAvailable) {
      return res.status(400).json({ 
        message: 'This time slot is already booked' 
      });
    }

    const appointment = await Appointment.create({
      store_id,
      user_id: req.user.userId,
      appointment_time,
      duration_minutes,
    });

    const user = await User.findByPk(req.user.userId);
    const store = await Store.findByPk(store_id);

    await sendEmail(
      user.email,
      emailTemplates.appointmentRequested(appointment, user.full_name, store.name)
    );

    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: 'Error creating appointment', error: error.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status',
        validValues: validStatuses
      });
    }

    const appointment = await Appointment.findOne({
      where: { id },
      include: [
        { 
          model: Store,
          attributes: ['name', 'user_id']
        },
        { 
          model: User,
          attributes: ['email', 'full_name']
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (appointment.Store.user_id !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }

    await appointment.update({ status });

    try {
      console.log('Sending email notification...');
      console.log('User email:', appointment.User.email);
      console.log('Store name:', appointment.Store.name);
      
      await sendEmail(
        appointment.User.email,
        emailTemplates.appointmentUpdated(
          appointment,
          appointment.User.full_name,
          appointment.Store.name,
          status
        )
      );
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
    }

    res.json(appointment);
  } catch (error) {
    console.error('Error in updateAppointmentStatus:', error);
    res.status(500).json({ 
      message: 'Error updating appointment', 
      error: error.message 
    });
  }
};

exports.getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { user_id: req.user.userId },
      include: [{ model: Store, attributes: ['name'] }],
      order: [['appointment_time', 'DESC']]
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

exports.getStoreAppointments = async (req, res) => {
  try {
    const store = await Store.findOne({
      where: { id: req.params.storeId, user_id: req.user.userId }
    });

    if (!store) {
      return res.status(403).json({ message: 'Not authorized to view these appointments' });
    }

    const appointments = await Appointment.findAll({
      where: { store_id: req.params.storeId },
      include: [{ 
        model: User,
        attributes: ['full_name', 'email'] 
      }],
      order: [['appointment_time', 'DESC']]
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
};

exports.getRecentAppointments = async (req, res) => {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    if (req.user.isStoreOwner) {
      // For store owners: Get all pending appointments
      const stores = await Store.findAll({
        where: { user_id: req.user.userId }
      });
      
      const storeIds = stores.map(store => store.id);
      
      const appointments = await Appointment.findAll({
        where: {
          store_id: { [Op.in]: storeIds },
          status: 'pending'
        },
        include: [
          { model: User, attributes: ['full_name', 'email'] },
          { model: Store, attributes: ['name'] }
        ],
        order: [['appointment_time', 'ASC']]
      });

      return res.json(appointments);
    } else {
      // For regular users: Get upcoming appointments within next 3 days
      const appointments = await Appointment.findAll({
        where: {
          user_id: req.user.userId,
          appointment_time: {
            [Op.gte]: new Date(),
            [Op.lte]: threeDaysFromNow
          }
        },
        include: [{ model: Store, attributes: ['name'] }],
        order: [['appointment_time', 'ASC']]
      });

      return res.json(appointments);
    }
  } catch (error) {
    console.error('Error in getRecentAppointments:', error);
    res.status(500).json({ 
      message: 'Error fetching recent appointments',
      error: error.message 
    });
  }
};

exports.getStoreBookedSlots = async (req, res) => {
  try {
    const { storeId } = req.params;
    const appointments = await Appointment.findAll({
      where: {
        store_id: storeId,
        status: ['pending', 'approved']
      },
      attributes: ['id', 'appointment_time', 'duration_minutes', 'status']
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booked slots' });
  }
};