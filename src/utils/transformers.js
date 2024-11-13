// Common transformation functions
const transformVendor = (v) => ({
    id: v.VendorID,
    businessName: v.BusinessName,
    contact: {
        phone: v.Phone,
        email: v.Email,
        website: v.Website
    },
    description: v.Description,
    category: v.CategoryID ? {
        id: v.CategoryID,
        name: v.CategoryName,
        parent: v.ParentCategoryID ? {
            id: v.ParentCategoryID,
            name: v.ParentCategoryName,
            parent: v.TopCategoryID ? {
                id: v.TopCategoryID,
                name: v.TopCategoryName
            } : null
        } : null
    } : null,
    market: v.MarketID ? {
        id: v.MarketID,
        name: v.MarketName,
        contact: v.MarketContactID ? {
            id: v.MarketContactID,
            firstName: v.MarketContactFirstName,
            lastName: v.MarketContactLastName,
            email: v.MarketContactEmail,
            phone: v.MarketContactPhone,
            role: v.MarketContactRole,
            pronouns: v.MarketContactPronouns
        } : null,
        organizer: v.OrganizerID ? {
            id: v.OrganizerID,
            name: v.OrganizerName,
            businessAddress: v.OrganizerAddress,
            ein: v.OrganizerEIN
        } : null
    } : null,
    timestamps: {
        created: v.CreatedAt,
        updated: v.UpdatedAt
    }
});

const transformMarket = (m) => ({
    id: m.MarketID,
    name: m.Name,
    space: {
        size: m.Size,
        capacity: m.Capacity,
        indoorOutdoor: m.IndoorOutdoor
    },
    category: m.TermID ? {
        id: m.TermID,
        name: m.TermName,
        parent: m.ParentTermID ? {
            id: m.ParentTermID,
            name: m.ParentTermName
        } : null
    } : null,
    venue: m.VenueID ? transformVenue(m) : null,
    organizer: m.OrganizerID ? transformOrganizer(m) : null,
    timestamps: {
        created: m.CreatedAt,
        updated: m.UpdatedAt
    }
});


const transformVenue = (v) => ({
    id: v.VenueID,
    name: v.Name,
    location: {
        address: v.Address,
        city: v.City,
        state: v.State,
        zip: v.Zip
    },
    space: {
        size: v.Size,
        capacity: v.Capacity,
        indoorOutdoor: v.IndoorOutdoor,
        spaceType: v.SpaceType,
        boothSize: v.BoothSize
    },
    amenities: {
        restrooms: Boolean(v.HasRestrooms),
        parking: Boolean(v.HasParking),
        barLicense: Boolean(v.HasBarLicense),
        foodLicense: Boolean(v.HasFoodLicense),
        foodTruckSpace: Boolean(v.FoodTruckSpace),
        wifi: Boolean(v.HasWifi),
        electric: Boolean(v.HasElectric),
        rainOrShine: Boolean(v.RainOrShine)
    },
    availability: v.Availability,
    timestamps: {
        created: v.CreatedAt,
        updated: v.UpdatedAt
    }
});

const transformOrganizer = (o) => ({
    id: o.OrganizerID,
    name: o.Name,
    location: {
        address: o.Address,
        city: o.City,
        state: o.State,
        zip: o.Zip
    },
    ein: o.EIN,
    timestamps: {
        created: o.CreatedAt,
        updated: o.UpdatedAt
    }
});

module.exports = {
    transformVendor,
    transformMarket,
    transformVenue,
    transformOrganizer
};

