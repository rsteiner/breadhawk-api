const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const db = require('../config/database');

// GET all vendors with filtering and sorting
router.get('/', asyncHandler(async (req, res) => {
    const {
        market,
        category,
        area,
        sort = 'BusinessName',
        order = 'ASC'
    } = req.query;

    let query = 'SELECT * FROM Vendor WHERE 1=1';
    const params = [];

    // Add filters
    if (market) {
        query += ' AND MarketID = ?';
        params.push(market);
    }
    if (category) {
        query += ' AND Category = ?';
        params.push(category);
    }
    if (area) {
        query += ' AND Area = ?';
        params.push(area);
    }

    // Add sorting
    query += ` ORDER BY ${sort} ${order}`;

    const [rows] = await db.query(query, params);
    res.json({
        status: 'success',
        data: rows
    });
}));

// GET vendor by ID
router.get('/:id', asyncHandler(async (req, res) => {
    const [rows] = await db.query('SELECT * FROM Vendor WHERE VendorID = ?', [req.params.id]);
    if (rows.length === 0) {
        res.status(404).json({
            status: 'error',
            message: 'Vendor not found'
        });
        return;
    }
    res.json({
        status: 'success',
        data: rows[0]
    });
}));

// GET vendor's events
router.get('/:id/events', asyncHandler(async (req, res) => {
    const [rows] = await db.query(
        `SELECT e.* 
         FROM Event e 
         JOIN VendorEvent ve ON e.EventID = ve.EventID 
         WHERE ve.VendorID = ?`,
        [req.params.id]
    );
    res.json({
        status: 'success',
        data: rows
    });
}));

module.exports = router;
