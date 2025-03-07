**Test Cases for Order Section**
1️⃣ Place Order (placeOrder)
Handles:
✅ Invalid Book ID → Checks if the provided book _id is valid.
✅ Book Not Found → Ensures the book exists in the database.
✅ Out of Stock → Ensures enough stock is available.
✅ Stock Deduction → Decreases stock only when the order is successfully placed.

# 1. Place Order - Success Case
✅ Expected: Order is placed successfully, books' stock is reduced.
POST /order
Authorization: <valid_token>
Content-Type: application/json
Body: {
    "books": [
        { "book": "65f8b1c2d3e4f5g6h7i8j9a1", "quantity": 2 },
        { "book": "65f8b1c2d3e4f5g6h7i8j9a2", "quantity": 1 }
    ]
}
✔️ Place Order (Success)	Order placed, stock updated
==========================================================================================================
# 2. Place Order - Invalid Token (Unauthorized)
✅ Expected: API should reject the request due to missing authentication.
POST /order
Content-Type: application/json
Body: {
    "books": [
        { "book": "65f8b1c2d3e4f5g6h7i8j9a1", "quantity": 1 }
    ]
}
❌ Place Order (Unauthorized)	Error: "Please log in"
==========================================================================================================
# 3. Place Order - Invalid Book ID
✅ Expected: API should reject orders with invalid MongoDB ObjectId.
POST /order
Authorization: Bearer <valid_token>
Content-Type: application/json
body: {
    "books": [
        { "book": "invalid-book-id", "quantity": 1 }
    ]
}
❌ Place Order (Invalid Book ID)	Error: "Invalid book ID"
==========================================================================================================
# 4. Place Order - Book Not Found
✅ Expected: API should return an error if the book ID is valid but does not exist.
POST /order
Authorization: Bearer <valid_token>
Content-Type: application/json
body: {
    "books": [
        { "book": "65f8b1c2d3e4f5g6h7i8j9a5", "quantity": 1 }
    ]
}
❌ Place Order (Book Not Found)	Error: "Book not found"
==========================================================================================================
# 5. Place Order - Not Enough Stock
✅ Expected: API should prevent ordering more books than available stock.
POST /order
Authorization: Bearer <valid_token>
Content-Type: application/json
body: {
    "books": [
        { "book": "65f8b1c2d3e4f5g6h7i8j9a1", "quantity": 1000 }
    ]
}
❌ Place Order (Not Enough Stock)	Error: "Only X copies available"
==========================================================================================================
# 6. Place Order - No Books in Request
✅ Expected: API should prevent empty orders.
POST /order
Authorization: Bearer <valid_token>
Content-Type: application/json
body: {
    "books": []
}
❌ Place Order (No Books in Order)	Error: Validation error >> "Must contain at least one book"
==========================================================================================================
# 7. Get Order History - Success
✅ Expected: API should return all past orders for the logged-in user.
GET /order
Authorization: Bearer <valid_token>
✅ Get Order History (Success)	Returns order history
==========================================================================================================
# 8. Get Order History - No Orders Found
✅ Expected: API should return an empty array "if the user has no orders".
GET /order
Authorization: Bearer <valid_token>
✅ Get Order History (No Orders)	Returns empty list
==========================================================================================================
# 9. Get Order History - Unauthorized
✅ Expected: API should reject requests without authentication.
GET /order
❌ Get Order History (Unauthorized)	Error: "Please log in"