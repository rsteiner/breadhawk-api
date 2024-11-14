# Breadhawk API

REST API for managing markets, events, vendors, and venues.

## Base URL
`http://localhost:3000/api`

## Authentication
*TBD*

## Resources

### Markets

#### GET /markets
Get all markets.

**Query Parameters**
- None

**Response**
Returns an array of market objects with their associated venue and organizer details.

#### GET /markets/:id
Get a specific market by ID.

**Parameters**
- `id`: Market ID

**Response**
Returns a single market object with its associated venue and organizer details.

#### GET /markets/:id/events
Get all events for a specific market.

**Parameters**
- `id`: Market ID

**Query Parameters**
- `upcoming`: (boolean) Filter for upcoming events only

**Response**
Returns an array of event objects associated with the specified market.

### Events

#### GET /events
Get all events.

**Query Parameters**
- `venue`: (number) Filter by venue ID
- `organizer`: (number) Filter by organizer ID
- `dateStart`: (ISO date) Filter by start date
- `dateEnd`: (ISO date) Filter by end date
- `indoorOutdoor`: (string) Filter by "Indoor", "Outdoor", or "Both"
- `sort`: (string) Sort field (default: "DateStart")
- `order`: (string) Sort order "ASC" or "DESC" (default: "ASC")

**Response**
Returns an array of event objects with their associated market, venue, and organizer details.

#### GET /events/:id
Get a specific event by ID.

**Parameters**
- `id`: Event ID

**Response**
Returns a single event object with its associated market, venue, and organizer details.

#### POST /events
Create a new event.

**Request Body**
- `name`: (string) Event name
- `dateStart`: (ISO date) Event start date/time
- `dateEnd`: (ISO date) Event end date/time
- `marketID`: (number) Associated market ID
- `venueID`: (number, optional) Override market venue
- `organizerID`: (number, optional) Override market organizer
- `size`: (string, optional) Override market size
- `capacity`: (number, optional) Override market capacity
- `indoorOutdoor`: (string, optional) Override market indoor/outdoor setting

**Response**
Returns the created event object.

#### PUT /events/:id
Update an existing event.

**Parameters**
- `id`: Event ID

**Request Body**
Same as POST /events

**Response**
Returns the updated event object.

#### DELETE /events/:id
Delete an event.

**Parameters**
- `id`: Event ID

**Response**
Returns a success message.
