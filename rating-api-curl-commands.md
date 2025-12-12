# Offer Rating API - cURL Commands

## Base Configuration
```bash
# Base URL
BASE_URL="http://localhost:5000/api/v1"

# Authentication Token (replace with your actual JWT token)
AUTH_TOKEN="your_jwt_token_here"
```

## 1. Create Rating for an Offer

### Create Rating (POST /offers/ratings/)
**Description:** Creates a new rating for an offer (one user can only rate once per offer)

```bash
curl -X POST "$BASE_URL/offers/ratings/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "offer_id": 1,
    "rating": 4,
    "review_text": "Great offer! Very satisfied with the service."
  }'
```

### Create Rating with Minimal Data
```bash
curl -X POST "$BASE_URL/offers/ratings/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "offer_id": 1,
    "rating": 5
  }'
```

## 2. Get All Ratings for an Offer

### Get Ratings by Offer ID (GET /offers/ratings/offer/:offer_id)
**Description:** Retrieves all ratings for a specific offer with pagination

```bash
curl -X GET "$BASE_URL/offers/ratings/offer/1?limit=5&page=1" \
  -H "Content-Type: application/json"
```

### Get Ratings with Different Pagination
```bash
# Get 10 ratings from page 2
curl -X GET "$BASE_URL/offers/ratings/offer/1?limit=10&page=2" \
  -H "Content-Type: application/json"
```

## 3. Get Rating by ID

### Get Rating Details (GET /offers/ratings/:id)
**Description:** Retrieves a specific rating by its ID

```bash
curl -X GET "$BASE_URL/offers/ratings/123" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

## 4. Update Rating

### Update Rating (PUT /offers/ratings/:id)
**Description:** Updates an existing rating (only the rating owner or admin can update)

```bash
curl -X PUT "$BASE_URL/offers/ratings/123" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "rating": 5,
    "review_text": "Updated review: Excellent service and great value!"
  }'
```

### Update Only Rating Score
```bash
curl -X PUT "$BASE_URL/offers/ratings/123" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "rating": 3
  }'
```

## 5. Delete Rating

### Delete Rating (DELETE /offers/ratings/:id)
**Description:** Deletes a rating (only the rating owner or admin can delete)

```bash
curl -X DELETE "$BASE_URL/offers/ratings/123" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

## 6. Get User's Ratings

### Get Ratings by User ID (GET /offers/ratings/user/:user_id)
**Description:** Retrieves all ratings given by a specific user

```bash
curl -X GET "$BASE_URL/offers/ratings/user/456?limit=10&page=1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

## Complete Examples with Full Setup

### Setup Variables and Test Commands
```bash
#!/bin/bash

# Configuration
BASE_URL="http://localhost:5000/api/v1"
AUTH_TOKEN="your_jwt_token_here"
OFFER_ID=1
RATING_ID=123
USER_ID=456

echo "=== Offer Rating API cURL Commands ==="
echo ""

echo "1. Create Rating for Offer $OFFER_ID:"
echo "curl -X POST \"$BASE_URL/offers/ratings/\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -H \"Authorization: Bearer \$AUTH_TOKEN\" \\"
echo "  -d '{\"offer_id\": $OFFER_ID, \"rating\": 4, \"review_text\": \"Great offer!\"}'"
echo ""

echo "2. Get All Ratings for Offer $OFFER_ID:"
echo "curl -X GET \"$BASE_URL/offers/ratings/offer/$OFFER_ID?limit=5&page=1\" \\"
echo "  -H \"Content-Type: application/json\""
echo ""

echo "3. Get Rating by ID $RATING_ID:"
echo "curl -X GET \"$BASE_URL/offers/ratings/$RATING_ID\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -H \"Authorization: Bearer \$AUTH_TOKEN\""
echo ""

echo "4. Update Rating $RATING_ID:"
echo "curl -X PUT \"$BASE_URL/offers/ratings/$RATING_ID\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -H \"Authorization: Bearer \$AUTH_TOKEN\" \\"
echo "  -d '{\"rating\": 5, \"review_text\": \"Updated review!\"}'"
echo ""

