const { INSIGHT, STEPS_RECORD } = require("../../Models/Insights");
const USER = require("../../Models/User");

function formatDate(date) {
  const options = { year: "numeric", month: "numeric", day: "numeric" };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

const updateStepsCount = async (req, res) => {
  try {
    const { insightId, steps, userId } = req.params;
    const today = formatDate(new Date());
    const user = await USER.findById(userId);
    let insight = await INSIGHT.findById(user.INSIGHT);

    if (!insight) {
      insight = new INSIGHT({
        userId,
        stepsGoal: 1000,
      });
      insight = await insight.save();
      await USER.findByIdAndUpdate(userId, { INSIGHT: insight._id });
    }

    let todayRecord = await STEPS_RECORD.findOne({ userId, date: today });
    if (!todayRecord) {
      todayRecord = new STEPS_RECORD({
        userId,
        date: today,
        steps: parseInt(steps),
      });
      await todayRecord.save().then(async (savedRecord) => {
        insight = await INSIGHT.findByIdAndUpdate(user.INSIGHT, {
          $push: { STEPS_RECORD: savedRecord._id },
        });
        return res.json(savedRecord);
      });
    } else {
      todayRecord.steps += parseInt(steps);
      await todayRecord.save().then((updatedRecord) => {
        return res.json(updatedRecord);
      })
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = { updateStepsCount };
