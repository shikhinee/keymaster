import dbConnect from '@/utils/database'
import users from '@/models/users'
import competition from '@/models/competition'
import { getSession } from "next-auth/react"


dbConnect();

const requestModHandler = async (req, res) => {
    const {
        method,
        query: { id },
    } = req;
    const session = await getSession({ req });
    console.log(id);
    if (session.user.isAdmin) {
        switch (method) {

            case "POST":
                try {

                    const { type, ageGroup, record, competitionName, status } = req.body;

                    if (status) {
                        const myCompDetial = { type, ageGroup, record, competitionName };

                        await users.updateOne({ _id: id }, { $push: { lastComp: myCompDetial } });
                        return res.status(200).json({ success: true, data: myCompDetial })
                    } else {
                        // await users.updateOne(
                        //     { _id: id },
                        //     { $pull: { lastComp: { _id: competitionName } } }
                        // );
                        return res.status(200).json({ success: true, msg: "amjilttai ustgalaa" });
                    }


                } catch (error) {
                    console.log(error);
                    res.status(400).json({ success: false });
                }
                break;

            default:
                res.status(400).json({ success: false })
                break;
        }

    } else {
        return res.status(401).json({ success: false, msg: "You dont have a access" });
    }



};

export default requestModHandler;