echo "5. Delete Rating $RATING_ID:"
echo "curl -X DELETE \"$BASE_URL/offers/ratings/$RATING_ID\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -H \"Authorization: Bearer \$AUTH_TOKEN\""
echo ""

echo "6. Get Ratings by User $USER_ID:"
echo "curl -X GET \"$BASE_URL/offers/ratings/user/$USER_ID?limit=10&page=1\" \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -H \"Authorization: Bearer \$AUTH_TOKEN\""
```

### Automated Test Script
```bash
#!/bin/bash

# Complete test script for rating APIs
BASE_URL="http://localhost:5000/api/v1"
AUTH_TOKEN="your_jwt_token_here"

# Test 1: Create Rating
echo "Testing Create Rating..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/offers/ratings/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{"offer_id": 1, "rating": 4, "review_text": "Great offer!"}')

echo "Create Response: $CREATE_RESPONSE"

# Extract rating ID from response (you may need to adjust this parsing)
RATING_ID=$(echo $CREATE_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ ! -z "$RATING_ID" ]; then
    echo "Rating created with ID: $RATING_ID"
    
    # Test 2: Get Rating by ID
    echo "Testing Get Rating by ID..."
    curl -X GET "$BASE_URL/offers/ratings/$RATING_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $AUTH_TOKEN"
    
    echo ""
    
    # Test 3: Update Rating
    echo "Testing Update Rating..."
    curl -X PUT "$BASE_URL/offers/ratings/$RATING_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      -d '{"rating": 5, "review_text": "Updated review!"}'
    
    echo ""
    
    # Test 4: Delete Rating
    echo "Testing Delete Rating..."
    curl -X DELETE "$BASE_URL/offers/ratings/$RATING_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $AUTH_TOKEN"
else
    echo "Failed to create rating or extract ID"
fi

# Test 5: Get All Ratings for Offer (no auth required)
echo "Testing Get All Ratings for Offer..."
curl -X GET "$BASE_URL/offers/ratings/offer/1?limit=5&page=1" \
  -H "Content-Type: application/json"
```

## Error Handling Examples

### Handle Validation Errors
```bash
# Test missing required fields
curl -X POST "$BASE_URL/offers/ratings/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{"rating": 4}'  # Missing offer_id

# Test invalid rating (outside 1-5 range)
curl -X POST "$BASE_URL/offers/ratings/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{"offer_id": 1, "rating": 10}'

# Test duplicate rating
curl -X POST "$BASE_URL/offers/ratings/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{"offer_id": 1, "rating": 4}'
```

## One User One Time Rating Implementation

### ✅ Correct Behavior Understanding:
- **One User + One Offer = One Rating** (each user can rate each offer only once)
- **Different Users + Same Offer = Multiple Ratings** (different users can rate the same offer)
- **New Offer = Any User Can Rate** (first time rating for any user is allowed)

### Example Scenarios:
```
Offer #28 exists

User #36 → Can rate Offer #28 once ✅
User #36 → Cannot rate Offer #28 again ❌ (duplicate)
User #45 → Can rate Offer #28 once ✅ (different user)
User #67 → Can rate Offer #28 once ✅ (another user)
User #36 → Can rate Offer #50 once ✅ (different offer)
```

### Database Level Protection
The system enforces this through a composite unique constraint:

```sql
ALTER TABLE offer_ratings ADD CONSTRAINT offer_ratings_offer_id_user_id 
UNIQUE (offer_id, user_id);
```

This constraint means:
- **Key:** `(offer_id, user_id)` must be unique
- **Different users can rate same offer** ✅
- **Same user cannot rate same offer twice** ❌

### createOfferRating Function Flow
```javascript
const createOfferRating = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
        const { offer_id, rating, review_text } = req.body;
        const user_id = req.user?.userId; // Get user from JWT token

        // 1. Validate required fields
        if (!offer_id || !rating) {
            await transaction.rollback();
            return RESPONSE.error(res, 'Required fields missing', 400);
        }

        // 2. Check if user already rated this specific offer
        const existingRating = await db.OfferRating.findOne({
            where: { offer_id, user_id } // Unique combination check
        });

        // 3. Logic Flow:
        //    if (existingRating != null) → User already rated this offer
        //    if (existingRating == null) → User hasn't rated yet, proceed to create
        
        if (existingRating) {
            // User has already rated this offer - BLOCK creation
            await transaction.rollback();
            return RESPONSE.error(res, 'User has already rated this offer', 409);
        }

        // 4. existingRating == null means:
        //    ✅ User hasn't rated this offer yet
        //    ✅ Safe to proceed with creation
        //    ✅ Create new rating (database enforces uniqueness)
        const ratingRecord = await db.OfferRating.create({
            offer_id,
            user_id,
            rating,
            review_text: review_text || null,
            created_by: user_id,
            updated_by: null
        }, { transaction });

        await transaction.commit();
        return RESPONSE.success(res, 1036, ratingRecord, 201);
        
    } catch (error) {
        await transaction.rollback();
        // Handle duplicate rating errors (race condition)
        if (error.name === 'SequelizeUniqueConstraintError' || error.code === '23505') {
            return RESPONSE.error(res, 'User has already rated this offer', 409);
        }
        return RESPONSE.error(res, 2999, 500, error);
    }
};
```

### Decision Flow Diagram:
```
Start
  ↓
