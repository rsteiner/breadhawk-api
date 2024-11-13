const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const db = require('../config/database');
const { transformVendor, transformMarket } = require('../utils/transformers');

// GET all terms
router.get('/', asyncHandler(async (req, res) => {
    const [terms] = await db.query(`
        SELECT 
            t1.TermID,
            t1.Name,
            t1.Type,
            t1.ParentID,
            COALESCE(t2.Name, 'ROOT') as ParentName
        FROM Term t1
        LEFT JOIN Term t2 ON t1.ParentID = t2.TermID
        ORDER BY 
            COALESCE(t2.Name, t1.Name),
            t1.Name
    `);

    res.json({
        status: 'success',
        data: terms
    });
}));

// GET term by ID with children
router.get('/:id', asyncHandler(async (req, res) => {
    const termId = req.params.id;

    // Get the term and its immediate children
    const [terms] = await db.query(`
        SELECT 
            t1.TermID,
            t1.Name,
            t1.Type,
            t1.ParentID,
            COALESCE(t2.Name, 'ROOT') as ParentName
        FROM Term t1
        LEFT JOIN Term t2 ON t1.ParentID = t2.TermID
        WHERE 
            t1.TermID = ? 
            OR t1.ParentID = ?
            OR t1.ParentID IN (
                SELECT TermID 
                FROM Term 
                WHERE ParentID = ?
            )
        ORDER BY 
            t1.ParentID IS NULL DESC,
            t1.Name
    `, [termId, termId, termId]);

    // Get associated vendors count
    const [vendorCounts] = await db.query(`
        SELECT COUNT(*) as VendorCount
        FROM Vendor
        WHERE TermID = ?
    `, [termId]);

    // Get associated markets count
    const [marketCounts] = await db.query(`
        SELECT COUNT(*) as MarketCount
        FROM Market
        WHERE TermID = ?
    `, [termId]);

    res.json({
        status: 'success',
        data: {
            term: terms[0],
            children: terms.slice(1),
            stats: {
                vendorCount: vendorCounts[0].VendorCount,
                marketCount: marketCounts[0].MarketCount
            }
        }
    });
}));

// GET vendors by term ID (including child terms)
router.get('/:id/vendors', asyncHandler(async (req, res) => {
    const termId = req.params.id;

    const [vendors] = await db.query(`
        SELECT 
            v.*,
            t.TermID as CategoryID,
            t.Name as CategoryName,
            p.TermID as ParentCategoryID,
            p.Name as ParentCategoryName,
            pp.TermID as TopCategoryID,
            pp.Name as TopCategoryName
        FROM Vendor v
        JOIN Term t ON v.TermID = t.TermID
        LEFT JOIN Term p ON t.ParentID = p.TermID
        LEFT JOIN Term pp ON p.ParentID = pp.TermID
        WHERE 
            v.TermID = ?
            OR t.ParentID = ?
            OR t.ParentID IN (
                SELECT TermID 
                FROM Term 
                WHERE ParentID = ?
            )
        ORDER BY v.BusinessName
    `, [termId, termId, termId]);

    res.json({
        status: 'success',
        data: vendors.map(transformVendor)
    });
}));

// GET markets by term ID (including child terms)
router.get('/:id/markets', asyncHandler(async (req, res) => {
    const termId = req.params.id;

    const [markets] = await db.query(`
        SELECT 
            m.*,
            t.TermID as CategoryID,
            t.Name as CategoryName,
            p.TermID as ParentCategoryID,
            p.Name as ParentCategoryName,
            c.ContactID,
            c.FirstName as ContactFirstName,
            c.LastName as ContactLastName,
            c.Email as ContactEmail,
            c.PhoneNumber as ContactPhone,
            c.Role as ContactRole,
            c.Pronouns as ContactPronouns,
            o.OrganizerID,
            o.Name as OrganizerName,
            o.BusinessAddress as OrganizerAddress,
            o.EIN as OrganizerEIN
        FROM Market m
        JOIN Term t ON m.TermID = t.TermID
        LEFT JOIN Term p ON t.ParentID = p.TermID
        LEFT JOIN Contact c ON m.ContactID = c.ContactID
        LEFT JOIN Organizer o ON m.OrganizerID = o.OrganizerID
        WHERE 
            m.TermID = ?
            OR t.ParentID = ?
            OR t.ParentID IN (
                SELECT TermID 
                FROM Term 
                WHERE ParentID = ?
            )
        ORDER BY m.Name
    `, [termId, termId, termId]);

    res.json({
        status: 'success',
        data: markets.map(transformMarket)
    });
}));

module.exports = router;
