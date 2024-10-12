const Item = require('../models/Item');
const Bidding = require('../models/Bidding');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Place a bid
const placeBid = async (req, res) => {
  try {
    const { userId, bidPrice } = req.body;
    const { id: itemId } = req.params;

    // Find the item being bid on
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Check if the auction has ended
    const currentTime = new Date();
    if (item.bidEndTime < currentTime) {
      return res.status(400).json({ message: "Bidding time has ended" });
    }

    // Ensure new bid is higher than current highest bid or starting bid
    if (bidPrice <= item.currentBid || bidPrice <= item.startingBid) {
      return res.status(400).json({ message: "Bid must be higher than the current or starting bid" });
    }

    let newBid;

    // Prevent users from bidding on their own item
    if (item.userId.toString() !== userId) {
      // Check if there's an existing bid by this user
      const existingBid = await Bidding.findOne({ userId, itemId });
      if (existingBid) {
        // Update existing bid
        existingBid.bidPrice = bidPrice;
        await existingBid.save();
        newBid = existingBid; // Use the updated bid as the latest bid
      } else {
        // Create a new bid
        newBid = new Bidding({
          itemId,
          userId,
          bidPrice
        });
        await newBid.save();
      }
      
      // Update the item's current bid and reference to the latest bid
      item.currentBid = bidPrice;
      item.bid = newBid._id; 
      await item.save();

      res.status(201).json({ message: "Bid placed successfully", bid: newBid });
    } else {
      return res.status(400).json({ message: "You cannot bid on your own item" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error placing bid", error: error.message });
  }
};


// Get remaining time for an item
const getRemainingTime = async (req, res) => {
  try {
    // Extract the id from req.params
    const { id: itemId } = req.params;

    console.log(itemId);

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    console.log(item);

    const currentTime = new Date();
    const bidEndTime = new Date(item.bidEndTime);
    const remainingTimeInMs = bidEndTime - currentTime;

    if (remainingTimeInMs <= 0) {
      return res.status(200).json({ message: 'Bidding time has ended', remainingTime: 0 });
    }

    // Calculate days, hours, and minutes from remainingTimeInMs
    const remainingDays = Math.floor(remainingTimeInMs / (1000 * 60 * 60 * 24));
    const remainingHours = Math.floor((remainingTimeInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const remainingMinutes = Math.floor((remainingTimeInMs % (1000 * 60 * 60)) / (1000 * 60));

    // Send formatted remaining time
    res.status(200).json({
      
        days: remainingDays,
        hours: remainingHours,
        minutes: remainingMinutes,
      
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching remaining time', error: error.message });
  }
};

const sendEmail = async (recipientEmail, subject, htmlContent) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mall360shoppy@gmail.com",
      pass: "bhdn dfjx yrmt wukf",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: "mall360shoppy@gmail.com",
    to: recipientEmail,
    subject: subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

// Main function to identify the highest bidder and send notification
const identifyHighestBidder = async () => {
  try {
    const currentTime = new Date();
    console.log("Checking for expired auctions...");

    // Fetch all items where the bidding time has ended and the item is not sold yet
    const expiredAuctions = await Item.find({
      bidEndTime: { $lte: currentTime },
      sold: false,
    });

    // Iterate through each expired auction
    for (const item of expiredAuctions) {
      // Fetch all bids associated with the item
      const bids = await Bidding.find({ itemId: item._id }).sort({ bidPrice: -1 });

      if (bids.length > 0) {
        const highestBid = bids[0]; // The first bid is the highest because of the descending sort

        // Mark the item as sold and update the current bid
        item.currentBid = highestBid.bidPrice;
        item.sold = true;
        await item.save();

        // Populate the user details of the highest bidder
        const highestBidder = await User.findById(highestBid.userId);
        const seller = await User.findById(item.userId);

        // Prepare the email content
        const htmlContent = `
          <h1>Congratulations, ${highestBidder.name}!</h1>
          <p>You have won the auction for the item: <strong>${item.name}</strong>.</p>
          <p>Your winning bid was: <strong>$${highestBid.bidPrice.toFixed(2)}</strong>.</p>
          <p>Please proceed to complete the purchase by clicking the link below:</p>
          <p>To complete your purchase</p>
          <p>Contact Seller : ${seller.name}</p>
          <p>Email: ${seller.email}</p>
          <p>Phone: ${seller.phoneNumber}</p>
          <br><br>
          <p>Thank you for using our marketplace!</p>
          <p>Best regards,<br>Your BidBazzar Team</p>
        `;

        // Send an email to the highest bidder
        await sendEmail(
          highestBidder.email,
          'Congratulations! You won the auction',
          htmlContent
        );

        console.log(`Auction for item "${item.name}" has ended. Highest bidder: ${highestBidder.name}, Bid: ${highestBid.bidPrice}`);
      } else {
        // If no bids were placed, just mark the item as sold
        item.sold = true;
        await item.save();

        console.log(`Auction for item "${item.name}" has ended with no bids.`);
      }
    }
  } catch (error) {
    console.error('Error identifying the highest bidder:', error);
  }
};

// Set an interval to check for expired auctions every 10 seconds
setInterval(() => {
  identifyHighestBidder();
}, 10000);
 



// Get all bids for an item
const getBidsForItem = async (req, res) => {
  try {
    const { id: itemId } = req.params;

    // Fetch bids for the item and sort by bidPrice in descending order
    const bids = await Bidding.find({ itemId })
      .populate('userId')
      .sort({ bidPrice: -1}); // Sort by bidPrice, then by createdAt for ties

    if (!bids.length) {
      return res.status(404).json({ message: 'No bids found for this item' });
    }

    res.status(200).json(bids);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bids', error: error.message });
  }
};


// Close auction (optional feature if you want to manually close an auction)
const closeAuction = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.sold='true'; // Manually set the end time to now
    await item.save();

    res.status(200).json({ message: 'Auction closed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error closing auction', error: error.message });
  }
};

module.exports = {
  placeBid,
  getRemainingTime,
  getBidsForItem,
  closeAuction
};
