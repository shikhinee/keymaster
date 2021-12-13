import dbConnect from "@/utils/database";
import users from "@/models/users";
import { getSession } from "next-auth/react";
import { hashPassword } from "@/utils/auth";

dbConnect();

const requestModHandler = async (req, res) => {
  const {
    method,
    query: { id },
  } = req;
  const session = await getSession({ req });

  if (session.user.email) {
    switch (method) {
      case "GET":
        try {
          const user = await users.findOne({ _id: id });
          res.status(200).json({ success: true, data: user });
        } catch (error) {
          console.log(error);
          res.status(400).json({ success: false });
        }
        break;

      case "POST":
        try {
          const {
            firstName,
            lastName,
            photoLink,
            email,
            phoneNumber,
            password,
          } = req.body;
          if (
            password == null ||
            password.equals("") ||
            password.trim().equals("")
          ) {
            return res
              .status(400)
              .success({ success: true, msg: "password can not be empty" });
          }

          const hashedPass = await hashPassword(password);
          const myUser = {
            firstName,
            lastName,
            email,
            phoneNumber,
            photoLink,
            password: hashedPass,
          };

          console.log(myUser);

          // await users.updateOne({ _id: id }, myUser);
          res
            .status(200)
            .json({ success: true, msg: "Medeeg amjilttai soliloo" });
        } catch (error) {
          console.log(error);
          res.status(400).json({ success: false });
        }
        break;

      default:
        res.status(400).json({ success: false });
        break;
    }
  } else {
    return res
      .status(401)
      .json({ success: false, msg: "You dont have a access" });
  }
};

export default requestModHandler;
