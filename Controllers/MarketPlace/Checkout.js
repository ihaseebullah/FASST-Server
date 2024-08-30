const { sendNotificationMail } = require("../../Utils/sendMail");

const Checkout = async function (req, res) {
    try {
        // Destructure necessary details from req.body
        const { cart, delivery, email } = req.body;

        // Create a formatted string for cart items
        const cartDetails = cart.map(item => `
            - Product: ${item.title}
              Price: $${item.price.toFixed(2)}
              Quantity: ${item.quantity}
              Description: ${item.description}
        `).join("\n");

        // Create the full order details message
        const orderDetailsMessage = `
            Order placed by: ${delivery.recipientName}
            Delivery Address: ${delivery.deliveryAddress}
            Customer Email: ${email}

            Order Details:
            ${cartDetails}
        `;

        // Send email notification
        await sendNotificationMail(
            "e7409029@gmail.com",
            `Products ordered by ${delivery.recipientName}!`,
            orderDetailsMessage
        );
        res.status(200).json({ message: "Order placed successfully!" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = Checkout;
