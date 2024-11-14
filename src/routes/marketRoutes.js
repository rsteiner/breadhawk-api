const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const db = require('../config/database');
const { transformMarket, transformEvent } = require('../utils/transformers');

// GET all markets with enhanced filtering and stats
router.get('/', asyncHandler(async (req, res) => {
    const {
        category,
        minVendors,
        hasActiveEvents,
        includeStats,
        sort = 'Name',
        order = 'ASC'
    } = req.query;

    let query = `
        SELECT 
            m.*,
            COUNT(DISTINCT v.VendorID) as VendorCount,
            COUNT(DISTINCT e.EventID) as UpcomingEventCount,
            c.FirstName as ContactFirstName,
            c.LastName as ContactLastName,
            c.Email as ContactEmail,
            c.PhoneNumber as ContactPhone,
            c.Role as ContactRole,
            c.Pronouns as ContactPronouns,
            o.Name as OrganizerName,
            o.BusinessAddress as OrganizerAddress,
            o.EIN as OrganizerEIN
        FROM Market m
        LEFT JOIN Contact c ON m.ContactID = c.ContactID
        LEFT JOIN Organizer o ON m.OrganizerID = o.OrganizerID
        LEFT JOIN Vendor v ON m.MarketID = v.MarketID
        LEFT JOIN VendorEvent ve ON v.VendorID = ve.VendorID
        LEFT JOIN Event e ON ve.EventID = e.EventID 
            AND e.DateStart >= CURDATE()
        WHERE 1=1
    `;
    const params = [];

    if (category) {
        query += ' AND m.Category = ?';
        params.push(category);
    }

    if (minVendors) {
        query += ' HAVING VendorCount >= ?';
        params.push(parseInt(minVendors));
    }

    if (hasActiveEvents === 'true') {
        query += ' HAVING UpcomingEventCount > 0';
    }

    query += ` GROUP BY m.MarketID ORDER BY ${sort} ${order}`;

    const [rows] = await db.query(query, params);
    res.json({
        status: 'success',
        data: rows.map(row => ({
            ...row,
            contact: row.ContactFirstName ? {
                firstName: row.ContactFirstName,
                lastName: row.ContactLastName,
                email: row.ContactEmail,
                phone: row.ContactPhone,
                role: row.ContactRole,
                pronouns: row.ContactPronouns
            } : null,
            organizer: row.OrganizerName ? {
                name: row.OrganizerName,
                businessAddress: row.OrganizerAddress,
                ein: row.OrganizerEIN
            } : null,
            // Remove the raw fields from the top level
            ContactFirstName: undefined,
            ContactLastName: undefined,
            ContactEmail: undefined,
            ContactPhone: undefined,
            ContactRole: undefined,
            ContactPronouns: undefined,
            OrganizerName: undefined,
            OrganizerAddress: undefined,
            OrganizerEIN: undefined
        }))
    });
}));

