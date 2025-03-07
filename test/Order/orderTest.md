<!-- eslint-disable style/no-tabs -->
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
✔️ Place Order(Success)Order placed, stock updated
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
❌ Place Order(Unauthorized)Error: "Please log in"
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
❌ Place Order(Invalid Book ID)Error: "Invalid book ID"
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
❌ Place Order(Book Not Found)Error: "Book not found"
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
❌ Place Order(Not Enough Stock)Error: "Only X copies available"
==========================================================================================================
# 6. Place Order - No Books in Request
✅ Expected: API should prevent empty orders.
POST /order
Authorization: Bearer <valid_token>
Content-Type: application/json
body: {
    "books": []
}
❌ Place Order(No Books in Order)Error: Validation error >> "Must contain at least one book"
==========================================================================================================
==========================================================================================================
# 7. Get Order History - Success
✅ Expected: API should return all past orders for the logged-in user.
GET /order
Authorization:Bearer<valid_token>
✅ Get Order History(Success)Returns order history
==========================================================================================================
# 8. Get Order History - No Orders Found
✅ Expected: API should return an empty array "if the user has no orders".
GET /order
Authorization: Bearer <valid_token>
✅ Get Order History(No Orders)Returns empty list
==========================================================================================================
# 9. Get Order History - Unauthorized
✅ Expected: API should reject requests without authentication.
GET /order
❌ Get Order History (Unauthorized) Error: "Please log in"
==========================================================================================================
==========================================================================================================
# 10. Update Order Status - Success Case
✅ Expected: API should successfully update the order status.
PUT /order/:orderId/status
Authorization: Bearer <valid_admin_token>
Content-Type: application/json
Body: {
  "status": "completed"
}
✔️ Update Order Status (Success): Status of order updated to "completed".
==========================================================================================================
# 11. Update Order Status - Unauthorized (Non-admin)
✅ Expected: API should reject the request if the user is not an admin.
PUT /order/:orderId/status
Authorization: Bearer <valid_user_token>
Content-Type: application/json
Body: {
  "status": "completed"
}
❌ Update Order Status (Unauthorized): Error: "Access denied. You don't have the required role."
==========================================================================================================
# 12. Update Order Status - Invalid Order ID
✅ Expected: API should reject requests with an invalid order ID.
PUT /order/invalid-order-id/status
Authorization: Bearer <valid_admin_token>
Content-Type: application/json
Body: {
  "status": "completed"
}
❌ Update Order Status (Invalid Order ID): Error: "Order not found."
==========================================================================================================
# 13. Update Order Status - Invalid Status
✅ Expected: API should reject requests with an invalid order status.
PUT /order/:orderId/status
Authorization: Bearer <valid_admin_token>
Content-Type: application/json
Body: {
  "status": "invalidStatus"
}
❌ Update Order Status (Invalid Status): Error: "Invalid status."
==========================================================================================================
# 14. Update Order Status - No Status Provided
✅ Expected: API should reject requests if the status field is missing.
PUT /order/:orderId/status
Authorization: Bearer <valid_admin_token>
Content-Type: application/json
Body:
{}
❌ Update Order Status (No Status Provided): Error: "Status is required."
==========================================================================================================
# 15. Update Order Status - Success (Status Transition)
✅ Expected: API should successfully update the status from "pending" to "completed."
PUT /order/:orderId/status
Authorization: Bearer <valid_admin_token>
Content-Type: application/json
Body:
{
  "status": "completed"
}
✔️ Update Order Status (Transition): Order status updated from "pending" to "completed".
==========================================================================================================
# 16. Update Order Status - Unauthorized Request (No Token)
✅ Expected: API should reject requests with no token or an invalid token.
PUT /order/:orderId/status
Authorization: Bearer <no_token_or_invalid_token>
Content-Type: application/json
Body:{
  "status": "completed"
}
❌ Update Order Status (Unauthorized): Error: "Please log in first."
==========================================================================================================
# 17. Update Order Status - Order Already Canceled
✅ Expected: API should prevent updating the status if the order is already canceled.
PUT /order/:orderId/status
Authorization: Bearer <valid_admin_token>
Content-Type: application/json
Body: {
  "status": "canceled"
}
❌ Update Order Status (Already Canceled): Error: "Order is already canceled."
==========================================================================================================
18. Create Payment Intent - Valid Admin Request
✅ Expected: API should successfully create a payment intent and return a client secret when provided with a valid amount.
POST /payment-intent
Authorization: Bearer <valid_admin_token>
Content-Type: application/json
Body:
{
  "amount": 5000
}
Response:
{
  "client_secret": "pi_1H8eD3gI3N47gUSDFgRZZ5cR_secret_key"
}
==========================================================================================================
19. Create Payment Intent - Missing Amount Field
✅ Expected: API should return an error when the amount field is missing in the request body.
POST /payment-intent
Authorization: Bearer <valid_admin_token>
Content-Type: application/json
Body: {}
Response:
{
  "error": "Amount is required"
}
==========================================================================================================
20. Create Payment Intent - Invalid Amount Value
✅ Expected: API should return an error when the amount value is invalid (e.g., negative or zero).
POST /payment-intent
Authorization: Bearer <valid_admin_token>
Content-Type: application/json
Body:
{
  "amount": -100
}
Response:
{
  "error": "This value must be greater than or equal to 1"
}
==========================================================================================================
21. Create Payment Intent - Unauthorized Admin Request
✅ Expected: API should return a 403 error if a non-admin user tries to create a payment intent.
POST /payment-intent
Authorization: Bearer <invalid_user_token>
Content-Type: application/json
Body:
{
  "amount": 10000
}
Response:
{
  "error": "Forbidden, Admins only"
}
