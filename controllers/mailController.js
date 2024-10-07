const nodemailer = require('nodemailer');
const Item = require('../models/Item');
const Bidding = require('../models/Bidding');
const User = require('../models/User'); // Assuming you have a User model for email lookup

// Function to send email notifications
const sendEmail = async (recipientEmail, subject, htmlContent) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mall360shoppy@gmail.com",
      pass: "bhdn dfjx yrmt wukf",
    },
    tls: {
      rejectUnauthorized: false, // Ignore self-signed certificate error
    },
  });

  // Setup email data
  const mailOptions = {
    from: "mall360shoppy@gmail.com",
    to: recipientEmail,
    subject: subject,
    html: htmlContent,
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

// Controller to check for bid end time and notify highest bidder
const notifyHighestBidder = async (req, res) => {
  try {
    const { itemId } = req.params;

    // Find the item
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if the auction has ended
    const currentTime = new Date();
    if (item.bidEndTime < currentTime && !item.sold) {
      // Mark the item as sold
      item.sold = true;
      await item.save();

      // Find the highest bid for this item
      const highestBid = await Bidding.findOne({ itemId: item._id })
        .sort({ bidPrice: -1 }) // Sort by bidPrice in descending order
        .populate('userId'); // Populate user details

      if (!highestBid) {
        return res.status(404).json({ message: 'No bids found for this item' });
      }

      const highestBidder = highestBid.userId; // Get the user who placed the highest bid

      const htmlContent = `
        <h1>Congratulations, ${highestBidder.name}!</h1>
        <p>You have won the auction for the item: <strong>${item.name}</strong>.</p>
        <p>Your winning bid was: <strong>$${highestBid.bidPrice.toFixed(2)}</strong>.</p>
        <p>Please proceed to complete the purchase by clicking the link below:</p>
        <a href="https://yourmarketplace.com/complete-purchase/${item._id}">Complete Your Purchase</a>
        <br><br>
        <p>Thank you for using our marketplace!</p>
        <p>Best regards,<br>Your Marketplace Team</p>
      `;

      // Notify the highest bidder via email with HTML content
      await sendEmail(
        highestBidder.email,
        'Congratulations! You won the auction',
        htmlContent
      );

      res.status(200).json({
        message: 'Auction ended. Highest bidder notified via email.',
        item,
        highestBidder
      });
    } else {
      res.status(400).json({ message: 'Auction is still ongoing or item already sold' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error notifying highest bidder', error: error.message });
  }
};


module.exports = {
  notifyHighestBidder
};
