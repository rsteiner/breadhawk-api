const transformerCache = require('./transformerCache');

// Common transformation functions
const transformVendor = (v) => {
    return transformerCache.transform('vendor', v, (data) => ({
        id: data.VendorID,
        businessName: data.BusinessName,
        contact: {
            phone: data.Phone,
            email: data.Email,
            website: data.Website
        },
        description: data.Description,
        category: data.CategoryID ? {
            id: data.CategoryID,
            name: data.CategoryName,
            parent: data.ParentCategoryID ? {
                id: data.ParentCategoryID,
                name: data.ParentCategoryName,
                parent: data.TopCategoryID ? {
                    id: data.TopCategoryID,
                    name: data.TopCategoryName
                } : null
            } : null
        } : null,
        market: data.MarketID ? {
            id: data.MarketID,
            name: data.MarketName,
            contact: data.MarketContactID ? {
                id: data.MarketContactID,
                firstName: data.MarketContactFirstName,
                lastName: data.MarketContactLastName,
                email: data.MarketContactEmail,
                phone: data.MarketContactPhone,
                role: data.MarketContactRole,
                pronouns: data.MarketContactPronouns
            } : null,
            organizer: data.OrganizerID ? {
                id: data.OrganizerID,
                name: data.OrganizerName,
                businessAddress: data.OrganizerAddress,
                ein: data.OrganizerEIN
            } : null
        } : null,
        timestamps: {
            created: data.CreatedAt,
            updated: data.UpdatedAt
        }
    }));
};

const transformVenue = (v) => {
    return transformerCache.transform('venue', v, (data) => ({
        id: data.VenueID,
        name: data.Name,
        location: {
            address: data.Address,
            city: data.City,
            state: data.State,
            zip: data.Zip
        },
        space: {
            size: data.Size,
            capacity: data.Capacity,
            indoorOutdoor: data.IndoorOutdoor,
            spaceType: data.SpaceType,
            boothSize: data.BoothSize
        },
        amenities: {
            restrooms: Boolean(data.HasRestrooms),
            parking: Boolean(data.HasParking),
            barLicense: Boolean(data.HasBarLicense),
            foodLicense: Boolean(data.HasFoodLicense),
            foodTruckSpace: Boolean(data.FoodTruckSpace),
            wifi: Boolean(data.HasWifi),
            electric: Boolean(data.HasElectric),
            rainOrShine: Boolean(data.RainOrShine)
        },
        availability: data.Availability,
        timestamps: {
            created: data.CreatedAt,
            updated: data.UpdatedAt
        }
    }));
};

const transformOrganizer = (o) => {
    return transformerCache.transform('organizer', o, (data) => ({
        id: data.OrganizerID,
        name: data.Name,
        location: {
            address: data.Address,
            city: data.City,
            state: data.State,
            zip: data.Zip
        },
        ein: data.EIN,
        timestamps: {
            created: data.CreatedAt,
            updated: data.UpdatedAt
        }
    }));
};

const transformMarket = (m) => {
    return transformerCache.transform('market', m, (data) => ({
        id: data.MarketID,
        name: data.Name,
        space: {
            size: data.Size,
            capacity: data.Capacity,
            indoorOutdoor: data.IndoorOutdoor
        },
        category: data.TermID ? {
            id: data.TermID,
            name: data.TermName,
            parent: data.ParentTermID ? {
                id: data.ParentTermID,
                name: data.ParentTermName
            } : null
        } : null,
        venue: data.VenueID ? transformVenue(data) : null,
        organizer: data.OrganizerID ? transformOrganizer(data) : null,
        timestamps: {
            created: data.CreatedAt,
            updated: data.UpdatedAt
        }
    }));
};

const transformEvent = (e) => {
    return transformerCache.transform('event', e, (data) => ({
        id: data.EventID,
        name: data.Name || data.MarketName,
        dates: {
            start: data.DateStart,
            end: data.DateEnd
        },
        space: {
            size: data.Size || data.MarketSize,
            capacity: data.Capacity || data.MarketCapacity,
            indoorOutdoor: data.IndoorOutdoor || data.MarketIndoorOutdoor
        },
        venue: (data.VenueID || data.MarketVenueID) ? transformVenue({
            ...data,
            VenueID: data.VenueID || data.MarketVenueID
        }) : null,
        organizer: (data.OrganizerID || data.MarketOrganizerID) ? transformOrganizer({
            ...data,
            OrganizerID: data.OrganizerID || data.MarketOrganizerID
        }) : null,
        market: {
            id: data.MarketID,
            name: data.MarketName
        },
        timestamps: {
            created: data.CreatedAt,
            updated: data.UpdatedAt
        }
    }));
};

module.exports = {
    transformVendor,
    transformMarket,
    transformVenue,
    transformOrganizer,
    transformEvent
};