Validate offer_id & rating
  ↓
Check existingRating (findOne offer_id + user_id)
  ↓
if (existingRating != null) {
    ❌ User already rated → Return 409 Error
} else { // existingRating == null
    ✅ Safe to create → Proceed to create rating
}
  ↓
Success → Return 201 Created
```

### Practical Examples:

**Scenario 1: First Time Rating**
```javascript
// User #36 trying to rate Offer #28 for first time
const existingRating = await db.OfferRating.findOne({
    where: { offer_id: 28, user_id: 36 }
});
// Result: existingRating = null

if (existingRating) {
    // This block is SKIPPED (existingRating is null)
    return RESPONSE.error(res, 'User has already rated this offer', 409);
}
// This code EXECUTES - create the rating
const ratingRecord = await db.OfferRating.create({...});
```

**Scenario 2: Duplicate Rating Attempt**
```javascript
// User #36 trying to rate Offer #28 again
const existingRating = await db.OfferRating.findOne({
    where: { offer_id: 28, user_id: 36 }
});
// Result: existingRating = {id: 123, offer_id: 28, user_id: 36, rating: 4, ...}

if (existingRating) {
    // This block EXECUTES - return error
    await transaction.rollback();
    return RESPONSE.error(res, 'User has already rated this offer', 409);
}
// This code is SKIPPED - no rating creation
```

**Key Points:**
- ✅ **existingRating == null** → Safe to create rating
- ❌ **existingRating != null** → Return 409 error
- 🔄 Database constraint provides backup protection for race conditions

### Rating System Rules:
1. **✅ User #36 can rate Offer #28 once**
2. **❌ User #36 cannot rate Offer #28 again** (409 Conflict)
3. **✅ User #45 can rate Offer #28 once** (different user)
4. **✅ User #36 can rate Offer #30 once** (different offer)
5. **❌ User #36 cannot rate Offer #30 again** (409 Conflict)

### To Change Your Rating:
Instead of creating duplicate ratings, update your existing rating:
```bash
# Find your rating first
curl -X GET "$BASE_URL/offers/ratings/user/$USER_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN"

# Then update your rating
curl -X PUT "$BASE_URL/offers/ratings/$RATING_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{"rating": 5, "review_text": "Updated rating!"}'
```

## Bug Fixes Applied

### Issue 1: PostgreSQL Type Error
A bug was found and fixed in the `createOfferRating` controller where `updated_by` was incorrectly set to the string `'null'` instead of an actual `null` value, causing PostgreSQL type errors.

**Before (buggy code):**
```javascript
updated_by: 'null'
```

**After (fixed code):**
```javascript
updated_by: null
```

### Issue 2: Soft Delete and Rating Restoration
**Problem:** Users couldn't create new ratings after deleting their existing ones due to unique constraint violations.

**Solution:** Implemented soft delete functionality with intelligent restoration:
- Check for active ratings (`deleted_at: null`) before allowing new ratings
- If a deleted rating exists, restore it with new data instead of creating duplicate
- All queries now exclude deleted ratings by default

**Smart Rating Creation Logic:**
```javascript
// Check for active ratings (not deleted)
const existingRating = await db.OfferRating.findOne({
    where: { offer_id, user_id, deleted_at: null }
});

