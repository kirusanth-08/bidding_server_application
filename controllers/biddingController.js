const Item = require('../models/Item');
const Bidding = require('../models/Bidding');

// Place a bid
const placeBid = async (req, res) => {
  try {
    const { itemId, userId, bidPrice } = req.body;

    // Find the item being bid on
    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if the auction has ended
    const currentTime = new Date();
    if (item.bidEndTime < currentTime) {
      return res.status(400).json({ message: 'Bidding time has ended' });
    }

    // Ensure new bid is higher than current highest bid or starting bid
    if (bidPrice <= item.currentBid || bidPrice <= item.startingBid) {
      return res.status(400).json({ message: 'Bid must be higher than the current or starting bid' });
    }

    // Create new bid entry
    const newBid = new Bidding({
      itemId,
      userId,
      bidPrice
    });

    await newBid.save();

    // Update the item's current bid
    item.currentBid = bidPrice;
    item.bid = newBid._id; // Update the reference to the latest bid
    await item.save();

    res.status(201).json({ message: 'Bid placed successfully', bid: newBid });
  } catch (error) {
    res.status(500).json({ message: 'Error placing bid', error: error.message });
  }
};

// Get remaining time for an item
const getRemainingTime = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const currentTime = new Date();
    const remainingTime = item.bidEndTime - currentTime;

    if (remainingTime <= 0) {
      return res.status(200).json({ message: 'Bidding time has ended', remainingTime: 0 });
    }

    // Send remaining time in milliseconds
    res.status(200).json({ remainingTime });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching remaining time', error: error.message });
  }
};

// Get all bids for an item
const getBidsForItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const bids = await Bidding.find({ itemId }).populate('userId').sort({ createdAt: -1 });

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

    item.bidEndTime = new Date(); // Manually set the end time to now
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
