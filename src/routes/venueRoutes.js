const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const db = require('../config/database');

// GET all venues with filtering and sorting
router.get('/', asyncHandler(async (req, res) => {
    const {
        indoorOutdoor,
        hasWifi,
        hasElectric,
        hasParking,
        minCapacity,
        sort = 'Name',
        order = 'ASC'
    } = req.query;

    let query = 'SELECT * FROM Venue WHERE 1=1';
    const params = [];

    // Add filters
    if (indoorOutdoor) {
        query += ' AND IndoorOutdoor = ?';
        params.push(indoorOutdoor);
    }
    if (hasWifi) {
        query += ' AND HasWifi = ?';
        params.push(hasWifi === 'true' ? 1 : 0);
    }
    if (hasElectric) {
        query += ' AND HasElectric = ?';
        params.push(hasElectric === 'true' ? 1 : 0);
    }
    if (hasParking) {
        query += ' AND HasParking = ?';
        params.push(hasParking === 'true' ? 1 : 0);
    }
    if (minCapacity) {
        query += ' AND Capacity >= ?';
        params.push(parseInt(minCapacity));
    }

    // Add sorting
    query += ` ORDER BY ${sort} ${order}`;

    const [rows] = await db.query(query, params);
    res.json({
        status: 'success',
        data: rows
    });
}));

// GET venue by ID
router.get('/:id', asyncHandler(async (req, res) => {
    const [rows] = await db.query('SELECT * FROM Venue WHERE VenueID = ?', [req.params.id]);
    if (rows.length === 0) {
        res.status(404).json({
            status: 'error',
            message: 'Venue not found'
        });
        return;
    }
    res.json({
        status: 'success',
        data: rows[0]
    });
}));

// GET events at a specific venue
router.get('/:id/events', asyncHandler(async (req, res) => {
    const {
        dateStart,
        dateEnd
    } = req.query;

    let query = 'SELECT * FROM Event WHERE VenueID = ?';
    const params = [req.params.id];

    if (dateStart) {
        query += ' AND DateStart >= ?';
        params.push(dateStart);
    }
    if (dateEnd) {
        query += ' AND DateEnd <= ?';
        params.push(dateEnd);
    }

    query += ' ORDER BY DateStart ASC';

    const [rows] = await db.query(query, params);
    res.json({
        status: 'success',
        data: rows
    });
}));

module.exports = router;