if (existingRating) {
    return RESPONSE.error(res, 'User has already rated this offer', 409);
}

// Check for deleted ratings
const deletedRating = await db.OfferRating.findOne({
    where: { offer_id, user_id }
});

if (deletedRating && deletedRating.deleted_at) {
    // Restore deleted rating with new data
    await deletedRating.update({
        rating,
        review_text: review_text || null,
        deleted_at: null,  // Restore the record
        updated_by: user_id
    });
} else {
    // Create new rating
    const ratingRecord = await db.OfferRating.create({...});
}
```

### Issue 3: Race Condition and Unique Constraint Error Handling
**Problem:** Race condition where application-level check passes but database constraint is violated by concurrent requests.

**Solution:** Enhanced error handling to properly catch both Sequelize and PostgreSQL unique constraint violations.

**Final Error Handling:**
```javascript
} catch (error) {
    await transaction.rollback();
    // Handle unique constraint violation (race condition or duplicate attempt)
    if (error.name === 'SequelizeUniqueConstraintError' || error.code === '23505') {
        return RESPONSE.error(res, 'User has already rated this offer', 409);
    }
    return RESPONSE.error(res, 2999, 500, error);
}
```

## New Soft Delete Features

### Rating System Behavior:

#### Scenario 1: First Time Rating
```javascript
// User #36 rates Offer #28 for first time
✅ Create new rating successfully
```

#### Scenario 2: Duplicate Rating (Active)
```javascript
// User #36 tries to rate Offer #28 again (while rating is active)
❌ Error 409 "User has already rated this offer"
```

#### Scenario 3: Rating After Deletion (NEW!)
```javascript
// User #36 deletes their rating, then tries to rate again
✅ Restore deleted record with new data instead of creating new one
```

### Complete Rating Workflow:
1. **Create Rating:** POST `/offers/ratings/` (allows if no active rating exists)
2. **Update Rating:** PUT `/offers/ratings/:id` (modify existing active rating)
3. **Delete Rating:** DELETE `/offers/ratings/:id` (soft delete - sets deleted_at)
4. **Create After Delete:** POST `/offers/ratings/` (restores deleted record with new data)

### For Users Who Want to Change Their Rating:
```bash
# Option 1: Update existing rating (recommended)
curl -X PUT "$BASE_URL/offers/ratings/123" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{"rating": 5, "review_text": "Updated review!"}'

# Option 2: Delete and recreate (also works now)
curl -X DELETE "$BASE_URL/offers/ratings/123" \
  -H "Authorization: Bearer $AUTH_TOKEN"

# Then create new rating (will restore the deleted record)
curl -X POST "$BASE_URL/offers/ratings/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{"offer_id": 28, "rating": 5, "review_text": "New rating!"}'
```

## Authentication Notes

- All endpoints except `GET /offers/ratings/offer/:offer_id` require authentication
- Use Bearer token in the Authorization header
- Token should be obtained from the login endpoint: `POST /api/v1/auth/login`

## Response Format

All endpoints return responses in the following format:
```json
{
  "success": true/false,
  "code": "response_code",
  "data": {...},
  "message": "response_message"
}
```

### Success Response Example (Create Rating)
```json
{
  "success": true,
  "code": 1036,
  "data": {
    "id": 123,
    "offer_id": 1,
    "user_id": 456,
    "rating": 4,
    "review_text": "Great offer! Very satisfied with the service.",
    "created_at": "2025-11-20T04:04:46.000Z",
    "ratingUser": {
      "id": 456,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    },
    "Offer": {
      "id": 1,
      "offer_title": "50% off on Electronics"
    }
  },
  "message": "Rating created successfully"
}
```

### Error Response Examples
```json
{
  "success": false,
  "code": 1041,
  "data": null,
  "message": "Required fields missing"
}
```

```json
{
  "success": false,
  "code": 409,
  "data": null,
  "message": "User has already rated this offer"
}