// GET market details with stats
router.get('/:id', asyncHandler(async (req, res) => {
    const [marketDetails] = await db.query(`
        SELECT 
            m.*,
            COUNT(DISTINCT v.VendorID) as TotalVendors,
            COUNT(DISTINCT e.EventID) as UpcomingEvents,
            GROUP_CONCAT(DISTINCT v.Category) as VendorCategories,
            c.FirstName as ContactFirstName,
            c.LastName as ContactLastName,
            c.Email as ContactEmail,
            c.PhoneNumber as ContactPhone,
            c.Role as ContactRole,
            c.Pronouns as ContactPronouns,
            o.Name as OrganizerName,
            o.BusinessAddress as OrganizerAddress,
            o.EIN as OrganizerEIN
        FROM Market m
        LEFT JOIN Contact c ON m.ContactID = c.ContactID
        LEFT JOIN Organizer o ON m.OrganizerID = o.OrganizerID
        LEFT JOIN Vendor v ON m.MarketID = v.MarketID
        LEFT JOIN VendorEvent ve ON v.VendorID = ve.VendorID
        LEFT JOIN Event e ON ve.EventID = e.EventID 
            AND e.DateStart >= CURDATE()
        WHERE m.MarketID = ?
        GROUP BY m.MarketID
    `, [req.params.id]);

    if (marketDetails.length === 0) {
        res.status(404).json({
            status: 'error',
            message: 'Market not found'
        });
        return;
    }

    // Get upcoming events for this market
    const [upcomingEvents] = await db.query(`
        SELECT DISTINCT e.*
        FROM Event e
        JOIN VendorEvent ve ON e.EventID = ve.EventID
        JOIN Vendor v ON ve.VendorID = v.VendorID
        WHERE v.MarketID = ?
            AND e.DateStart >= CURDATE()
        ORDER BY e.DateStart
        LIMIT 5
    `, [req.params.id]);

    // Get vendor category distribution
    const [categoryDistribution] = await db.query(`
        SELECT 
            Category,
            COUNT(*) as Count
        FROM Vendor
        WHERE MarketID = ?
        GROUP BY Category
    `, [req.params.id]);

    const marketData = {
        ...marketDetails[0],
        contact: marketDetails[0].ContactFirstName ? {
            firstName: marketDetails[0].ContactFirstName,
            lastName: marketDetails[0].ContactLastName,
            email: marketDetails[0].ContactEmail,
            phone: marketDetails[0].ContactPhone,
            role: marketDetails[0].ContactRole,
            pronouns: marketDetails[0].ContactPronouns
        } : null,
        organizer: marketDetails[0].OrganizerName ? {
            name: marketDetails[0].OrganizerName,
            businessAddress: marketDetails[0].OrganizerAddress,
            ein: marketDetails[0].OrganizerEIN
        } : null,
        upcomingEvents,
        categoryDistribution
    };

    // Remove the raw fields from the top level
    delete marketData.ContactFirstName;
    delete marketData.ContactLastName;
    delete marketData.ContactEmail;
    delete marketData.ContactPhone;
    delete marketData.ContactRole;
    delete marketData.ContactPronouns;
    delete marketData.OrganizerName;
    delete marketData.OrganizerAddress;
    delete marketData.OrganizerEIN;

    res.json({
        status: 'success',
        data: marketData
    });
}));

// GET vendors in a market with enhanced filtering
router.get('/:id/vendors', asyncHandler(async (req, res) => {
    const {
        category,
        hasUpcomingEvents,
        activeOnly,
        sort = 'BusinessName',
        order = 'ASC'
    } = req.query;

    let query = `
        SELECT 
            v.*,
            COUNT(DISTINCT e.EventID) as UpcomingEventCount
        FROM Vendor v
        LEFT JOIN VendorEvent ve ON v.VendorID = ve.VendorID
        LEFT JOIN Event e ON ve.EventID = e.EventID 
            AND e.DateStart >= CURDATE()
        WHERE v.MarketID = ?
    `;
    const params = [req.params.id];

    if (category) {
        query += ' AND v.Category = ?';
        params.push(category);
    }

    query += ' GROUP BY v.VendorID';

    if (hasUpcomingEvents === 'true') {
        query += ' HAVING UpcomingEventCount > 0';
    }

    query += ` ORDER BY ${sort} ${order}`;

    const [rows] = await db.query(query, params);
    res.json({
        status: 'success',
        data: rows
    });
}));

// GET all events for a market
router.get('/:id/events', asyncHandler(async (req, res) => {
    const { upcoming } = req.query;
    
    let query = `
        SELECT 
            e.*,
            m.Name as MarketName,
            m.Size as MarketSize,
            m.Capacity as MarketCapacity,
            m.IndoorOutdoor as MarketIndoorOutdoor,
            m.VenueID as MarketVenueID,
            m.OrganizerID as MarketOrganizerID
        FROM Event e
        JOIN Market m ON e.MarketID = m.MarketID
        WHERE e.MarketID = ?`;

    const params = [req.params.id];

    if (upcoming === 'true') {
        query += ` AND e.DateStart >= CURRENT_TIMESTAMP()`;
    }

    query += ` ORDER BY e.DateStart ASC`;

    const [events] = await db.query(query, params);

    res.json({
        status: 'success',
        data: events.map(transformEvent)
    });
}));

module.exports = router;
