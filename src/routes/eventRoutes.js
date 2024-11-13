const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const db = require('../config/database');

// GET all events with filtering and sorting
router.get('/', asyncHandler(async (req, res) => {
    const {
        venue,
        organizer,
        dateStart,
        dateEnd,
        indoorOutdoor,
        sort = 'DateStart',
        order = 'ASC'
    } = req.query;

    let query = 'SELECT * FROM Event WHERE 1=1';
    const params = [];

    // Add filters
    if (venue) {
        query += ' AND VenueID = ?';
        params.push(venue);
    }
    if (organizer) {
        query += ' AND OrganizerID = ?';
        params.push(organizer);
    }
    if (dateStart) {
        query += ' AND DateStart >= ?';
        params.push(dateStart);
    }
    if (dateEnd) {
        query += ' AND DateEnd <= ?';
        params.push(dateEnd);
    }
    if (indoorOutdoor) {
        query += ' AND IndoorOutdoor = ?';
        params.push(indoorOutdoor);
    }

    // Add sorting
    query += ` ORDER BY ${sort} ${order}`;

    const [rows] = await db.query(query, params);
    res.json({
        status: 'success',
        data: rows
    });
}));

// GET event by ID
router.get('/:id', asyncHandler(async (req, res) => {
    const [rows] = await db.query('SELECT * FROM Event WHERE EventID = ?', [req.params.id]);
    if (rows.length === 0) {
        res.status(404).json({
            status: 'error',
            message: 'Event not found'
        });
        return;
    }
    res.json({
        status: 'success',
        data: rows[0]
    });
}));

// GET vendors for a specific event
router.get('/:id/vendors', asyncHandler(async (req, res) => {
    const [rows] = await db.query(
        `SELECT v.* 
         FROM Vendor v 
         JOIN VendorEvent ve ON v.VendorID = ve.VendorID 
         WHERE ve.EventID = ?`,
        [req.params.id]
    );
    res.json({
        status: 'success',
        data: rows
    });
}));

module.exports = router;
