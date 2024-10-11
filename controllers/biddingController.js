const Item = require('../models/Item');
const Bidding = require('../models/Bidding');

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
