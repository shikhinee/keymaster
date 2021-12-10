import dbConnect from '@/utils/database'
import ageGroup from '@/models/ageGroup'

dbConnect();

const requestModHandler = async (req, res) => {
    const {
        method,
        query: { id },
    } = req;

    switch (method) {
        case "GET":
            try {
                const data = await ageGroup.findOne({ _id: id });
                res.status(200).json({ success: true, data: data });

            } catch (error) {
                console.log(error);
                res.status(400).json({ success: false })
            }
            break;

        case "POST":
            try {
                const { newAge } = req.body;
                if (!newAge) return res.status(200).json({ success: false, msg: "Missing age variable" });

                const ageCheck = await ageGroup.findOne({ _id: id });

                if (JSON.stringify(newAge) == JSON.stringify(ageCheck.age)) {
                    return res.status(200).json({ success: false, msg: "Same ageGroup entered" });
                }
                res.status(200).json({ success: true, data: newAge })

            } catch (error) {
                console.log(error);
                return res.status(400).json({ success: false })
            }
            break;

        default:
            res.status(400).json({ success: false });
            break;
    }
};

export default requestModHandler;
